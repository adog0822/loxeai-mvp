// ============================================================
// LoxeAI Evidence Tracer — Cloudflare Worker Entry Point
// All API routes, scan orchestration, and static serving
// ============================================================

import { Env, Scan, ControlResult, SOC2_CONTROLS, ControlAnalysis } from './types';
import { DEMO_ORG, DEMO_CONTROL_RESULTS, DEMO_EVIDENCE_ITEMS, getDemoExecutiveSummary } from './demo-data';
import { assumeRole, runFullScan, ServiceScanResult } from './aws-scanner';
import { analyzeControl, generateFinalReport, FinalReport } from './ai-engine';
import { generateHTMLReport } from './report-generator';
import { getFrontendHTML } from './frontend';
import type { ExecutionContext } from '@cloudflare/workers-types';

// ============================================================
// Helper: Generate IDs
// ============================================================

function genId(): string {
  return crypto.randomUUID();
}

function jsonResp(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

function htmlResp(html: string, status = 200): Response {
  return new Response(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

// ============================================================
// In-Memory Scan State (for progress tracking within a request)
// ============================================================

const scanStates = new Map<string, {
  status: string;
  progress: Array<{ service: string; status: string; itemCount: number; message: string }>;
  ai_message?: string;
  error?: string;
}>();

// ============================================================
// Route Handler
// ============================================================

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    try {
      // ---- Frontend ----
      if (path === '/' || path === '/index.html') {
        return htmlResp(getFrontendHTML());
      }

      // ---- Demo API ----
      if (path === '/api/demo' && method === 'GET') {
        return handleDemoData(env);
      }

      if (path === '/api/demo/report' && method === 'GET') {
        const type = url.searchParams.get('type') || 'html';
        return handleDemoReport(env, type);
      }

      // ---- CloudFormation ----
      if (path === '/api/cloudformation' && method === 'GET') {
        return handleCloudFormation();
      }

      // ---- Real Scan ----
      if (path === '/api/scan' && method === 'POST') {
        return await handleStartScan(request, env, ctx);
      }

      if (path.match(/^\/api\/scan\/[^/]+\/status$/) && method === 'GET') {
        const scanId = path.split('/')[3];
        return await handleScanStatus(scanId, env);
      }

      if (path.match(/^\/api\/scan\/[^/]+\/results$/) && method === 'GET') {
        const scanId = path.split('/')[3];
        return await handleScanResults(scanId, env);
      }

      if (path.match(/^\/api\/scan\/[^/]+\/analyze$/) && method === 'POST') {
        const scanId = path.split('/')[3];
        return await handleAnalyzeNextControl(scanId, env);
      }

      if (path.match(/^\/api\/scan\/[^/]+\/report$/) && method === 'GET') {
        const scanId = path.split('/')[3];
        const type = url.searchParams.get('type') || 'html';
        return await handleScanReport(scanId, env, type);
      }

      // ---- Fallback ----
      return jsonResp({ error: 'Not found' }, 404);

    } catch (e: any) {
      console.error('Unhandled error:', e);
      return jsonResp({ error: e.message || 'Internal server error' }, 500);
    }
  },
};

// ============================================================
// Demo Endpoints
// ============================================================

function handleDemoData(env: Env): Response {
  return jsonResp({
    org: DEMO_ORG,
    controls: DEMO_CONTROL_RESULTS,
    evidence: DEMO_EVIDENCE_ITEMS,
  });
}

function handleDemoReport(env: Env, type: string): Response {
  if (type === 'json') {
    const pkg = {
      report_type: 'LoxeAI Evidence Tracer — SOC 2 Readiness Assessment',
      generated_at: new Date().toISOString(),
      org: DEMO_ORG,
      executive_summary: getDemoExecutiveSummary(),
      controls: DEMO_CONTROL_RESULTS,
      evidence_inventory: DEMO_EVIDENCE_ITEMS,
      metadata: {
        scan_id: 'demo-acmepay',
        aws_account_id: DEMO_ORG.accountId,
        regions_scanned: DEMO_ORG.regions,
        total_evidence_items: DEMO_ORG.totalEvidenceItems,
        scan_duration: DEMO_ORG.scanDuration,
      },
    };
    return new Response(JSON.stringify(pkg, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="loxeai-soc2-report-acmepay.json"',
      },
    });
  }

  // HTML report
  const demoFinalReport: FinalReport = {
    executive_summary: getDemoExecutiveSummary(),
    overall_readiness: 'PARTIAL',
    overall_gap_score: 73,
    overall_freshness_score: 80,
    critical_action_items: [
      { priority: 1, title: 'Enable MFA for admin users', description: 'Critical access control gap', control_ids: ['CC6.1'], estimated_weeks: 1 },
      { priority: 2, title: 'Rotate aged access keys', description: 'Key management violation', control_ids: ['CC6.3'], estimated_weeks: 1 },
      { priority: 3, title: 'Scope down overprivileged role', description: 'Least privilege violation', control_ids: ['CC6.7'], estimated_weeks: 1 },
      { priority: 4, title: 'Extend CloudTrail to all regions', description: 'Monitoring gap', control_ids: ['CC7.1', 'CC7.4'], estimated_weeks: 2 },
      { priority: 5, title: 'Deploy CIS Benchmark metric filters', description: 'Security monitoring gap', control_ids: ['CC7.4'], estimated_weeks: 2 },
    ],
    remediation_roadmap: {
      week_1: 'MFA enforcement, key deactivation and rotation, DataPipelineFullAccess role scoping',
      week_2: 'CloudTrail multi-region deployment, AWS Config deployment to eu-central-1, CIS metric filters',
      week_3: 'S3 bucket hardening, security group cleanup, data classification tagging',
      week_4: 'Documentation, policy formalization, pre-audit tabletop review',
    },
    estimated_time_to_ready: '3-4 weeks',
    estimated_engineering_hours: '40-60 hours',
    strengths: [
      'Strong password policy exceeding SOC 2 minimums',
      'Production S3 buckets encrypted with customer-managed KMS keys',
      'VPC flow logs enabled in production environment',
      'Organization-level CloudTrail with log file validation',
      '23 CloudWatch alarms covering infrastructure metrics',
    ],
    top_auditor_concerns: [
      'Admin user (mike.chen) without MFA — potential audit blocker',
      'CloudTrail gaps in regions with active resources',
      'Overprivileged ETL role with AdministratorAccess',
      'Missing CIS Benchmark security event monitoring',
      '293-day-old access key signals absent key management process',
    ],
  };

  const html = generateHTMLReport(
    DEMO_ORG.name,
    DEMO_ORG.accountId,
    new Date().toISOString().split('T')[0],
    DEMO_ORG.regions,
    DEMO_ORG.totalEvidenceItems,
    DEMO_CONTROL_RESULTS,
    demoFinalReport
  );

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': 'attachment; filename="loxeai-soc2-report-acmepay.html"',
    },
  });
}

