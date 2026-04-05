// LoxeAI EVT — Demo Data for AcmePay Inc.
// Realistic fake data for a Series B fintech SaaS company

import { ControlAnalysis, Finding, Remediation } from './types';

export function generateDemoScanId(): string {
  return 'demo-' + crypto.randomUUID().slice(0, 8);
}

export const DEMO_ORG = {
  name: 'AcmePay Inc.',
  accountId: '743820195634',
  regions: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'],
  totalEvidenceItems: 847,
  scanDuration: '4m 32s',
};

export const DEMO_SERVICES_SUMMARY = {
  iam: { items: 156, findings: 6, passRate: 89 },
  cloudtrail: { items: 94, findings: 4, passRate: 78 },
  s3: { items: 203, findings: 5, passRate: 91 },
  config: { items: 87, findings: 3, passRate: 82 },
  ec2: { items: 218, findings: 8, passRate: 85 },
  cloudwatch: { items: 89, findings: 2, passRate: 94 },
};

export const DEMO_EVIDENCE_ITEMS = [
  // IAM Evidence
  { service: 'iam', item_type: 'user_mfa_status', status: 'fail', resource_id: 'deploy-bot@acmepay.com', region: 'global', summary: 'No MFA device configured — service account with console access enabled' },
  { service: 'iam', item_type: 'user_mfa_status', status: 'fail', resource_id: 'mike.chen@acmepay.com', region: 'global', summary: 'No MFA device configured — developer with AdministratorAccess' },
  { service: 'iam', item_type: 'user_mfa_status', status: 'fail', resource_id: 'legacy-jenkins@acmepay.com', region: 'global', summary: 'No MFA device configured — inactive CI/CD user, last activity 147 days ago' },
  { service: 'iam', item_type: 'access_key_age', status: 'fail', resource_id: 'AKIAIOSFODNN7EXAMPLE', region: 'global', summary: 'Access key for deploy-bot@acmepay.com is 142 days old (threshold: 90 days)' },
  { service: 'iam', item_type: 'access_key_age', status: 'fail', resource_id: 'AKIAI44QH8DHBEXAMPLE', region: 'global', summary: 'Access key for legacy-jenkins@acmepay.com is 293 days old — key appears unused since migration to GitHub Actions' },
  { service: 'iam', item_type: 'overprivileged_role', status: 'fail', resource_id: 'arn:aws:iam::743820195634:role/DataPipelineFullAccess', region: 'global', summary: 'Role has AdministratorAccess policy attached — used by ETL pipeline that only needs S3 and Redshift access' },
  { service: 'iam', item_type: 'password_policy', status: 'pass', resource_id: 'account_password_policy', region: 'global', summary: 'Password policy meets SOC 2 requirements: 14 char min, requires symbols, 90-day expiry, 24 password history' },
  { service: 'iam', item_type: 'user_mfa_status', status: 'pass', resource_id: 'sarah.kim@acmepay.com', region: 'global', summary: 'Virtual MFA enabled, AdministratorAccess, last activity 2 hours ago' },
  { service: 'iam', item_type: 'user_mfa_status', status: 'pass', resource_id: 'james.wright@acmepay.com', region: 'global', summary: 'Hardware MFA (YubiKey), PowerUserAccess, CTO account' },
  { service: 'iam', item_type: 'user_count', status: 'info', resource_id: 'account_summary', region: 'global', summary: '23 IAM users, 41 IAM roles, 67 customer-managed policies' },

  // CloudTrail Evidence
  { service: 'cloudtrail', item_type: 'trail_status', status: 'pass', resource_id: 'acmepay-org-trail', region: 'us-east-1', summary: 'Organization trail active, multi-region, logging to s3://acmepay-cloudtrail-prod' },
  { service: 'cloudtrail', item_type: 'trail_coverage', status: 'fail', resource_id: 'eu-central-1', region: 'eu-central-1', summary: 'No CloudTrail logging configured in eu-central-1 — region has 3 active EC2 instances' },
  { service: 'cloudtrail', item_type: 'trail_coverage', status: 'fail', resource_id: 'ap-northeast-1', region: 'ap-northeast-1', summary: 'No CloudTrail logging configured in ap-northeast-1 — region has 1 active RDS instance' },
  { service: 'cloudtrail', item_type: 'log_validation', status: 'pass', resource_id: 'acmepay-org-trail', region: 'us-east-1', summary: 'Log file validation enabled, CloudWatch Logs integration active' },
  { service: 'cloudtrail', item_type: 'data_events', status: 'pass', resource_id: 'acmepay-org-trail', region: 'us-east-1', summary: 'S3 data events enabled for all buckets, Lambda invocation logging enabled' },

  // S3 Evidence
  { service: 's3', item_type: 'public_access', status: 'fail', resource_id: 'acmepay-marketing-assets', region: 'us-east-1', summary: 'Public access block not fully configured — BlockPublicPolicy is FALSE, bucket contains 2,341 objects' },
  { service: 's3', item_type: 'versioning', status: 'fail', resource_id: 'acmepay-etl-staging', region: 'us-west-2', summary: 'Versioning not enabled — bucket used for ETL staging with CSV files (PII inferred from bucket naming convention — manual verification of bucket contents recommended before audit submission)' },
  { service: 's3', item_type: 'encryption', status: 'pass', resource_id: 'acmepay-prod-data', region: 'us-east-1', summary: 'SSE-KMS encryption with customer-managed key (alias/acmepay-prod), bucket policy enforces encryption' },
  { service: 's3', item_type: 'encryption', status: 'pass', resource_id: 'acmepay-cloudtrail-prod', region: 'us-east-1', summary: 'SSE-S3 encryption enabled, bucket policy restricts access to CloudTrail service' },
  { service: 's3', item_type: 'logging', status: 'pass', resource_id: 'acmepay-prod-data', region: 'us-east-1', summary: 'Server access logging enabled to acmepay-access-logs bucket' },
  { service: 's3', item_type: 'bucket_count', status: 'info', resource_id: 'account_summary', region: 'global', summary: '34 S3 buckets across 4 regions, 31 with encryption, 28 with versioning' },

  // Config Evidence
  { service: 'config', item_type: 'recorder_status', status: 'pass', resource_id: 'default', region: 'us-east-1', summary: 'Config recorder active, recording all resource types, delivery to acmepay-config-history' },
  { service: 'config', item_type: 'recorder_status', status: 'pass', resource_id: 'default', region: 'us-west-2', summary: 'Config recorder active, recording all resource types' },
  { service: 'config', item_type: 'recorder_status', status: 'fail', resource_id: 'eu-central-1', region: 'eu-central-1', summary: 'Config recorder not configured — region has active resources (3 EC2, 1 RDS, 2 security groups)' },
  { service: 'config', item_type: 'compliance_rules', status: 'pass', resource_id: 'us-east-1', region: 'us-east-1', summary: '27 AWS Config rules evaluated, 23 compliant, 4 non-compliant (s3-bucket-versioning, iam-user-mfa-enabled, access-keys-rotated, cloudtrail-enabled)' },

  // EC2 Evidence
  { service: 'ec2', item_type: 'security_group', status: 'fail', resource_id: 'sg-0a1b2c3d4e5f67890', region: 'us-east-1', summary: 'Security group "launch-wizard-3" has SSH (22) open to 0.0.0.0/0 — attached to i-0abc123def456 (bastion-legacy)' },
  { service: 'ec2', item_type: 'security_group', status: 'fail', resource_id: 'sg-09f8e7d6c5b4a3210', region: 'us-east-1', summary: 'Security group "dev-permissive" has ports 3000-9999 open to 0.0.0.0/0 — attached to 2 instances in dev VPC' },
  { service: 'ec2', item_type: 'instance_summary', status: 'info', resource_id: 'us-east-1', region: 'us-east-1', summary: '14 running instances, 3 stopped, all using IMDSv2, 12 in private subnets' },
  { service: 'ec2', item_type: 'instance_summary', status: 'info', resource_id: 'us-west-2', region: 'us-west-2', summary: '6 running instances, 1 stopped, all in private subnets' },
  { service: 'ec2', item_type: 'vpc_config', status: 'pass', resource_id: 'vpc-0123456789abcdef0', region: 'us-east-1', summary: 'Production VPC: flow logs enabled, 3 private subnets, 1 public subnet, NAT gateway configured' },

  // CloudWatch Evidence
  { service: 'cloudwatch', item_type: 'alarm_coverage', status: 'pass', resource_id: 'us-east-1', region: 'us-east-1', summary: '23 CloudWatch alarms configured: CPU, memory, disk, error rates, API latency. SNS notifications to ops-alerts@acmepay.com' },
  { service: 'cloudwatch', item_type: 'log_groups', status: 'pass', resource_id: 'us-east-1', region: 'us-east-1', summary: '18 log groups with retention policies set (90-day production, 30-day staging). CloudTrail logs streamed to /aws/cloudtrail' },
  { service: 'cloudwatch', item_type: 'metric_filters', status: 'fail', resource_id: 'us-east-1', region: 'us-east-1', summary: 'No metric filters for unauthorized API calls or console sign-in failures — CIS Benchmark controls 3.1-3.14 not implemented' },
];

