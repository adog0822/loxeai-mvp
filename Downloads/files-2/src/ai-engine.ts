// LoxeAI EVT — AI Evidence Analysis Engine
// Uses Claude Sonnet for per-control analysis, Opus for final report

import { Env, ControlAnalysis, SOC2_CONTROLS } from './types';
import { ServiceScanResult } from './aws-scanner';

// ============================================================
// Claude API Client
// ============================================================

interface ClaudeResponse {
  content: Array<{ type: string; text: string }>;
  usage: { input_tokens: number; output_tokens: number };
}

async function callClaude(
  env: Env,
  model: string,
  systemPrompt: string,
  userMessage: string,
  maxTokens: number = 4096
): Promise<{ text: string; tokensUsed: number }> {
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Claude API error (${resp.status}): ${err}`);
  }

  const data = (await resp.json()) as ClaudeResponse;
  const text = data.content.map(c => c.text).join('');
  const tokensUsed = data.usage.input_tokens + data.usage.output_tokens;
  return { text, tokensUsed };
}

// ============================================================
// Evidence Preparation
// ============================================================

function prepareEvidenceForControl(
  controlId: string,
  scanResults: ServiceScanResult[]
): string {
  const control = SOC2_CONTROLS.find(c => c.id === controlId);
  if (!control) return '';

  const relevantServices = control.services;
  const relevantResults = scanResults.filter(r =>
    relevantServices.includes(r.service)
  );

  let evidence = '';
  for (const result of relevantResults) {
    evidence += `\n=== ${result.service.toUpperCase()} (${result.region}) ===\n`;
    if (result.error) {
      evidence += `ERROR: ${result.error}\n`;
    }
    for (const item of result.items) {
      evidence += `[${item.item_type}] ${item.resource_id}: ${item.raw_data.slice(0, 500)}\n`;
    }
  }

  // Truncate to ~2000 tokens (~3000 chars)
  if (evidence.length > 3000) {
    evidence = evidence.slice(0, 3000) + '\n... [evidence truncated]';
  }

  return evidence;
}

// ============================================================
// Per-Control Analysis (Sonnet)
// ============================================================

const CONTROL_ANALYSIS_SYSTEM_PROMPT = `You are a SOC 2 Type I auditor with 15 years of experience. You have reviewed hundreds of audit reports for SaaS companies. Your analysis is thorough, specific, and actionable.

You will receive AWS evidence data and must assess it against a specific SOC 2 control. Be specific about resource names, ARNs, and exact findings. Be harsh where warranted — if something would fail an audit, say so clearly.

You must reason about the evidence, not just check boxes:
- Infer risk from context (e.g., an old access key on an admin user is CRITICAL, on a read-only CI user is MEDIUM)
- Cross-reference findings across services when patterns emerge
- Write remediation steps that reference actual resource names found in the evidence
- Estimate what questions an auditor would ask based on these specific findings

IMPORTANT: Limit critical_findings to maximum 3 items. Limit recommended_remediations to maximum 3 items, each with maximum 4 steps. Keep all text fields concise. The entire JSON response must fit within 4000 tokens.

Output ONLY valid JSON matching this exact schema (no markdown, no explanation):
{
  "control_id": "CC#.#",
  "control_name": "Name",
  "status": "PASS" | "PARTIAL" | "FAIL",
  "gap_score": 0-100,
  "freshness_score": 0-100,
  "audit_risk": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "summary": "2-3 sentence assessment",
  "critical_findings": [
    {
      "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO",
      "title": "Short title",
      "description": "Detailed finding with specific resource references",
      "resource": "Specific resource ID/ARN",
      "evidence": "What API call or data point confirms this"
    }
  ],
  "recommended_remediations": [
    {
      "priority": 1,
      "title": "Action title",
      "description": "Why this matters",
      "steps": ["Specific step 1", "Specific step 2"],
      "estimated_effort": "Time estimate",
      "risk_reduction": "What this fixes"
    }
  ],
  "auditor_questions": ["Question 1", "Question 2"]
}`;

export async function analyzeControl(
  env: Env,
  controlId: string,
  scanResults: ServiceScanResult[]
): Promise<{ analysis: ControlAnalysis; tokensUsed: number }> {
  const control = SOC2_CONTROLS.find(c => c.id === controlId);
  if (!control) throw new Error(`Unknown control: ${controlId}`);

  const evidence = prepareEvidenceForControl(controlId, scanResults);

  const userMessage = `Analyze the following AWS evidence against SOC 2 control ${control.id}: ${control.name}

Control Description: ${control.description}

Relevant AWS Evidence:
${evidence}

Assess gap coverage (0-100, 100=no gaps) and evidence freshness (0-100, 100=all current). Identify up to 5 critical findings and provide specific, actionable remediations. Reference actual resource names from the evidence.`;

  const { text, tokensUsed } = await callClaude(
    env,
    'claude-sonnet-4-5',
    CONTROL_ANALYSIS_SYSTEM_PROMPT,
    userMessage,
    4096
  );

  // Parse JSON response
  let analysis: ControlAnalysis;
  try {
    // Try to extract JSON from the response (handle markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    analysis = JSON.parse(jsonMatch[0]);
  } catch (e) {
    throw new Error(`Failed to parse Claude response as JSON: ${(e as Error).message}\nRaw: ${text.slice(0, 500)}`);
  }

  return { analysis, tokensUsed };
}

// ============================================================
// Final Report Generation (Opus)
// ============================================================

const REPORT_SYSTEM_PROMPT = `You are the Chief Information Security Officer preparing a SOC 2 Type I readiness assessment report. You are synthesizing individual control analyses into a comprehensive executive report.

Your report must be:
- Brutally honest about gaps and risks
- Specific about remediation priorities and timelines
- Written for a VP of Engineering audience
- Structured to help a company get from current state to audit-ready

Output ONLY valid JSON matching this schema (no markdown):
{
  "executive_summary": "3-5 paragraph summary of overall readiness",
  "overall_readiness": "READY" | "PARTIAL" | "NOT_READY",
  "overall_gap_score": 0-100,
  "overall_freshness_score": 0-100,
  "critical_action_items": [
    {
      "priority": 1,
      "title": "Action item",
      "description": "Why and what to do",
      "control_ids": ["CC#.#"],
      "estimated_weeks": 1
    }
  ],
  "remediation_roadmap": {
    "week_1": "Focus area and specific actions",
    "week_2": "Focus area and specific actions",
    "week_3": "Focus area and specific actions",
    "week_4": "Focus area and specific actions"
  },
  "estimated_time_to_ready": "X weeks",
  "estimated_engineering_hours": "X-Y hours",
  "strengths": ["Strength 1", "Strength 2"],
  "top_auditor_concerns": ["Concern 1", "Concern 2"]
}`;

export interface FinalReport {
  executive_summary: string;
  overall_readiness: string;
  overall_gap_score: number;
  overall_freshness_score: number;
  critical_action_items: Array<{
    priority: number;
    title: string;
    description: string;
    control_ids: string[];
    estimated_weeks: number;
  }>;
  remediation_roadmap: Record<string, string>;
  estimated_time_to_ready: string;
  estimated_engineering_hours: string;
  strengths: string[];
  top_auditor_concerns: string[];
}

export async function generateFinalReport(
  env: Env,
  orgName: string,
  accountId: string,
  controlAnalyses: ControlAnalysis[]
): Promise<{ report: FinalReport; tokensUsed: number }> {
  const controlSummaries = controlAnalyses.map(ca => ({
    control_id: ca.control_id,
    control_name: ca.control_name,
    status: ca.status,
    gap_score: ca.gap_score,
    freshness_score: ca.freshness_score,
    audit_risk: ca.audit_risk,
    summary: ca.summary,
    finding_count: ca.critical_findings.length,
    top_finding: ca.critical_findings[0]?.title || 'None',
  }));

  const userMessage = `Generate a comprehensive SOC 2 Type I readiness assessment report for ${orgName} (AWS Account: ${accountId}).

Here are the individual control analysis summaries:

${JSON.stringify(controlSummaries, null, 2)}

Cross-reference findings across controls. Identify compounding risks. Create a prioritized remediation roadmap that accounts for dependencies between controls. Be specific and actionable.`;

  const { text, tokensUsed } = await callClaude(
    env,
    'claude-opus-4-5',
    REPORT_SYSTEM_PROMPT,
    userMessage,
    6000
  );

  let report: FinalReport;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    report = JSON.parse(jsonMatch[0]);
  } catch (e) {
    throw new Error(`Failed to parse final report JSON: ${(e as Error).message}`);
  }

  return { report, tokensUsed };
}