// ============================================================
// CloudFormation
// ============================================================

function handleCloudFormation(): Response {
  const yaml = `AWSTemplateFormatVersion: '2010-09-09'
Description: >
  LoxeAI Evidence Tracer - Read-Only Cross-Account Role
  Grants LoxeAI read-only access to collect SOC 2 compliance evidence.

Parameters:
  ExternalId:
    Type: String
    Default: b08c7972-22c1-5702-30cc-7912443aa9e0
    Description: External ID for cross-account access (do not change)
  LoxeAccountId:
    Type: String
    Description: LoxeAI's AWS Account ID (provided during onboarding)
    AllowedPattern: '[0-9]{12}'

Resources:
  LoxeAIReadOnlyRole:
    Type: AWS::IAM::Role
    Properties:
      RoleName: LoxeAI-EVT-ReadOnly
      Description: Read-only role for LoxeAI Evidence Tracer
      MaxSessionDuration: 3600
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              AWS: !Sub 'arn:aws:iam::\${LoxeAccountId}:root'
            Action: 'sts:AssumeRole'
            Condition:
              StringEquals:
                'sts:ExternalId': !Ref ExternalId
      Policies:
        - PolicyName: LoxeAI-EVT-ReadOnly-Policy
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
              - Sid: IAMReadOnly
                Effect: Allow
                Action:
                  - 'iam:ListUsers'
                  - 'iam:ListRoles'
                  - 'iam:ListPolicies'
                  - 'iam:GetAccountPasswordPolicy'
                  - 'iam:ListMFADevices'
                  - 'iam:ListAccessKeys'
                  - 'iam:GetAccessKeyLastUsed'
                  - 'iam:ListAttachedUserPolicies'
                  - 'iam:ListAttachedRolePolicies'
                  - 'iam:GetUser'
                  - 'iam:GetRole'
                Resource: '*'
              - Sid: CloudTrailReadOnly
                Effect: Allow
                Action:
                  - 'cloudtrail:DescribeTrails'
                  - 'cloudtrail:GetTrailStatus'
                  - 'cloudtrail:GetEventSelectors'
                Resource: '*'
              - Sid: S3ReadOnly
                Effect: Allow
                Action:
                  - 's3:ListAllMyBuckets'
                  - 's3:GetBucketVersioning'
                  - 's3:GetBucketEncryption'
                  - 's3:GetBucketPublicAccessBlock'
                  - 's3:GetBucketLogging'
                  - 's3:GetBucketPolicy'
                  - 's3:GetBucketLocation'
                Resource: '*'
              - Sid: ConfigReadOnly
                Effect: Allow
                Action:
                  - 'config:DescribeConfigurationRecorders'
                  - 'config:DescribeDeliveryChannels'
                  - 'config:GetComplianceSummaryByConfigRule'
                Resource: '*'
              - Sid: EC2ReadOnly
                Effect: Allow
                Action:
                  - 'ec2:DescribeSecurityGroups'
                  - 'ec2:DescribeInstances'
                  - 'ec2:DescribeVpcs'
                  - 'ec2:DescribeRegions'
                Resource: '*'
              - Sid: CloudWatchReadOnly
                Effect: Allow
                Action:
                  - 'cloudwatch:DescribeAlarms'
                  - 'logs:DescribeLogGroups'
                  - 'logs:DescribeMetricFilters'
                Resource: '*'
              - Sid: STSGetCallerIdentity
                Effect: Allow
                Action:
                  - 'sts:GetCallerIdentity'
                Resource: '*'

Outputs:
  RoleArn:
    Description: Role ARN to enter in LoxeAI Evidence Tracer
    Value: !GetAtt LoxeAIReadOnlyRole.Arn
  ExternalId:
    Description: External ID used for this integration
    Value: !Ref ExternalId`;

  return new Response(yaml, {
    headers: { 'Content-Type': 'text/yaml', 'Access-Control-Allow-Origin': '*' },
  });
}

