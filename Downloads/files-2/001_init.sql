-- LoxeAI EVT Database Schema
-- Run with: wrangler d1 execute loxeai-evt-db --file=./migrations/001_init.sql

CREATE TABLE IF NOT EXISTS scans (
  id TEXT PRIMARY KEY,
  org_name TEXT NOT NULL,
  role_arn TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  account_id TEXT,
  regions_scanned TEXT,
  total_evidence_items INTEGER DEFAULT 0,
  estimated_tokens_used INTEGER DEFAULT 0,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  is_demo INTEGER DEFAULT 0,
  error_message TEXT
);

CREATE TABLE IF NOT EXISTS evidence_items (
  id TEXT PRIMARY KEY,
  scan_id TEXT NOT NULL,
  service TEXT NOT NULL,
  control TEXT,
  item_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'collected',
  region TEXT,
  resource_id TEXT,
  raw_data TEXT,
  ai_analysis TEXT,
  collected_at TEXT NOT NULL,
  FOREIGN KEY (scan_id) REFERENCES scans(id)
);

CREATE TABLE IF NOT EXISTS control_results (
  id TEXT PRIMARY KEY,
  scan_id TEXT NOT NULL,
  control_id TEXT NOT NULL,
  control_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  gap_score INTEGER DEFAULT 0,
  freshness_score INTEGER DEFAULT 0,
  findings_json TEXT,
  remediation_json TEXT,
  audit_risk TEXT DEFAULT 'MEDIUM',
  auditor_questions TEXT,
  ai_analysis TEXT,
  analyzed_at TEXT,
  FOREIGN KEY (scan_id) REFERENCES scans(id)
);

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  scan_id TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  report_type TEXT NOT NULL DEFAULT 'json',
  generated_at TEXT NOT NULL,
  FOREIGN KEY (scan_id) REFERENCES scans(id)
);

CREATE TABLE IF NOT EXISTS debug_logs (
  id TEXT PRIMARY KEY,
  scan_id TEXT,
  level TEXT NOT NULL DEFAULT 'info',
  message TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  FOREIGN KEY (scan_id) REFERENCES scans(id)
);

CREATE INDEX IF NOT EXISTS idx_evidence_scan ON evidence_items(scan_id);
CREATE INDEX IF NOT EXISTS idx_evidence_service ON evidence_items(service);
CREATE INDEX IF NOT EXISTS idx_control_scan ON control_results(scan_id);
CREATE INDEX IF NOT EXISTS idx_reports_scan ON reports(scan_id);
CREATE INDEX IF NOT EXISTS idx_debug_logs_scan ON debug_logs(scan_id);
