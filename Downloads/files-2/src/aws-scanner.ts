// LoxeAI EVT — AWS Evidence Collection Engine
// Handles STS AssumeRole and read-only API calls into customer AWS accounts

import { Env, AWSCredentials, ScanProgress } from './types';

// ============================================================
// AWS Signature V4 Implementation for Cloudflare Workers
// ============================================================

async function hmacSha256(key: ArrayBuffer | Uint8Array, data: string): Promise<ArrayBuffer> {
  // Ensure key is a BufferSource (ArrayBuffer or Uint8Array backed by ArrayBuffer)
  let bufferSource: BufferSource;
  if (key instanceof Uint8Array) {
    // Ensure the buffer is an ArrayBuffer, not just ArrayBufferLike
    const arrayBuffer = key.buffer instanceof ArrayBuffer ? key.buffer : new Uint8Array(key).buffer;
    bufferSource = new Uint8Array(arrayBuffer, key.byteOffset, key.byteLength);
  } else {
    bufferSource = key;
  }
  const cryptoKey = await crypto.subtle.importKey('raw', bufferSource, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data));
}

async function sha256(data: string): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function getSignatureKey(secretKey: string, dateStamp: string, region: string, service: string): Promise<ArrayBuffer> {
  const kDate = await hmacSha256(new TextEncoder().encode('AWS4' + secretKey), dateStamp);
  const kRegion = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, service);
  return await hmacSha256(kService, 'aws4_request');
}

interface AWSRequestOptions {
  service: string;
  region: string;
  method: string;
  path: string;
  body?: string;
  headers?: Record<string, string>;
  query?: Record<string, string>;
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken?: string;
  };
}