export const DEMO_CONTROL_RESULTS: ControlAnalysis[] = [
  {
    control_id: 'CC6.1',
    control_name: 'Logical Access Controls',
    status: 'PARTIAL',
    gap_score: 71,
    freshness_score: 85,
    audit_risk: 'MEDIUM',
    summary: 'AcmePay has foundational access controls but significant gaps in MFA enforcement and service account management. Password policy is strong, but 3 of 23 users lack MFA — one with administrator access.',
    critical_findings: [
      { severity: 'CRITICAL', title: 'Admin User Without MFA', description: 'mike.chen@acmepay.com has AdministratorAccess policy with no MFA device configured. This user has been active in the last 24 hours.', resource: 'mike.chen@acmepay.com', evidence: 'IAM:ListMFADevices returned empty for user with AdministratorAccess attached policy' },
      { severity: 'HIGH', title: 'Service Account with Console Access', description: 'deploy-bot@acmepay.com is a service account with console login enabled and no MFA. Service accounts should use access keys only.', resource: 'deploy-bot@acmepay.com', evidence: 'IAM:GetUser shows PasswordLastUsed within 30 days, no MFA device' },
      { severity: 'HIGH', title: 'Stale User Account', description: 'legacy-jenkins@acmepay.com has not been active in 147 days but retains active credentials. Likely orphaned after CI/CD migration.', resource: 'legacy-jenkins@acmepay.com', evidence: 'IAM:GetAccessKeyLastUsed shows LastUsedDate 147 days ago' },
      { severity: 'MEDIUM', title: 'SSH Open to World', description: 'Security group sg-0a1b2c3d4e5f67890 allows SSH from 0.0.0.0/0. Attached to a bastion host — should be restricted to VPN CIDR.', resource: 'sg-0a1b2c3d4e5f67890', evidence: 'EC2:DescribeSecurityGroups shows inbound rule port 22 from 0.0.0.0/0' },
    ],
    recommended_remediations: [
      { priority: 1, title: 'Enable MFA for mike.chen@acmepay.com', description: 'This is the highest-priority finding. An admin user without MFA is a guaranteed audit finding.', steps: ['Navigate to IAM > Users > mike.chen@acmepay.com > Security credentials', 'Click "Assign MFA device" and choose Virtual MFA or hardware key', 'Enforce MFA via IAM policy condition aws:MultiFactorAuthPresent'], estimated_effort: '15 minutes', risk_reduction: 'Eliminates critical access control finding' },
      { priority: 2, title: 'Disable Console Access for Service Accounts', description: 'Service accounts should authenticate via access keys or IAM roles, never via console login.', steps: ['Navigate to IAM > Users > deploy-bot@acmepay.com', 'Under Security credentials, click "Manage console access" and disable', 'Add MFA requirement to any remaining console-capable service accounts', 'Document service account management policy'], estimated_effort: '30 minutes', risk_reduction: 'Removes service account attack surface' },
      { priority: 3, title: 'Deactivate legacy-jenkins@acmepay.com', description: 'Stale accounts are audit red flags. Deactivate the user and its access keys immediately.', steps: ['Verify with DevOps that jenkins CI/CD has been fully migrated to GitHub Actions', 'Deactivate both access keys via: aws iam update-access-key --user-name legacy-jenkins@acmepay.com --access-key-id AKIAI44QH8DHBEXAMPLE --status Inactive', 'After 30 days with no issues, delete the user', 'Add to offboarding checklist: service account decommissioning'], estimated_effort: '20 minutes', risk_reduction: 'Eliminates stale credential risk' },
    ],
    auditor_questions: [
      'Can you demonstrate the process for granting and revoking user access?',
      'What is your MFA enforcement policy and why does mike.chen have an exception?',
      'How are service accounts managed and who approves their creation?',
      'What is the lifecycle management process for CI/CD service accounts?',
    ],
  },
  {
    control_id: 'CC6.3',
    control_name: 'Access Key Management',
    status: 'PARTIAL',
    gap_score: 62,
    freshness_score: 58,
    audit_risk: 'HIGH',
    summary: 'Two access keys exceed the 90-day rotation threshold. One key (293 days old) belongs to a likely-orphaned service account. Key rotation processes appear absent.',
    critical_findings: [
      { severity: 'HIGH', title: 'Severely Aged Access Key', description: 'Access key AKIAI44QH8DHBEXAMPLE for legacy-jenkins@acmepay.com is 293 days old and appears unused since CI/CD migration.', resource: 'AKIAI44QH8DHBEXAMPLE', evidence: 'IAM:ListAccessKeys shows CreateDate 293 days ago, GetAccessKeyLastUsed shows no activity in 147 days' },
      { severity: 'HIGH', title: 'Overdue Key Rotation', description: 'Access key AKIAIOSFODNN7EXAMPLE for deploy-bot@acmepay.com is 142 days old (threshold: 90 days). This key is actively used for deployments.', resource: 'AKIAIOSFODNN7EXAMPLE', evidence: 'IAM:ListAccessKeys shows CreateDate 142 days ago, GetAccessKeyLastUsed shows activity today' },
      { severity: 'MEDIUM', title: 'No Automated Key Rotation Policy', description: 'No AWS Config rule or automation detected for access key rotation enforcement. Relying on manual processes.', resource: 'account-level', evidence: 'Config:GetComplianceSummaryByConfigRule shows access-keys-rotated rule in NON_COMPLIANT state' },
    ],
    recommended_remediations: [
      { priority: 1, title: 'Immediately Deactivate AKIAI44QH8DHBEXAMPLE', description: 'This key is unused and attached to a stale account. Deactivate it now.', steps: ['Run: aws iam update-access-key --user-name legacy-jenkins@acmepay.com --access-key-id AKIAI44QH8DHBEXAMPLE --status Inactive', 'Monitor for 7 days for any unexpected failures', 'Delete the key after verification period'], estimated_effort: '5 minutes', risk_reduction: 'Eliminates 293-day-old credential exposure' },
      { priority: 2, title: 'Rotate AKIAIOSFODNN7EXAMPLE for deploy-bot', description: 'Create new key, update deployment configs, deactivate old key.', steps: ['Create new access key for deploy-bot@acmepay.com', 'Update GitHub Actions secrets / deployment configuration with new key', 'Test deployment pipeline end-to-end', 'Deactivate old key AKIAIOSFODNN7EXAMPLE', 'Delete old key after 7-day verification'], estimated_effort: '1 hour', risk_reduction: 'Brings key age within 90-day compliance window' },
      { priority: 3, title: 'Implement Automated Key Rotation', description: 'Set up Lambda-based rotation or AWS Config auto-remediation for access keys.', steps: ['Deploy access-key-rotation-checker Lambda on 7-day CloudWatch Events schedule', 'Configure SNS alerts when keys approach 80-day threshold', 'Evaluate moving to IAM Roles for deployment (preferred over long-lived keys)', 'Document key rotation SOP and add to compliance wiki'], estimated_effort: '4 hours', risk_reduction: 'Prevents future key age violations systemically' },
    ],
    auditor_questions: [
      'What is your access key rotation policy and cadence?',
      'How do you track access key age across all users?',
      'What is the process when a key exceeds your rotation threshold?',
      'Have you considered eliminating long-lived access keys in favor of IAM roles?',
    ],
  },
  {
    control_id: 'CC6.7',
    control_name: 'Least Privilege',
    status: 'PARTIAL',
    gap_score: 68,
    freshness_score: 72,
    audit_risk: 'HIGH',
    summary: 'One IAM role with AdministratorAccess is attached to an ETL pipeline that only requires S3 and Redshift access. Overprivileged security groups detected in dev environment.',
    critical_findings: [
      { severity: 'CRITICAL', title: 'Overprivileged ETL Pipeline Role', description: 'DataPipelineFullAccess role has AdministratorAccess but is only used by an ETL pipeline that reads from S3 and writes to Redshift.', resource: 'arn:aws:iam::743820195634:role/DataPipelineFullAccess', evidence: 'IAM:ListAttachedRolePolicies shows arn:aws:iam::aws:policy/AdministratorAccess. CloudTrail shows only s3:GetObject, redshift:CopyCommand, redshift:DescribeClusters API calls from this role.' },
      { severity: 'HIGH', title: 'Permissive Dev Security Group', description: 'Security group "dev-permissive" opens ports 3000-9999 to the internet. Attached to 2 instances that run internal developer tools.', resource: 'sg-09f8e7d6c5b4a3210', evidence: 'EC2:DescribeSecurityGroups shows ingress rule TCP 3000-9999 from 0.0.0.0/0' },
      { severity: 'MEDIUM', title: '5 Users with AdministratorAccess', description: 'Five IAM users have AdministratorAccess attached. For a 23-person team, this represents 22% admin density — auditors typically expect <10%.', resource: 'IAM account', evidence: 'IAM:ListAttachedUserPolicies scan across all 23 users' },
    ],
    recommended_remediations: [
      { priority: 1, title: 'Scope Down DataPipelineFullAccess Role', description: 'Replace AdministratorAccess with a custom policy granting only the S3 and Redshift permissions the ETL pipeline actually uses.', steps: ['Analyze CloudTrail logs for the role over the last 90 days using IAM Access Analyzer', 'Generate least-privilege policy from IAM Access Analyzer recommendations', 'Create new policy "DataPipelineScoped" with only required actions', 'Attach new policy and detach AdministratorAccess', 'Monitor for 7 days for access denied errors'], estimated_effort: '2 hours', risk_reduction: 'Eliminates critical least-privilege violation' },
      { priority: 2, title: 'Restrict Dev Security Group', description: 'Replace 0.0.0.0/0 with VPN CIDR range and reduce port range.', steps: ['Identify the VPN/office CIDR ranges used by developers', 'Update sg-09f8e7d6c5b4a3210 ingress rules to restrict source to VPN CIDR', 'Reduce port range to only the specific ports needed (e.g., 3000, 8080)', 'Add tag "reviewed-date" with today\'s date for audit trail'], estimated_effort: '30 minutes', risk_reduction: 'Eliminates internet exposure of dev tools' },
    ],
    auditor_questions: [
      'How do you determine the appropriate level of access for each role?',
      'What process do you follow to review and right-size permissions?',
      'How often do you conduct access reviews for privileged accounts?',
      'What is your policy for administrative access — who approves it?',
    ],
  },
  {
    control_id: 'CC7.1',
    control_name: 'Infrastructure Change Management',
    status: 'PARTIAL',
    gap_score: 74,
    freshness_score: 80,
    audit_risk: 'MEDIUM',
    summary: 'CloudTrail provides good coverage in primary regions but has gaps in 2 regions with active resources. AWS Config is deployed in primary regions but missing in eu-central-1.',
    critical_findings: [
      { severity: 'HIGH', title: 'CloudTrail Gap in Active Region', description: 'eu-central-1 has 3 active EC2 instances and 1 RDS instance but no CloudTrail logging. Infrastructure changes in this region are unmonitored.', resource: 'eu-central-1', evidence: 'CloudTrail:DescribeTrails returned no trails for eu-central-1. EC2:DescribeInstances shows 3 running instances.' },
      { severity: 'HIGH', title: 'Config Recorder Missing in eu-central-1', description: 'AWS Config is not recording resource changes in eu-central-1, compounding the CloudTrail gap. No configuration history or compliance evaluation.', resource: 'eu-central-1', evidence: 'Config:DescribeConfigurationRecorders returned empty for eu-central-1' },
      { severity: 'MEDIUM', title: 'CloudTrail Gap in ap-northeast-1', description: 'ap-northeast-1 has 1 active RDS instance but no CloudTrail logging.', resource: 'ap-northeast-1', evidence: 'CloudTrail:DescribeTrails returned no trails for ap-northeast-1' },
    ],
    recommended_remediations: [
      { priority: 1, title: 'Extend Organization Trail to All Regions', description: 'Configure the existing organization trail as a multi-region trail to cover eu-central-1 and ap-northeast-1.', steps: ['Navigate to CloudTrail console > Trails > acmepay-org-trail', 'Edit trail settings and enable "Apply trail to all regions"', 'Verify delivery to existing S3 bucket with proper bucket policy', 'Confirm trail status in eu-central-1 and ap-northeast-1 after 15 minutes'], estimated_effort: '15 minutes', risk_reduction: 'Eliminates all CloudTrail coverage gaps' },
      { priority: 2, title: 'Deploy AWS Config to eu-central-1', description: 'Set up Config recorder and rules in the missing region.', steps: ['Use AWS CloudFormation StackSet to deploy Config recorder consistently', 'Configure delivery channel to central S3 bucket', 'Deploy the same 27 Config rules active in us-east-1', 'Verify compliance evaluation begins within 1 hour'], estimated_effort: '45 minutes', risk_reduction: 'Provides configuration change detection for EU resources' },
    ],
    auditor_questions: [
      'Why are some regions not covered by CloudTrail — is this intentional?',
      'How do you detect unauthorized changes in regions without monitoring?',
      'What is your process for ensuring new regions are automatically monitored?',
    ],
  },
  {
    control_id: 'CC6.6',
    control_name: 'External Threat Protection',
    status: 'PARTIAL',
    gap_score: 76,
    freshness_score: 88,
    audit_risk: 'MEDIUM',
    summary: 'Security group configurations are mostly appropriate for production but have concerning exceptions in dev environment. S3 bucket public access controls have gaps that could expose resources to external threats.',
    critical_findings: [
      { severity: 'HIGH', title: 'S3 Bucket with Partial Public Access Block', description: 'acmepay-marketing-assets has BlockPublicPolicy set to FALSE. While currently no public policies exist, this configuration leaves the door open.', resource: 'acmepay-marketing-assets', evidence: 'S3:GetBucketPublicAccessBlock shows BlockPublicPolicy: false, RestrictPublicBuckets: false' },
      { severity: 'MEDIUM', title: 'ETL Staging Bucket Without Versioning', description: 'acmepay-etl-staging handles CSV files (PII inferred from bucket naming convention — manual verification of bucket contents recommended before audit submission) but has no versioning — accidental deletion or overwrite cannot be recovered.', resource: 'acmepay-etl-staging', evidence: 'S3:GetBucketVersioning returned Status: null (not enabled)' },
      { severity: 'MEDIUM', title: 'Dev Environment Firewall Weakness', description: '2 instances in dev VPC accessible from internet on broad port range. Dev and prod share the same AWS account.', resource: 'dev VPC instances', evidence: 'EC2:DescribeSecurityGroups shows dev-permissive group with TCP 3000-9999 from 0.0.0.0/0' },
    ],
    recommended_remediations: [
      { priority: 1, title: 'Enable Full Public Access Block on acmepay-marketing-assets', description: 'Enable all 4 public access block settings. If public access is needed, use CloudFront with OAI instead.', steps: ['Run: aws s3api put-public-access-block --bucket acmepay-marketing-assets --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true', 'If marketing assets need public access, set up CloudFront distribution with Origin Access Identity', 'Update any direct S3 URLs to use CloudFront domain'], estimated_effort: '30 minutes', risk_reduction: 'Eliminates public exposure risk for marketing assets' },
      { priority: 2, title: 'Enable Versioning on acmepay-etl-staging', description: 'Enable versioning and add lifecycle policy for staging bucket.', steps: ['Run: aws s3api put-bucket-versioning --bucket acmepay-etl-staging --versioning-configuration Status=Enabled', 'Add lifecycle policy to expire non-current versions after 30 days', 'Consider enabling MFA delete for additional protection'], estimated_effort: '10 minutes', risk_reduction: 'Enables recovery from accidental data loss' },
    ],
    auditor_questions: [
      'What is your S3 bucket security baseline and how is it enforced?',
      'How do you manage security configurations across dev and production?',
      'Is there a process to review security group rules periodically?',
    ],
  },
  {
    control_id: 'CC7.2',
    control_name: 'Anomaly and Security Event Monitoring',
    status: 'PARTIAL',
    gap_score: 70,
    freshness_score: 82,
    audit_risk: 'MEDIUM',
    summary: 'Solid CloudWatch alarm coverage for infrastructure metrics but missing CIS Benchmark metric filters for security events. No automated detection of unauthorized API calls, console sign-in failures, or root account usage.',
    critical_findings: [
      { severity: 'HIGH', title: 'Missing CIS Benchmark Metric Filters', description: 'None of the CIS Benchmark 3.x metric filters are implemented. No alerts for unauthorized API calls, console sign-in failures, IAM policy changes, CloudTrail configuration changes, or root account usage.', resource: 'CloudWatch Logs', evidence: 'CloudWatch:DescribeMetricFilters returned 0 filters matching CIS patterns on /aws/cloudtrail log group' },
      { severity: 'MEDIUM', title: 'No Root Account Usage Alert', description: 'No alarm configured for root account API activity. Root account usage should be near-zero and always alerted.', resource: 'Root account monitoring', evidence: 'CloudWatch:DescribeAlarms shows no alarm with dimensions matching root user activity' },
    ],
    recommended_remediations: [
      { priority: 1, title: 'Deploy CIS Benchmark Metric Filters', description: 'Implement the full set of CIS 3.1-3.14 metric filters and associated alarms. This is a standard SOC 2 expectation.', steps: ['Deploy CloudFormation template for CIS Benchmark metric filters (AWS provides a reference template)', 'Configure SNS topic for security alerts: security-alerts@acmepay.com', 'Create CloudWatch alarms with appropriate thresholds for each filter', 'Test by performing a sample action (e.g., failed console login) and verifying alert fires', 'Document alerting runbook for each alarm type'], estimated_effort: '3 hours', risk_reduction: 'Addresses major monitoring gap across 14 security event categories' },
      { priority: 2, title: 'Add Root Account Usage Alarm', description: 'Create high-severity alarm for any root account API activity.', steps: ['Create metric filter on /aws/cloudtrail for { $.userIdentity.type = "Root" }', 'Create CloudWatch alarm: threshold ≥ 1 in 5-minute period', 'Route to PagerDuty or high-priority SNS topic', 'Document investigation runbook for root usage alerts'], estimated_effort: '30 minutes', risk_reduction: 'Enables immediate detection of root account compromise' },
    ],
    auditor_questions: [
      'How do you detect and respond to unauthorized API activity?',
      'What is your alerting and escalation process for security events?',
      'How do you monitor for root account usage?',
    ],
  },
  {
    control_id: 'CC7.4',
    control_name: 'Incident Response Readiness',
    status: 'PARTIAL',
    gap_score: 65,
    freshness_score: 78,
    audit_risk: 'MEDIUM',
    summary: 'CloudWatch alarms route to SNS topics for operational alerts, but no dedicated security incident notification infrastructure exists. AWS Security Hub and GuardDuty are not enabled. EventBridge rules for security events are absent.',
    critical_findings: [
      { severity: 'HIGH', title: 'No Dedicated Security Alert SNS Topic', description: 'CloudWatch alarms route to ops-alerts@acmepay.com but there is no dedicated security-alerts SNS topic for incident response routing. Security events are mixed with operational noise.', resource: 'SNS configuration', evidence: 'SNS:ListTopics shows only ops-alerts topic, no security-specific topic configured' },
      { severity: 'HIGH', title: 'AWS Security Hub Not Enabled', description: 'Security Hub is not enabled in any region. No centralized security finding aggregation or compliance scoring is available.', resource: 'AWS Security Hub', evidence: 'SecurityHub:DescribeHub returned ResourceNotFoundException in all scanned regions' },
      { severity: 'MEDIUM', title: 'GuardDuty Not Enabled', description: 'GuardDuty threat detection is not enabled. No automated detection of compromised instances, reconnaissance, or credential exfiltration.', resource: 'Amazon GuardDuty', evidence: 'GuardDuty:ListDetectors returned empty in all scanned regions' },
    ],
    recommended_remediations: [
      { priority: 1, title: 'Enable AWS Security Hub', description: 'Security Hub provides centralized security finding aggregation and SOC 2 compliance scoring.', steps: ['Enable Security Hub in all active regions via AWS Organizations', 'Enable CIS AWS Foundations Benchmark standard', 'Configure findings export to S3 for audit evidence', 'Review initial compliance score within 24 hours'], estimated_effort: '1 hour', risk_reduction: 'Provides centralized security posture visibility and compliance scoring' },
      { priority: 2, title: 'Enable GuardDuty', description: 'GuardDuty provides automated threat detection that auditors expect for incident response readiness.', steps: ['Enable GuardDuty in all active regions', 'Configure SNS notification for HIGH and CRITICAL findings', 'Set up EventBridge rule to route findings to incident response channel', 'Document investigation runbook for GuardDuty finding types'], estimated_effort: '45 minutes', risk_reduction: 'Enables automated threat detection and incident response triggering' },
    ],
    auditor_questions: [
      'What is your incident response plan and how is it triggered?',
      'How are security alerts routed to the appropriate responders?',
      'Can you show evidence of alert response for a recent security event?',
      'What automated detection tooling is in place for security incidents?',
    ],
  },
  {
    control_id: 'CC8.1',
    control_name: 'Change Management',
    status: 'PASS',
    gap_score: 84,
    freshness_score: 90,
    audit_risk: 'LOW',
    summary: 'CloudTrail provides comprehensive API-level change tracking in primary regions. AWS Config rules enforce configuration baselines. Main risk is the regional coverage gaps identified under CC7.1.',
    critical_findings: [
      { severity: 'MEDIUM', title: 'Change Tracking Gap in 2 Regions', description: 'Changes in eu-central-1 and ap-northeast-1 are not tracked by CloudTrail or AWS Config. This is cross-referenced from CC7.1 findings.', resource: 'eu-central-1, ap-northeast-1', evidence: 'CloudTrail and Config gaps as documented in CC7.1' },
      { severity: 'LOW', title: '4 Non-Compliant Config Rules', description: 'AWS Config shows 4 rules in NON_COMPLIANT state, indicating configuration drift from baseline.', resource: 'AWS Config rules', evidence: 'Config:GetComplianceSummaryByConfigRule shows 4/27 rules non-compliant' },
    ],
    recommended_remediations: [
      { priority: 1, title: 'Remediate Non-Compliant Config Rules', description: 'Address the 4 non-compliant Config rules to bring configuration baseline to 100%.', steps: ['Review each non-compliant rule: s3-bucket-versioning, iam-user-mfa-enabled, access-keys-rotated, cloudtrail-enabled', 'These overlap with findings from other controls — addressing CC6.1, CC6.3, CC7.1 remediations will resolve these', 'After remediation, trigger Config rule re-evaluation', 'Set up automated remediation via SSM Automation for future drift'], estimated_effort: 'Covered by other control remediations', risk_reduction: 'Demonstrates comprehensive change management baseline' },
    ],
    auditor_questions: [
      'Walk me through your change management process from request to deployment.',
      'How do you ensure changes are authorized before implementation?',
      'How do you detect unauthorized changes?',
    ],
  },
];

