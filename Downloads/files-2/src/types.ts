// LoxeAI EVT Type Definitions

export interface Env {
  DB: D1Database;
  BUCKET: R2Bucket;
  ANTHROPIC_API_KEY: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_REGION: string;
  LOXE_EXTERNAL_ID: string;
}

export interface Scan {
  id: string;
  org_name: string;
  role_arn: string | null;
  status: string;
  account_id: string | null;
  regions_scanned: string | null;
  total_evidence_items: number;
  estimated_tokens_used: number;
  started_at: string;
  completed_at: string | null;
  is_demo: number;
  error_message: string | null;
}

export interface EvidenceItem {
  id: string;
  scan_id: string;
  service: string;
  control: string | null;
  item_type: string;
  status: string;
  region: string | null;
  resource_id: string | null;
  raw_data: string | null;
  ai_analysis: string | null;
  collected_at: string;
}

export interface ControlResult {
  id: string;
  scan_id: string;
  control_id: string;
  control_name: string;
  status: string;
  gap_score: number;
  freshness_score: number;
  findings_json: string | null;
  remediation_json: string | null;
  audit_risk: string;
  auditor_questions: string | null;
  ai_analysis: string | null;
  analyzed_at: string | null;
}

export interface Report {
  id: string;
  scan_id: string;
  r2_key: string;
  report_type: string;
  generated_at: string;
}

export interface ControlDefinition {
  id: string;
  name: string;
  description: string;
  services: string[];
}

export interface AWSCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  expiration: string;
}

export interface ScanProgress {
  service: string;
  status: 'pending' | 'scanning' | 'complete' | 'error';
  itemCount: number;
  message: string;
}

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ControlAnalysis {
  control_id: string;
  control_name: string;
  status: 'PASS' | 'PARTIAL' | 'FAIL';
  gap_score: number;
  freshness_score: number;
  critical_findings: Finding[];
  recommended_remediations: Remediation[];
  audit_risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  auditor_questions: string[];
  summary: string;
}

export interface Finding {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  title: string;
  description: string;
  resource: string;
  evidence: string;
}

export interface Remediation {
  priority: number;
  title: string;
  description: string;
  steps: string[];
  estimated_effort: string;
  risk_reduction: string;
}

export const SOC2_CONTROLS: ControlDefinition[] = [
  {
    id: 'CC6.1',
    name: 'Logical Access Controls',
    description: 'The entity implements logical access security software, infrastructure, and architectures over protected information assets.',
    services: ['iam', 'ec2']
  },
  {
    id: 'CC6.3',
    name: 'Access Key Management',
    description: 'The entity authorizes, modifies, or removes access to data, software, functions, and other protected information assets based on roles.',
    services: ['iam']
  },
  {
    id: 'CC6.7',
    name: 'Least Privilege',
    description: 'The entity restricts the transmission, movement, and removal of information to authorized internal and external users and processes.',
    services: ['iam', 'ec2']
  },
  {
    id: 'CC7.1',
    name: 'Infrastructure Change Management',
    description: 'To meet its objectives, the entity uses detection and monitoring procedures to identify changes to configurations that result in the introduction of new vulnerabilities.',
    services: ['cloudtrail', 'config', 'cloudwatch']
  },
  {
    id: 'CC6.6',
    name: 'External Threat Protection',
    description: 'The entity implements logical access security measures to protect against threats from sources outside its system boundaries, including unauthorized access via exposed ports, permissive network rules, and misconfigured VPC controls.',
    services: ['ec2', 's3']
  },
  {
    id: 'CC7.2',
    name: 'Anomaly and Security Event Monitoring',
    description: 'The entity monitors system components and the operation of those components for anomalies that are indicative of malicious acts, natural disasters, and errors affecting the entity\'s ability to meet its objectives. Monitoring includes automated alerting for security-relevant events.',
    services: ['cloudwatch', 'cloudtrail', 'config']
  },
  {
    id: 'CC7.4',
    name: 'Incident Response Readiness',
    description: 'The entity responds to identified security incidents by executing a defined incident response program to understand, contain, remediate, and communicate security incidents. Technical readiness is assessed via the presence of automated notification infrastructure and detection tooling.',
    services: ['cloudwatch', 'sns', 'securityhub', 'guardduty']
  },
  {
    id: 'CC8.1',
    name: 'Change Management',
    description: 'The entity authorizes, designs, develops or acquires, configures, documents, tests, approves, and implements changes to infrastructure.',
    services: ['cloudtrail', 'config']
  },
];