// ============================================================
// Real Scan: Start
// ============================================================

async function handleStartScan(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const body = await request.json() as { role_arn: string; org_name: string };

  if (!body.role_arn || !body.role_arn.startsWith('arn:aws:iam::')) {
    return jsonResp({ error: 'Invalid Role ARN format' }, 400);
  }

  const scanId = genId();
  const now = new Date().toISOString();

  // Insert scan record
  await env.DB.prepare(
    'INSERT INTO scans (id, org_name, role_arn, status, started_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(scanId, body.org_name || 'Organization', body.role_arn, 'scanning', now).run();

  // Initialize progress state
  scanStates.set(scanId, {
    status: 'scanning',
    progress: [
      { service: 'iam', status: 'pending', itemCount: 0, message: 'Waiting...' },
      { service: 's3', status: 'pending', itemCount: 0, message: 'Waiting...' },
      { service: 'cloudtrail', status: 'pending', itemCount: 0, message: 'Waiting...' },
      { service: 'config', status: 'pending', itemCount: 0, message: 'Waiting...' },
      { service: 'ec2', status: 'pending', itemCount: 0, message: 'Waiting...' },
      { service: 'cloudwatch', status: 'pending', itemCount: 0, message: 'Waiting...' },
    ],
  });

  // Run scan in background
  ctx.waitUntil(executeScan(scanId, body.role_arn, body.org_name, env));

  return jsonResp({ scan_id: scanId, status: 'scanning' });
}

async function executeScan(scanId: string, roleArn: string, orgName: string, env: Env) {
  try {
    // Step 1: Assume Role
    const creds = await assumeRole(env, roleArn);

    // Extract account ID from role ARN
    const accountId = roleArn.match(/::(\d+):/)?.[1] || 'unknown';

    await env.DB.prepare('UPDATE scans SET account_id = ? WHERE id = ?').bind(accountId, scanId).run();

    // Step 2: Run all service scans
    const allResults: ServiceScanResult[] = [];
    let totalItems = 0;

    const updateProgress = (p: { service: string; status: string; itemCount: number; message: string }) => {
      const state = scanStates.get(scanId);
      if (state) {
        const idx = state.progress.findIndex(x => x.service === p.service);
        if (idx >= 0) {
          state.progress[idx] = p;
        } else {
          state.progress.push(p);
        }
      }
    };

    const results = await runFullScan(creds, updateProgress);
    allResults.push(...results);

    // Store evidence items in D1 - batch insert in chunks to avoid SQLite variable limit
    const now = new Date().toISOString();
    const evidenceValues: any[] = [];
    
    for (const result of allResults) {
      for (const item of result.items) {
        const itemId = genId();
        totalItems++;
        evidenceValues.push([itemId, scanId, result.service, item.item_type, item.status, result.region, item.resource_id, item.raw_data, now]);
      }
    }

    // Batch insert in chunks of 10 to avoid SQLite variable limit (999 limit, 10 rows × 9 columns = 90 variables)
    const CHUNK_SIZE = 10;
    for (let i = 0; i < evidenceValues.length; i += CHUNK_SIZE) {
      const chunk = evidenceValues.slice(i, i + CHUNK_SIZE);
      const placeholders = chunk.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?)').join(',');
      const flatValues = chunk.flat();
      await env.DB.prepare(
        `INSERT INTO evidence_items (id, scan_id, service, item_type, status, region, resource_id, raw_data, collected_at) VALUES ${placeholders}`
      ).bind(...flatValues).run();
    }

    await env.DB.prepare('UPDATE scans SET total_evidence_items = ? WHERE id = ?').bind(totalItems, scanId).run();

    // AI analysis moved to incremental analyze endpoint; frontend will poll /analyze per-control
    // (Removed: previously executed all Claude calls synchronously in the background)

    // Update scan status to 'analyzing' so frontend will begin polling analyze endpoint
    await env.DB.prepare(
      'UPDATE scans SET status = ?, total_evidence_items = ? WHERE id = ?'
    ).bind('analyzing', totalItems, scanId).run();

    const state = scanStates.get(scanId);
    if (state) state.status = 'analyzing';

  } catch (e: any) {
    const errorMsg = e.message || String(e);
    try {
      await env.DB.prepare('UPDATE scans SET status = ?, error_message = ? WHERE id = ?').bind('error', errorMsg, scanId).run();
    } catch (updateErr: any) {
      console.error('Failed to update scan error status:', updateErr);
    }
    const state = scanStates.get(scanId);
    if (state) {
      state.status = 'error';
      state.error = errorMsg;
    }
  }
}