async function signedAWSRequest(opts: AWSRequestOptions): Promise<Response> {
  const now = new Date();
  const dateStamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const dateOnly = dateStamp.slice(0, 8);

  const host = opts.service === 'iam' || opts.service === 'sts'
    ? `${opts.service}.amazonaws.com`
    : `${opts.service}.${opts.region}.amazonaws.com`;

  let url = `https://${host}${opts.path}`;
  if (opts.query) {
    const qs = Object.entries(opts.query).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
    url += `?${qs}`;
  }

  const bodyHash = await sha256(opts.body || '');
  const allHeaders: Record<string, string> = {
    host,
    'x-amz-date': dateStamp,
    'x-amz-content-sha256': bodyHash,
    ...(opts.headers || {}),
  };

  if (opts.credentials.sessionToken) {
    allHeaders['x-amz-security-token'] = opts.credentials.sessionToken;
  }

  const signedHeaderKeys = Object.keys(allHeaders).sort().map(k => k.toLowerCase());
  const signedHeaders = signedHeaderKeys.join(';');
  const canonicalHeaders = signedHeaderKeys.map(k => `${k}:${allHeaders[k]}\n`).join('');

  const canonicalQueryString = opts.query
    ? Object.entries(opts.query).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')
    : '';

  const canonicalRequest = [
    opts.method,
    opts.path,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    bodyHash,
  ].join('\n');

  const credentialScope = `${dateOnly}/${opts.region}/${opts.service}/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    dateStamp,
    credentialScope,
    await sha256(canonicalRequest),
  ].join('\n');

  const signingKey = await getSignatureKey(opts.credentials.secretAccessKey, dateOnly, opts.region, opts.service);
  const signatureBuffer = await hmacSha256(signingKey, stringToSign);
  const signature = Array.from(new Uint8Array(signatureBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

  const authHeader = `AWS4-HMAC-SHA256 Credential=${opts.credentials.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const fetchHeaders: Record<string, string> = { ...allHeaders, Authorization: authHeader };
  delete fetchHeaders['host'];

  return fetch(url, {
    method: opts.method,
    headers: fetchHeaders,
    body: opts.body || undefined,
  });
}

// ============================================================
// STS AssumeRole
// ============================================================

export async function assumeRole(env: Env, roleArn: string): Promise<AWSCredentials> {
  const params = new URLSearchParams({
    Action: 'AssumeRole',
    RoleArn: roleArn,
    RoleSessionName: 'LoxeAI-EVT-Scan',
    ExternalId: env.LOXE_EXTERNAL_ID,
    DurationSeconds: '3600',
    Version: '2011-06-15',
  });

  const queryObj: Record<string, string> = {};
  params.forEach((value, key) => { queryObj[key] = value; });

  const resp = await signedAWSRequest({
    service: 'sts',
    region: 'us-east-1',
    method: 'GET',
    path: '/',
    query: queryObj,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const text = await resp.text();
  if (!resp.ok) throw new Error(`STS AssumeRole failed: ${text}`);

  const accessKeyId = text.match(/<AccessKeyId>(.*?)<\/AccessKeyId>/)?.[1];
  const secretAccessKey = text.match(/<SecretAccessKey>(.*?)<\/SecretAccessKey>/)?.[1];
  const sessionToken = text.match(/<SessionToken>(.*?)<\/SessionToken>/)?.[1];
  const expiration = text.match(/<Expiration>(.*?)<\/Expiration>/)?.[1];

  if (!accessKeyId || !secretAccessKey || !sessionToken) {
    throw new Error('Failed to parse STS credentials from response');
  }

  return { accessKeyId, secretAccessKey, sessionToken, expiration: expiration || '' };
}

// ============================================================
// AWS API Call Helpers
// ============================================================

async function callAWSJSON(service: string, region: string, action: string, creds: AWSCredentials, extraHeaders?: Record<string, string>, body?: string): Promise<any> {
  const resp = await signedAWSRequest({
    service,
    region,
    method: 'POST',
    path: '/',
    body: body || '{}',
    headers: {
      'content-type': body ? 'application/x-amz-json-1.1' : 'application/x-amz-json-1.1',
      ...(extraHeaders || {}),
    },
    credentials: { ...creds },
  });
  return resp.json();
}

async function callAWSQuery(service: string, region: string, params: Record<string, string>, creds: AWSCredentials): Promise<string> {
  const resp = await signedAWSRequest({
    service,
    region,
    method: 'GET',
    path: '/',
    query: params,
    credentials: { ...creds },
  });
  return resp.text();
}

// ============================================================
// Service-Specific Scanners
// ============================================================

function truncateData(data: any, maxChars: number = 8000): string {
  const str = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  if (str.length <= maxChars) return str;
  return str.slice(0, maxChars) + '\n... [truncated — ' + str.length + ' chars total]';
}

export interface ServiceScanResult {
  service: string;
  region: string;
  items: Array<{
    item_type: string;
    status: string;
    resource_id: string;
    raw_data: string;
  }>;
  error?: string;
}

export async function scanIAM(creds: AWSCredentials): Promise<ServiceScanResult> {
  const items: ServiceScanResult['items'] = [];
  try {
    // List Users
    const usersXml = await callAWSQuery('iam', 'us-east-1', { Action: 'ListUsers', Version: '2010-05-08' }, creds);
    items.push({ item_type: 'list_users', status: 'collected', resource_id: 'all_users', raw_data: truncateData(usersXml) });

    // Password Policy
    const pwPolicyXml = await callAWSQuery('iam', 'us-east-1', { Action: 'GetAccountPasswordPolicy', Version: '2010-05-08' }, creds);
    items.push({ item_type: 'password_policy', status: 'collected', resource_id: 'account_password_policy', raw_data: truncateData(pwPolicyXml) });

    // List Roles
    const rolesXml = await callAWSQuery('iam', 'us-east-1', { Action: 'ListRoles', Version: '2010-05-08' }, creds);
    items.push({ item_type: 'list_roles', status: 'collected', resource_id: 'all_roles', raw_data: truncateData(rolesXml) });

    // List Policies
    const policiesXml = await callAWSQuery('iam', 'us-east-1', { Action: 'ListPolicies', Version: '2010-05-08', Scope: 'Local' }, creds);
    items.push({ item_type: 'list_policies', status: 'collected', resource_id: 'customer_policies', raw_data: truncateData(policiesXml) });

    // Extract usernames and check MFA + Access Keys for each
    const usernames = [...usersXml.matchAll(/<UserName>(.*?)<\/UserName>/g)].map(m => m[1]);
    for (const username of usernames.slice(0, 20)) { // cap at 20 users
      const mfaXml = await callAWSQuery('iam', 'us-east-1', { Action: 'ListMFADevices', UserName: username, Version: '2010-05-08' }, creds);
      items.push({ item_type: 'user_mfa', status: 'collected', resource_id: username, raw_data: truncateData(mfaXml) });

      const keysXml = await callAWSQuery('iam', 'us-east-1', { Action: 'ListAccessKeys', UserName: username, Version: '2010-05-08' }, creds);
      items.push({ item_type: 'user_access_keys', status: 'collected', resource_id: username, raw_data: truncateData(keysXml) });

      // Check access key last used for each key
      const keyIds = [...keysXml.matchAll(/<AccessKeyId>(.*?)<\/AccessKeyId>/g)].map(m => m[1]);
      for (const keyId of keyIds) {
        const lastUsedXml = await callAWSQuery('iam', 'us-east-1', { Action: 'GetAccessKeyLastUsed', AccessKeyId: keyId, Version: '2010-05-08' }, creds);
        items.push({ item_type: 'access_key_last_used', status: 'collected', resource_id: keyId, raw_data: truncateData(lastUsedXml) });
      }
    }
  } catch (e: any) {
    return { service: 'iam', region: 'global', items, error: e.message };
  }
  return { service: 'iam', region: 'global', items };
}

export async function scanCloudTrail(creds: AWSCredentials, region: string): Promise<ServiceScanResult> {
  const items: ServiceScanResult['items'] = [];
  try {
    const trailsXml = await callAWSQuery('cloudtrail', region, { Action: 'DescribeTrails', Version: '2013-11-01' }, creds);
    items.push({ item_type: 'describe_trails', status: 'collected', resource_id: region, raw_data: truncateData(trailsXml) });

    // Parse trail ARNs and get status
    const trailArns = [...trailsXml.matchAll(/<TrailARN>(.*?)<\/TrailARN>/g)].map(m => m[1]);
    for (const arn of trailArns.slice(0, 5)) {
      const name = arn.split('/').pop() || arn;
      const statusXml = await callAWSQuery('cloudtrail', region, { Action: 'GetTrailStatus', Name: name, Version: '2013-11-01' }, creds);
      items.push({ item_type: 'trail_status', status: 'collected', resource_id: name, raw_data: truncateData(statusXml) });
    }
  } catch (e: any) {
    return { service: 'cloudtrail', region, items, error: e.message };
  }
  return { service: 'cloudtrail', region, items };
}

export async function scanS3(creds: AWSCredentials): Promise<ServiceScanResult> {
  const items: ServiceScanResult['items'] = [];
  try {
    const bucketsXml = await callAWSQuery('s3', 'us-east-1', { Action: 'ListAllMyBuckets' }, creds);
    items.push({ item_type: 'list_buckets', status: 'collected', resource_id: 'all_buckets', raw_data: truncateData(bucketsXml) });

    // Parse bucket names
    const bucketNames = [...bucketsXml.matchAll(/<Name>(.*?)<\/Name>/g)].map(m => m[1]);
    for (const bucket of bucketNames.slice(0, 15)) { // cap at 15 buckets
      try {
        const versioningResp = await signedAWSRequest({
          service: 's3', region: 'us-east-1', method: 'GET', path: `/${bucket}`,
          query: { versioning: '' }, credentials: { ...creds },
        });
        const versioningXml = await versioningResp.text();
        items.push({ item_type: 'bucket_versioning', status: 'collected', resource_id: bucket, raw_data: truncateData(versioningXml) });
      } catch {}

      try {
        const encResp = await signedAWSRequest({
          service: 's3', region: 'us-east-1', method: 'GET', path: `/${bucket}`,
          query: { encryption: '' }, credentials: { ...creds },
        });
        const encXml = await encResp.text();
        items.push({ item_type: 'bucket_encryption', status: 'collected', resource_id: bucket, raw_data: truncateData(encXml) });
      } catch {}

      try {
        const pubResp = await signedAWSRequest({
          service: 's3', region: 'us-east-1', method: 'GET', path: `/${bucket}`,
          query: { publicAccessBlock: '' }, credentials: { ...creds },
        });
        const pubXml = await pubResp.text();
        items.push({ item_type: 'bucket_public_access', status: 'collected', resource_id: bucket, raw_data: truncateData(pubXml) });
      } catch {}
    }
  } catch (e: any) {
    return { service: 's3', region: 'global', items, error: e.message };
  }
  return { service: 's3', region: 'global', items };
}

export async function scanConfig(creds: AWSCredentials, region: string): Promise<ServiceScanResult> {
  const items: ServiceScanResult['items'] = [];
  try {
    const body = JSON.stringify({});
    const recorderResp = await signedAWSRequest({
      service: 'config', region, method: 'POST', path: '/',
      body,
      headers: {
        'content-type': 'application/x-amz-json-1.1',
        'x-amz-target': 'StarlingDoveService.DescribeConfigurationRecorders',
      },
      credentials: { ...creds },
    });
    const recorderJson = await recorderResp.text();
    items.push({ item_type: 'config_recorders', status: 'collected', resource_id: region, raw_data: truncateData(recorderJson) });

    const channelResp = await signedAWSRequest({
      service: 'config', region, method: 'POST', path: '/',
      body,
      headers: {
        'content-type': 'application/x-amz-json-1.1',
        'x-amz-target': 'StarlingDoveService.DescribeDeliveryChannels',
      },
      credentials: { ...creds },
    });
    const channelJson = await channelResp.text();
    items.push({ item_type: 'delivery_channels', status: 'collected', resource_id: region, raw_data: truncateData(channelJson) });

    const complianceResp = await signedAWSRequest({
      service: 'config', region, method: 'POST', path: '/',
      body,
      headers: {
        'content-type': 'application/x-amz-json-1.1',
        'x-amz-target': 'StarlingDoveService.GetComplianceSummaryByConfigRule',
      },
      credentials: { ...creds },
    });
    const complianceJson = await complianceResp.text();
    items.push({ item_type: 'compliance_summary', status: 'collected', resource_id: region, raw_data: truncateData(complianceJson) });
  } catch (e: any) {
    return { service: 'config', region, items, error: e.message };
  }
  return { service: 'config', region, items };
}

export async function scanEC2(creds: AWSCredentials, region: string): Promise<ServiceScanResult> {
  const items: ServiceScanResult['items'] = [];
  try {
    // Security Groups
    const sgXml = await callAWSQuery('ec2', region, { Action: 'DescribeSecurityGroups', Version: '2016-11-15' }, creds);
    items.push({ item_type: 'security_groups', status: 'collected', resource_id: region, raw_data: truncateData(sgXml) });

    // Instances
    const instXml = await callAWSQuery('ec2', region, { Action: 'DescribeInstances', Version: '2016-11-15' }, creds);
    items.push({ item_type: 'instances', status: 'collected', resource_id: region, raw_data: truncateData(instXml) });

    // VPCs
    const vpcXml = await callAWSQuery('ec2', region, { Action: 'DescribeVpcs', Version: '2016-11-15' }, creds);
    items.push({ item_type: 'vpcs', status: 'collected', resource_id: region, raw_data: truncateData(vpcXml) });
  } catch (e: any) {
    return { service: 'ec2', region, items, error: e.message };
  }
  return { service: 'ec2', region, items };
}

export async function scanCloudWatch(creds: AWSCredentials, region: string): Promise<ServiceScanResult> {
  const items: ServiceScanResult['items'] = [];
  try {
    // Alarms
    const alarmsXml = await callAWSQuery('monitoring', region, { Action: 'DescribeAlarms', Version: '2010-08-01' }, creds);
    items.push({ item_type: 'alarms', status: 'collected', resource_id: region, raw_data: truncateData(alarmsXml) });

    // Log Groups
    const body = JSON.stringify({});
    const logsResp = await signedAWSRequest({
      service: 'logs', region, method: 'POST', path: '/',
      body,
      headers: {
        'content-type': 'application/x-amz-json-1.1',
        'x-amz-target': 'Logs_20140328.DescribeLogGroups',
      },
      credentials: { ...creds },
    });
    const logsJson = await logsResp.text();
    items.push({ item_type: 'log_groups', status: 'collected', resource_id: region, raw_data: truncateData(logsJson) });
  } catch (e: any) {
    return { service: 'cloudwatch', region, items, error: e.message };
  }
  return { service: 'cloudwatch', region, items };
}

// ============================================================
// Full Account Scan Orchestrator
// ============================================================

const SCAN_REGIONS = ['us-east-1', 'us-west-2', 'eu-west-1', 'eu-central-1', 'ap-southeast-1', 'ap-northeast-1'];

export async function runFullScan(creds: AWSCredentials, onProgress: (p: ScanProgress) => void): Promise<ServiceScanResult[]> {
  const results: ServiceScanResult[] = [];

  // IAM (global)
  onProgress({ service: 'iam', status: 'scanning', itemCount: 0, message: 'Scanning IAM users, roles, policies, MFA, access keys...' });
  const iamResult = await scanIAM(creds);
  results.push(iamResult);
  onProgress({ service: 'iam', status: 'complete', itemCount: iamResult.items.length, message: `Collected ${iamResult.items.length} IAM evidence items` });

  // S3 (global)
  onProgress({ service: 's3', status: 'scanning', itemCount: 0, message: 'Scanning S3 buckets, versioning, encryption, public access...' });
  const s3Result = await scanS3(creds);
  results.push(s3Result);
  onProgress({ service: 's3', status: 'complete', itemCount: s3Result.items.length, message: `Collected ${s3Result.items.length} S3 evidence items` });

  // Per-region scans
  for (const region of SCAN_REGIONS) {
    // CloudTrail
    onProgress({ service: 'cloudtrail', status: 'scanning', itemCount: 0, message: `Scanning CloudTrail in ${region}...` });
    const ctResult = await scanCloudTrail(creds, region);
    results.push(ctResult);
    onProgress({ service: 'cloudtrail', status: 'complete', itemCount: ctResult.items.length, message: `${region}: ${ctResult.items.length} CloudTrail items` });

    // Config
    onProgress({ service: 'config', status: 'scanning', itemCount: 0, message: `Scanning AWS Config in ${region}...` });
    const cfgResult = await scanConfig(creds, region);
    results.push(cfgResult);
    onProgress({ service: 'config', status: 'complete', itemCount: cfgResult.items.length, message: `${region}: ${cfgResult.items.length} Config items` });

    // EC2
    onProgress({ service: 'ec2', status: 'scanning', itemCount: 0, message: `Scanning EC2 instances, security groups, VPCs in ${region}...` });
    const ec2Result = await scanEC2(creds, region);
    results.push(ec2Result);
    onProgress({ service: 'ec2', status: 'complete', itemCount: ec2Result.items.length, message: `${region}: ${ec2Result.items.length} EC2 items` });

    // CloudWatch
    onProgress({ service: 'cloudwatch', status: 'scanning', itemCount: 0, message: `Scanning CloudWatch alarms and log groups in ${region}...` });
    const cwResult = await scanCloudWatch(creds, region);
    results.push(cwResult);
    onProgress({ service: 'cloudwatch', status: 'complete', itemCount: cwResult.items.length, message: `${region}: ${cwResult.items.length} CloudWatch items` });
  }

  return results;
}
