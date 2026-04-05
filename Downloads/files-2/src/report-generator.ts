// LoxeAI EVT — HTML Report Generator
// Produces a beautiful, downloadable HTML report

import { ControlAnalysis } from './types';
import { FinalReport } from './ai-engine';

export function generateHTMLReport(
  orgName: string,
  accountId: string,
  scanDate: string,
  regionsScanned: string[],
  totalEvidence: number,
  controlResults: ControlAnalysis[],
  finalReport: FinalReport
): string {
  const statusColor = (s: string) => {
    switch (s) {
      case 'PASS': case 'READY': case 'LOW': return '#10b981';
      case 'PARTIAL': case 'MEDIUM': return '#f59e0b';
      case 'FAIL': case 'NOT_READY': case 'HIGH': return '#ef4444';
      case 'CRITICAL': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const severityBadge = (s: string) =>
    `<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;color:white;background:${statusColor(s)}">${s}</span>`;

  const controlRows = controlResults.map(cr => `
    <tr>
      <td style="padding:12px 16px;font-weight:600;color:#e2e8f0">${cr.control_id}</td>
      <td style="padding:12px 16px;color:#cbd5e1">${cr.control_name}</td>
      <td style="padding:12px 16px;text-align:center">${severityBadge(cr.status)}</td>
      <td style="padding:12px 16px;text-align:center">
        <div style="background:#1e293b;border-radius:100px;height:8px;width:100px;display:inline-block;overflow:hidden">
          <div style="background:${cr.gap_score >= 80 ? '#10b981' : cr.gap_score >= 60 ? '#f59e0b' : '#ef4444'};height:100%;width:${cr.gap_score}%"></div>
        </div>
        <span style="margin-left:8px;color:#94a3b8;font-size:13px">${cr.gap_score}</span>
      </td>
      <td style="padding:12px 16px;text-align:center">
        <div style="background:#1e293b;border-radius:100px;height:8px;width:100px;display:inline-block;overflow:hidden">
          <div style="background:${cr.freshness_score >= 80 ? '#10b981' : cr.freshness_score >= 60 ? '#f59e0b' : '#ef4444'};height:100%;width:${cr.freshness_score}%"></div>
        </div>
        <span style="margin-left:8px;color:#94a3b8;font-size:13px">${cr.freshness_score}</span>
      </td>
      <td style="padding:12px 16px;text-align:center">${severityBadge(cr.audit_risk)}</td>
      <td style="padding:12px 16px;text-align:center;color:#94a3b8">${cr.critical_findings.length}</td>
    </tr>
  `).join('');

  const findingsHTML = controlResults.map(cr => {
    if (cr.critical_findings.length === 0) return '';
    return `
      <div style="margin-bottom:32px">
        <h3 style="color:#e2e8f0;margin-bottom:16px;font-size:18px">${cr.control_id}: ${cr.control_name} ${severityBadge(cr.status)}</h3>
        <p style="color:#94a3b8;margin-bottom:16px">${cr.summary}</p>
        ${cr.critical_findings.map(f => `
          <div style="background:#1e293b;border-radius:8px;padding:16px;margin-bottom:12px;border-left:4px solid ${statusColor(f.severity)}">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
              ${severityBadge(f.severity)}
              <span style="color:#e2e8f0;font-weight:600">${f.title}</span>
            </div>
            <p style="color:#cbd5e1;margin:0 0 8px 0;font-size:14px">${f.description}</p>
            <div style="font-size:12px;color:#64748b">
              <strong>Resource:</strong> <code style="background:#0f172a;padding:2px 6px;border-radius:3px;color:#38bdf8">${f.resource}</code>
            </div>
            <div style="font-size:12px;color:#64748b;margin-top:4px">
              <strong>Evidence:</strong> ${f.evidence}
            </div>
          </div>
        `).join('')}
        ${cr.recommended_remediations.length > 0 ? `
          <h4 style="color:#38bdf8;margin:20px 0 12px 0;font-size:15px">Recommended Remediations</h4>
          ${cr.recommended_remediations.map(r => `
            <div style="background:#0f172a;border-radius:8px;padding:16px;margin-bottom:8px">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                <span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;background:#1e40af;color:white;font-size:12px;font-weight:700">P${r.priority}</span>
                <span style="color:#e2e8f0;font-weight:600">${r.title}</span>
                <span style="color:#64748b;font-size:12px;margin-left:auto">${r.estimated_effort}</span>
              </div>
              <p style="color:#94a3b8;margin:0 0 8px 0;font-size:13px">${r.description}</p>
              <ol style="color:#cbd5e1;margin:0;padding-left:20px;font-size:13px">
                ${r.steps.map(s => `<li style="margin-bottom:4px">${s}</li>`).join('')}
              </ol>
            </div>
          `).join('')}
        ` : ''}
      </div>
    `;
  }).join('');

  const avgGap = Math.round(controlResults.reduce((s, c) => s + c.gap_score, 0) / controlResults.length);
  const avgFresh = Math.round(controlResults.reduce((s, c) => s + c.freshness_score, 0) / controlResults.length);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SOC 2 Type I Readiness Assessment — ${orgName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', -apple-system, sans-serif; background: #0f172a; color: #cbd5e1; line-height: 1.6; }
    .container { max-width: 1100px; margin: 0 auto; padding: 40px 24px; }
    h1 { font-size: 28px; color: #f1f5f9; margin-bottom: 4px; }
    h2 { font-size: 22px; color: #e2e8f0; margin: 40px 0 20px 0; padding-bottom: 12px; border-bottom: 1px solid #1e293b; }
    table { width: 100%; border-collapse: collapse; background: #0f172a; border-radius: 8px; overflow: hidden; }
    th { text-align: left; padding: 12px 16px; background: #1e293b; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
    tr { border-bottom: 1px solid #1e293b; }
    code { font-family: 'SF Mono', 'Fira Code', monospace; }
    @media print { body { background: white; color: #1e293b; } h1, h2, h3 { color: #0f172a; } }
  </style>
</head>
<body>
  <div class="container">
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:32px">
      <div>
        <div style="display:flex;align-items:center;gap:12px">
          <div style="width:40px;height:40px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:16px">L</div>
          <h1>SOC 2 Type I Readiness Assessment</h1>
        </div>
        <p style="color:#64748b;margin-top:4px">Generated by LoxeAI Evidence Tracer</p>
        <p style="color:#f59e0b;margin-top:4px;font-size:11px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase">Generated from demo environment with synthetic data — not a real AWS account.</p>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:32px">
      <div style="background:#1e293b;border-radius:12px;padding:20px">
        <div style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">Organization</div>
        <div style="color:#e2e8f0;font-size:18px;font-weight:700">${orgName}</div>
        <div style="color:#64748b;font-size:13px">Account: ${accountId}</div>
      </div>
      <div style="background:#1e293b;border-radius:12px;padding:20px">
        <div style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">Readiness</div>
        <div style="font-size:18px;font-weight:700;color:${statusColor(finalReport.overall_readiness)}">${finalReport.overall_readiness}</div>
        <div style="color:#64748b;font-size:13px">${finalReport.estimated_time_to_ready} to ready</div>
      </div>
      <div style="background:#1e293b;border-radius:12px;padding:20px">
        <div style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">Gap Score</div>
        <div style="font-size:32px;font-weight:700;color:${avgGap >= 80 ? '#10b981' : avgGap >= 60 ? '#f59e0b' : '#ef4444'}">${avgGap}</div>
        <div style="color:#64748b;font-size:13px">avg across 8 controls</div>
      </div>
      <div style="background:#1e293b;border-radius:12px;padding:20px">
        <div style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">Evidence</div>
        <div style="color:#e2e8f0;font-size:32px;font-weight:700">${totalEvidence}</div>
        <div style="color:#64748b;font-size:13px">items collected</div>
      </div>
    </div>

    <div style="background:#1e293b;border-radius:12px;padding:24px;margin-bottom:32px">
      <div style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">Scan Details</div>
      <div style="color:#94a3b8;font-size:13px">
        <strong>Date:</strong> ${scanDate} &nbsp;|&nbsp;
        <strong>Regions:</strong> ${regionsScanned.join(', ')} &nbsp;|&nbsp;
        <strong>Engineering Hours Est:</strong> ${finalReport.estimated_engineering_hours}
      </div>
    </div>

    <h2>Scope Statement</h2>
    <div style="background:#1e293b;border-radius:12px;padding:24px;color:#cbd5e1;line-height:1.7;margin-bottom:32px">This assessment covers the AWS infrastructure layer of SOC 2 Trust Services Criteria — specifically the technical controls that can be verified via AWS APIs. Controls assessed include logical access, access authorization, external threat protection, least privilege enforcement, infrastructure change detection, anomaly monitoring, incident response readiness, and change management. Organizational, governance, and process controls (CC1–CC5) require separate policy documentation and are outside the scope of this tool. All findings are timestamped and traceable to the specific AWS API call that produced them.</div>

    <h2>Executive Summary</h2>
    <div style="background:#1e293b;border-radius:12px;padding:24px;color:#cbd5e1;white-space:pre-wrap;line-height:1.7">${finalReport.executive_summary}</div>

    <h2>Control Assessment Overview</h2>
    <table>
      <thead>
        <tr>
          <th>Control</th>
          <th>Name</th>
          <th style="text-align:center">Status</th>
          <th style="text-align:center">Gap Score</th>
          <th style="text-align:center">Freshness</th>
          <th style="text-align:center">Audit Risk</th>
          <th style="text-align:center">Findings</th>
        </tr>
      </thead>
      <tbody>${controlRows}</tbody>
    </table>

    <h2>Detailed Findings & Remediations</h2>
    ${findingsHTML}

    <h2>Remediation Roadmap</h2>
    <div style="display:grid;gap:16px">
      ${Object.entries(finalReport.remediation_roadmap).map(([week, desc]) => `
        <div style="display:flex;gap:16px;align-items:flex-start">
          <div style="min-width:80px;padding:8px 12px;background:#1e40af;border-radius:8px;color:white;font-weight:700;font-size:13px;text-align:center">${week.replace('_', ' ').toUpperCase()}</div>
          <div style="background:#1e293b;border-radius:8px;padding:16px;flex:1;color:#cbd5e1;font-size:14px">${desc}</div>
        </div>
      `).join('')}
    </div>

    <h2>Strengths</h2>
    <div style="display:grid;gap:8px">
      ${finalReport.strengths.map(s => `
        <div style="background:#064e3b;border-radius:8px;padding:12px 16px;color:#6ee7b7;font-size:14px">✓ ${s}</div>
      `).join('')}
    </div>

    <h2>Top Auditor Concerns</h2>
    <div style="display:grid;gap:8px;margin-bottom:40px">
      ${finalReport.top_auditor_concerns.map(c => `
        <div style="background:#7f1d1d;border-radius:8px;padding:12px 16px;color:#fca5a5;font-size:14px">⚠ ${c}</div>
      `).join('')}
    </div>

    <h2>Scoring Methodology</h2>
    <div style="background:#1e293b;border-radius:12px;padding:24px;color:#cbd5e1;line-height:1.7;margin-bottom:40px">
      <p style="margin-bottom:16px"><strong style="color:#e2e8f0">Gap Score (0–100):</strong> Percentage of assessed control checkpoints meeting SOC 2 best practice thresholds for each criterion. Checkpoints are weighted by audit risk severity — CRITICAL findings apply a 25-point deduction, HIGH findings apply a 15-point deduction, and MEDIUM findings apply a 5-point deduction from a baseline of 100. A score above 80 indicates low audit risk for that control; 60–80 indicates moderate risk with likely findings; below 60 indicates high audit risk requiring remediation before engaging an auditor.</p>
      <p><strong style="color:#e2e8f0">Freshness Score (0–100):</strong> Measures recency of security configurations against SOC 2 time-based thresholds. Inputs include: IAM access key age relative to the 90-day rotation threshold, credential last-used dates for stale account detection, CloudTrail log delivery recency, and AWS Config rule last-evaluation timestamps. A score below 70 indicates configurations that auditors commonly flag for access key management and monitoring gaps. Freshness is scored independently from gap score — a control can be fully configured but use stale credentials, or actively monitored but misconfigured.</p>
    </div>

    <div style="border-top:1px solid #1e293b;padding-top:24px;text-align:center;color:#475569;font-size:13px">
      <p>Generated by <strong>LoxeAI Evidence Tracer</strong> — AI-Powered SOC 2 Compliance Evidence Collection</p>
      <p style="margin-top:4px">Report generated on ${scanDate}. This report is for internal readiness assessment only and does not constitute an audit opinion.</p>
      <p style="margin-top:8px;color:#f59e0b;font-size:11px;font-weight:600">Generated from demo environment with synthetic data — not a real AWS account.</p>
    </div>
  </div>
</body>
</html>`;
}