// ============================================================
// Scan Status & Results
// ============================================================

async function handleScanStatus(scanId: string, env: Env): Promise<Response> {
  const state = scanStates.get(scanId);
  if (state) {
    return jsonResp(state);
  }
  // Fallback: check DB
  const scan = await env.DB.prepare('SELECT status, error_message FROM scans WHERE id = ?').bind(scanId).first<any>();
  if (!scan) return jsonResp({ status: 'unknown' });
  return jsonResp({ status: scan.status, error: scan.error_message });
}

async function handleScanResults(scanId: string, env: Env): Promise<Response> {
  const scan = await env.DB.prepare('SELECT * FROM scans WHERE id = ?').bind(scanId).first<Scan>();
  if (!scan) return jsonResp({ error: 'Scan not found' }, 404);

  const controlRows = await env.DB.prepare('SELECT * FROM control_results WHERE scan_id = ? ORDER BY control_id').bind(scanId).all();
  const evidenceRows = await env.DB.prepare('SELECT service, item_type, status, resource_id, region, raw_data FROM evidence_items WHERE scan_id = ? LIMIT 100').bind(scanId).all();

  const controls = controlRows.results.map((row: any) => ({
    control_id: row.control_id,
    control_name: row.control_name,
    status: row.status,
    gap_score: row.gap_score,
    freshness_score: row.freshness_score,
    audit_risk: row.audit_risk,
    summary: row.ai_analysis || '',
    critical_findings: JSON.parse(row.findings_json || '[]'),
    recommended_remediations: JSON.parse(row.remediation_json || '[]'),
    auditor_questions: JSON.parse(row.auditor_questions || '[]'),
  }));

  const evidence = evidenceRows.results.map((row: any) => ({
    service: row.service,
    item_type: row.item_type,
    status: row.status === 'collected' ? 'info' : row.status,
    resource_id: row.resource_id,
    region: row.region || 'global',
    summary: (row.raw_data || '').slice(0, 200),
  }));

  return jsonResp({
    org: {
      name: scan.org_name,
      accountId: scan.account_id,
      totalEvidenceItems: scan.total_evidence_items,
      scanDuration: scan.completed_at && scan.started_at
        ? Math.round((new Date(scan.completed_at).getTime() - new Date(scan.started_at).getTime()) / 1000) + 's'
        : 'N/A',
      regions: (scan.regions_scanned || '').split(','),
    },
    controls,
    evidence,
    scan: {
      id: scan.id,
      status: scan.status,
      started_at: scan.started_at,
      completed_at: scan.completed_at,
      tokens_used: scan.estimated_tokens_used,
    },
  });
}

