# LoxeAI Evidence Tracer (EVT)

**AI-Powered SOC 2 Compliance Evidence Collection Agent for AWS**

LoxeAI EVT scans your AWS infrastructure, maps evidence to SOC 2 controls using AI, and generates an auditor-ready report — automatically. What used to take weeks of manual evidence collection now takes minutes.

## Architecture

| Component | Technology |
|-----------|-----------|
| Backend | Cloudflare Workers (TypeScript) |
| Database | Cloudflare D1 (SQLite) |
| Storage | Cloudflare R2 (evidence packages) |
| Frontend | Single-page app served from Worker |
| AI | Anthropic Claude (Sonnet for per-control analysis, Opus for final report) |
| AWS | STS AssumeRole → read-only API calls |

## SOC 2 Controls Covered

| Control | Name | AWS Services Analyzed |
|---------|------|----------------------|
| CC6.1 | Logical Access Controls | IAM, EC2 |
| CC6.3 | Access Key Management | IAM |
| CC6.7 | Least Privilege | IAM, EC2 |
| CC7.1 | Infrastructure Change Management | CloudTrail, Config, CloudWatch |
| CC7.2 | Security Configuration | EC2, Config, S3 |
| CC7.4 | Monitoring & Logging | CloudTrail, CloudWatch |
| CC8.1 | Change Management | CloudTrail, Config |
| CC8.2 | Data Management | S3, EC2 |

## Quick Start: Deployment

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) v3+
- Cloudflare account
- Anthropic API key
- AWS account (for LoxeAI's own credentials to perform STS AssumeRole)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Create Cloudflare Resources

```bash
# Create D1 database
wrangler d1 create loxeai-evt-db

# Create R2 bucket
wrangler r2 bucket create loxeai-evt-reports
```

After creating the D1 database, copy the `database_id` from the output and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "loxeai-evt-db"
database_id = "YOUR_DATABASE_ID_HERE"  # <-- paste here
```

### Step 3: Run Database Migration

```bash
# Remote (production)
wrangler d1 execute loxeai-evt-db --file=./migrations/001_init.sql

# Local (development)
wrangler d1 execute loxeai-evt-db --local --file=./migrations/001_init.sql
```

### Step 4: Set Secrets

```bash
# Anthropic API key for Claude
wrangler secret put ANTHROPIC_API_KEY
# Enter your Anthropic API key when prompted

# AWS credentials (for LoxeAI's own account — used for STS AssumeRole)
wrangler secret put AWS_ACCESS_KEY_ID
wrangler secret put AWS_SECRET_ACCESS_KEY
```

> **Important:** These AWS credentials belong to YOUR (LoxeAI's) AWS account, not the customer's. They are used to call `sts:AssumeRole` into the customer's account. The IAM user needs only `sts:AssumeRole` permission.

### Step 5: Deploy

```bash
# Development
wrangler dev

# Production
wrangler deploy
```

### Step 6: Access

Your Worker will be available at `https://loxeai-evt.<your-subdomain>.workers.dev`.

The demo mode loads automatically with AcmePay Inc. sample data — no AWS credentials needed to demo.

## How Real Scans Work

1. Customer downloads the CloudFormation template from the app
2. Customer deploys it in their AWS account (creates a read-only IAM role)
3. Customer pastes the Role ARN into the app
4. EVT calls STS AssumeRole with the ARN + External ID
5. Using temporary credentials, EVT reads from 6 AWS services across all regions
6. Raw evidence is truncated to 2000 tokens per service and sent to Claude Sonnet
7. 8 parallel control analyses are performed (one per SOC 2 control)
8. Claude Opus generates the final executive report
9. JSON evidence package + HTML report are stored in R2

## Cost Guardrails

- Max 2000 tokens of raw AWS data per Claude API call
- Completed scan results cached in D1 — never re-analyzed
- 8 Sonnet calls + 1 Opus call per scan
- Token usage logged per scan in the database

## AWS Permissions Required

The CloudFormation stack creates a role with **read-only** access to:

- **IAM:** ListUsers, ListRoles, ListPolicies, GetAccountPasswordPolicy, ListMFADevices, ListAccessKeys, GetAccessKeyLastUsed
- **CloudTrail:** DescribeTrails, GetTrailStatus, GetEventSelectors
- **S3:** ListAllMyBuckets, GetBucketVersioning, GetBucketEncryption, GetBucketPublicAccessBlock, GetBucketLogging, GetBucketPolicy
- **Config:** DescribeConfigurationRecorders, DescribeDeliveryChannels, GetComplianceSummaryByConfigRule
- **EC2:** DescribeSecurityGroups, DescribeInstances, DescribeVpcs
- **CloudWatch:** DescribeAlarms, DescribeLogGroups, DescribeMetricFilters

No write permissions are granted. The External ID prevents confused deputy attacks.

## Project Structure

```
loxeai-evt/
├── src/
│   ├── index.ts              # Worker entry point, all API routes
│   ├── types.ts              # TypeScript interfaces & SOC 2 control definitions
│   ├── demo-data.ts          # Realistic demo data for AcmePay Inc.
│   ├── aws-scanner.ts        # AWS SigV4 signing, STS AssumeRole, service scanners
│   ├── ai-engine.ts          # Claude API client, per-control analysis, final report
│   ├── report-generator.ts   # HTML report generation
│   └── frontend.ts           # Inline SPA (HTML/CSS/JS)
├── migrations/
│   └── 001_init.sql          # D1 database schema
├── cloudformation/
│   └── loxeai-evt-role.yaml  # Customer CloudFormation template
├── wrangler.toml             # Cloudflare Worker configuration
├── tsconfig.json
├── package.json
├── .env.example
└── README.md
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Frontend SPA |
| GET | `/api/demo` | Demo data (AcmePay Inc.) |
| GET | `/api/demo/report?type=html\|json` | Demo report download |
| GET | `/api/cloudformation` | CloudFormation YAML template |
| POST | `/api/scan` | Start a new scan (body: `{role_arn, org_name}`) |
| GET | `/api/scan/:id/status` | Scan progress |
| GET | `/api/scan/:id/results` | Scan results |
| GET | `/api/scan/:id/report?type=html\|json` | Download report |

## Environment Variables

| Variable | Type | Description |
|----------|------|-------------|
| `ANTHROPIC_API_KEY` | Secret | Anthropic API key for Claude |
| `AWS_ACCESS_KEY_ID` | Secret | LoxeAI's AWS access key (for STS AssumeRole) |
| `AWS_SECRET_ACCESS_KEY` | Secret | LoxeAI's AWS secret key |
| `AWS_REGION` | Var | Default AWS region (us-east-1) |
| `LOXE_EXTERNAL_ID` | Var | UUID for STS External ID condition |

## What Makes This Agentic

The AI doesn't just check boxes — it reasons about context:

- **Contextual risk inference:** An old access key on an admin user is CRITICAL; on a read-only CI user it's MEDIUM
- **Cross-control correlation:** Missing CloudTrail in a region with active EC2 instances compounds risk
- **Specific remediations:** References actual resource names (e.g., "Rotate key AKIA... for user john@company.com")
- **Auditor simulation:** Estimates what questions a real auditor would ask based on findings
- **Freshness analysis:** Evaluates whether evidence is current (rotated keys, active logging)

## License

Proprietary — LoxeAI Inc.