export function getDemoExecutiveSummary(): string {
  return `## Executive Summary — AcmePay Inc. SOC 2 Readiness Assessment

**Scan Date:** ${new Date().toISOString().split('T')[0]}
**AWS Account:** 743820195634
**Regions Scanned:** us-east-1, us-west-2, eu-west-1, ap-southeast-1, eu-central-1, ap-northeast-1
**Total Evidence Items:** 847 across 6 AWS services

### Overall Readiness: PARTIAL — Estimated 3-4 weeks to audit-ready

AcmePay demonstrates a **solid security foundation** with strong encryption practices, comprehensive password policies, and good production environment controls. However, several gaps would be flagged in a SOC 2 Type I audit:

**Critical Issues (Immediate Action Required):**
1. **Admin user without MFA** — mike.chen@acmepay.com has AdministratorAccess with no MFA. This alone could halt an audit.
2. **Overprivileged ETL role** — DataPipelineFullAccess has AdministratorAccess when it only needs S3/Redshift. Classic least-privilege violation.
3. **293-day-old access key** — AKIAI44QH8DHBEXAMPLE is nearly 10 months old and unused. This signals absent key management processes.

**High-Priority Gaps:**
- CloudTrail coverage gaps in 2 regions with active resources
- Missing CIS Benchmark metric filters for security event detection
- S3 public access block partially configured on marketing bucket
- AWS Config not deployed in eu-central-1

**Strengths:**
- Strong password policy exceeding minimum requirements
- Production S3 buckets encrypted with KMS customer-managed keys
- VPC flow logs enabled in production
- 23 CloudWatch alarms covering infrastructure metrics
- Organization-level CloudTrail with log validation

**Recommended Remediation Timeline:**
- Week 1: MFA enforcement, key deactivation, role scoping (Critical items)
- Week 2: CloudTrail multi-region, Config deployment, CIS metric filters
- Week 3: S3 hardening, security group cleanup, data classification
- Week 4: Documentation, policy formalization, pre-audit review

**Estimated Cost of Remediation:** Minimal AWS cost impact. Primary investment is engineering time (~40-60 hours total).`;
}