async function handleScanReport(scanId: string, env: Env, type: string): Promise<Response> {
  const reportRow = await env.DB.prepare('SELECT * FROM reports WHERE scan_id = ? AND report_type = ?').bind(scanId, type).first<any>();
  if (!reportRow) return jsonResp({ error: 'Report not found. Scan may still be in progress.' }, 404);

  const obj = await env.BUCKET.get(reportRow.r2_key);
  if (!obj) return jsonResp({ error: 'Report file not found in storage' }, 404);

  const content = await obj.text();
  const contentType = type === 'html' ? 'text/html; charset=utf-8' : 'application/json';
  const filename = type === 'html' ? `loxeai-soc2-report-${scanId.slice(0, 8)}.html` : `loxeai-evidence-package-${scanId.slice(0, 8)}.json`;

  return new Response(content, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

async function handleAnalyzeNextControl(scanId: string, env: Env): Promise<Response> {
  // Find next unanalyzed control
  const analyzed = await env.DB.prepare(
    'SELECT control_id FROM control_results WHERE scan_id = ?'
  ).bind(scanId).all();
  
  const analyzedIds = new Set(analyzed.results.map((r: any) => r.control_id));
  const nextControl = SOC2_CONTROLS.find(c => !analyzedIds.has(c.id));
  
  if (!nextControl) {
    // All controls done — generate final report if not already done
    const reportExists = await env.DB.prepare(
      'SELECT id FROM reports WHERE scan_id = ? AND report_type = ?'
    ).bind(scanId, 'json').first();
    
    if (!reportExists) {
      // Generate final report
      const controlRows = await env.DB.prepare(
        'SELECT * FROM control_results WHERE scan_id = ?'
      ).bind(scanId).all();
      
      const controlAnalyses: ControlAnalysis[] = controlRows.results.map((row: any) => ({
        control_id: row.control_id,
        control_name: row.control_name,
        status: row.status,
        gap_score: row.gap_score,
        freshness_score: row.freshness_score,
        audit_risk: row.audit_risk,
        summary: row.ai_analysis || '',
        critical_findings: JSON.parse(row.findings_json || '[]'),
        recommended_remediations: JSON.parse(row.remediation_json || '[]'),
        auditor_questions: JSON.parse(row.auditor_questions || '[]'),
      }));

      const scan = await env.DB.prepare('SELECT * FROM scans WHERE id = ?').bind(scanId).first<Scan>();
      const orgName = scan?.org_name || 'Organization';
      const accountId = scan?.account_id || 'unknown';
      const totalItems = scan?.total_evidence_items || 0;

      let finalReport: FinalReport;
      try {
        const { report } = await generateFinalReport(env, orgName, accountId, controlAnalyses);
        finalReport = report;
      } catch (e: any) {
        finalReport = {
          executive_summary: 'Report generation encountered an error.',
          overall_readiness: 'PARTIAL',
          overall_gap_score: Math.round(controlAnalyses.reduce((s, c) => s + c.gap_score, 0) / controlAnalyses.length),
          overall_freshness_score: Math.round(controlAnalyses.reduce((s, c) => s + c.freshness_score, 0) / controlAnalyses.length),
          critical_action_items: [],
          remediation_roadmap: {},
          estimated_time_to_ready: 'Unknown',
          estimated_engineering_hours: 'Unknown',
          strengths: [],
          top_auditor_concerns: [],
        };
      }

      const jsonPackage = {
        report_type: 'LoxeAI Evidence Tracer — SOC 2 Readiness Assessment',
        generated_at: new Date().toISOString(),
        org: { name: orgName, accountId, regions: (scan?.regions_scanned || '').split(',') },
        executive_summary: finalReport.executive_summary,
        overall: finalReport,
        controls: controlAnalyses,
        evidence_count: totalItems,
        metadata: { scan_id: scanId, tokens_used: 0 },
      };

      const jsonKey = `reports/${scanId}/evidence-package.json`;
      await env.BUCKET.put(jsonKey, JSON.stringify(jsonPackage, null, 2), {
        httpMetadata: { contentType: 'application/json' },
      });
      await env.DB.prepare('INSERT INTO reports (id, scan_id, r2_key, report_type, generated_at) VALUES (?, ?, ?, ?, ?)')
        .bind(genId(), scanId, jsonKey, 'json', new Date().toISOString()).run();

      const htmlReport = generateHTMLReport(
        orgName, accountId, new Date().toISOString().split('T')[0],
        (scan?.regions_scanned || '').split(','),
        totalItems, controlAnalyses, finalReport
      );
      const htmlKey = `reports/${scanId}/report.html`;
      await env.BUCKET.put(htmlKey, htmlReport, { httpMetadata: { contentType: 'text/html' } });
      await env.DB.prepare('INSERT INTO reports (id, scan_id, r2_key, report_type, generated_at) VALUES (?, ?, ?, ?, ?)')
        .bind(genId(), scanId, htmlKey, 'html', new Date().toISOString()).run();

      await env.DB.prepare('UPDATE scans SET status = ?, completed_at = ? WHERE id = ?')
        .bind('complete', new Date().toISOString(), scanId).run();
    }

    return jsonResp({ done: true, control_id: null });
  }

  // Analyze the next control
  const evidenceRows = await env.DB.prepare(
    'SELECT * FROM evidence_items WHERE scan_id = ?'
  ).bind(scanId).all();

  // Reconstruct ServiceScanResult format
  const serviceMap = new Map<string, ServiceScanResult>();
  for (const row of evidenceRows.results as any[]) {
    const key = `${row.service}:${row.region}`;
    if (!serviceMap.has(key)) {
      serviceMap.set(key, { service: row.service, region: row.region, items: [], error: null });
    }
    serviceMap.get(key)!.items.push({
      item_type: row.item_type,
      resource_id: row.resource_id,
      status: row.status,
      raw_data: row.raw_data,
    });
  }
  const scanResults = Array.from(serviceMap.values());

  try {
    const { analysis, tokensUsed } = await analyzeControl(env, nextControl.id, scanResults);
    const crId = genId();
    await env.DB.prepare(
      'INSERT INTO control_results (id, scan_id, control_id, control_name, status, gap_score, freshness_score, findings_json, remediation_json, audit_risk, auditor_questions, ai_analysis, analyzed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      crId, scanId, analysis.control_id, analysis.control_name, analysis.status,
      analysis.gap_score, analysis.freshness_score,
      JSON.stringify(analysis.critical_findings),
      JSON.stringify(analysis.recommended_remediations),
      analysis.audit_risk,
      JSON.stringify(analysis.auditor_questions),
      analysis.summary,
      new Date().toISOString()
    ).run();

    return jsonResp({ done: false, control_id: nextControl.id, analyzed: analyzedIds.size + 1, total: SOC2_CONTROLS.length });
  } catch (e: any) {
    // Store failure and move on
    const crId = genId();
    await env.DB.prepare(
      'INSERT INTO control_results (id, scan_id, control_id, control_name, status, gap_score, freshness_score, findings_json, remediation_json, audit_risk, auditor_questions, ai_analysis, analyzed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(crId, scanId, nextControl.id, nextControl.name, 'FAIL', 0, 0, '[]', '[]', 'HIGH', '[]', 'Analysis failed: ' + e.message, new Date().toISOString()).run();

    return jsonResp({ done: false, control_id: nextControl.id, error: e.message, analyzed: analyzedIds.size + 1, total: SOC2_CONTROLS.length });
  }
}
