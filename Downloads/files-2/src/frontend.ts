// LoxeAI EVT — Frontend SPA (served inline from Worker)
// Dark-themed security dashboard UI — v2

export function getFrontendHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>LoxeAI Evidence Tracer — SOC 2 Compliance Engine</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
:root{
  --bg:#060a10;
  --bg2:#0a0f18;
  --card:#0e1420;
  --card2:#131b27;
  --elev:#1a2336;
  --border:#1e2a3a;
  --border2:#2a3a50;
  --t1:#eef2f7;
  --t2:#8fa8c8;
  --t3:#4a6080;
  --blue:#3b82f6;
  --blue2:#60a5fa;
  --purple:#8b5cf6;
  --cyan:#22d3ee;
  --green:#10b981;
  --yellow:#f59e0b;
  --orange:#f97316;
  --red:#ef4444;
  --grad:linear-gradient(135deg,#3b82f6 0%,#8b5cf6 100%);
  --grad2:linear-gradient(135deg,#1e3a5f 0%,#2d1b69 100%);
  --sans:'Inter',-apple-system,sans-serif;
  --mono:'JetBrains Mono','SF Mono',monospace;
  --r:14px;
  --rs:8px;
  --shadow:0 4px 24px rgba(0,0,0,.4);
  --shadow2:0 8px 40px rgba(0,0,0,.6);
}

*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}

body{
  font-family:var(--sans);
  background:var(--bg);
  color:var(--t2);
  line-height:1.6;
  min-height:100vh;
  overflow-x:hidden;
}

/* Subtle noise texture overlay */
body::before{
  content:'';
  position:fixed;
  inset:0;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
  pointer-events:none;
  z-index:0;
  opacity:.4;
}

/* Ambient glow */
body::after{
  content:'';
  position:fixed;
  top:-30%;
  left:-20%;
  width:60%;
  height:60%;
  background:radial-gradient(ellipse,rgba(59,130,246,.04) 0%,transparent 70%);
  pointer-events:none;
  z-index:0;
}

.app{position:relative;z-index:1}

/* ── Navigation ── */
nav{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:0 32px;
  height:60px;
  border-bottom:1px solid var(--border);
  background:rgba(6,10,16,.85);
  backdrop-filter:blur(24px);
  -webkit-backdrop-filter:blur(24px);
  position:sticky;
  top:0;
  z-index:200;
}

.nl{display:flex;align-items:center;gap:10px}

.nl-logo{
  width:34px;height:34px;
  background:var(--grad);
  border-radius:9px;
  display:flex;align-items:center;justify-content:center;
  color:#fff;font-weight:800;font-size:15px;
  font-family:var(--mono);
  box-shadow:0 0 16px rgba(59,130,246,.25);
}

.nl-brand{
  font-size:16px;font-weight:700;
  color:var(--t1);letter-spacing:-.02em;
}
.nl-brand span{
  color:var(--t3);font-weight:400;font-size:13px;margin-left:6px;
  letter-spacing:0;
}

.nls{display:flex;gap:2px}

.nlk{
  padding:7px 14px;
  border-radius:6px;
  font-size:13px;font-weight:500;
  color:var(--t3);
  cursor:pointer;
  transition:all .15s;
  border:none;background:none;
  font-family:var(--sans);
  letter-spacing:-.01em;
}
.nlk:hover{color:var(--t2);background:rgba(255,255,255,.04)}
.nlk.act{color:var(--t1);background:var(--elev)}

/* ── Layout ── */
.ctr{max-width:1200px;margin:0 auto;padding:48px 32px}

.sec{display:none}
.sec.act{display:block;animation:fadeUp .25s ease}

@keyframes fadeUp{
  from{opacity:0;transform:translateY(6px)}
  to{opacity:1;transform:translateY(0)}
}

/* ── Hero ── */
.eyebrow{
  display:inline-flex;align-items:center;gap:8px;
  padding:5px 14px;
  border-radius:100px;
  background:rgba(59,130,246,.08);
  border:1px solid rgba(59,130,246,.18);
  font-size:11px;font-weight:700;
  color:var(--blue2);
  text-transform:uppercase;letter-spacing:.07em;
  margin-bottom:20px;
}
.eyebrow-dot{
  width:6px;height:6px;border-radius:50%;
  background:var(--blue);
  animation:pulse 2s infinite;
}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}

.hero-title{
  font-size:48px;font-weight:800;
  color:var(--t1);
  line-height:1.1;letter-spacing:-.04em;
  margin-bottom:18px;
}
.hero-title .gr{
  background:var(--grad);
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  background-clip:text;
}

.hero-sub{
  font-size:17px;color:var(--t3);
  max-width:560px;line-height:1.75;
  margin-bottom:36px;
  font-weight:400;
}

.hero-cta{display:flex;gap:12px;margin-bottom:56px;flex-wrap:wrap}

/* ── Buttons ── */
.btn{
  padding:11px 22px;
  border-radius:8px;
  font-size:14px;font-weight:600;
  cursor:pointer;border:none;
  transition:all .2s;
  font-family:var(--sans);
  display:inline-flex;align-items:center;gap:8px;
  letter-spacing:-.01em;
  white-space:nowrap;
}
.btn-primary{
  background:var(--grad);
  color:#fff;
  box-shadow:0 0 0 1px rgba(59,130,246,.3),0 4px 16px rgba(59,130,246,.2);
}
.btn-primary:hover{
  box-shadow:0 0 0 1px rgba(59,130,246,.4),0 4px 24px rgba(59,130,246,.35);
  transform:translateY(-1px);
}
.btn-secondary{
  background:var(--card2);
  color:var(--t2);
  border:1px solid var(--border2);
}
.btn-secondary:hover{background:var(--elev);color:var(--t1)}

.btn-green{background:#065f46;color:#6ee7b7;border:1px solid #059669}
.btn-green:hover{background:#047857;color:#a7f3d0}

.btn-sm{padding:7px 14px;font-size:12px;border-radius:6px}

/* ── Demo Banner ── */
.demo-banner{
  display:flex;align-items:center;gap:20px;
  padding:20px 24px;
  background:linear-gradient(135deg,rgba(139,92,246,.06) 0%,rgba(59,130,246,.04) 100%);
  border:1px solid rgba(139,92,246,.15);
  border-radius:var(--r);
  margin-bottom:36px;
}
.demo-banner-icon{
  width:52px;height:52px;flex-shrink:0;
  border-radius:12px;
  background:linear-gradient(135deg,#5b21b6,#7c3aed);
  display:flex;align-items:center;justify-content:center;
  font-size:22px;
  box-shadow:0 4px 16px rgba(139,92,246,.3);
}
.demo-banner-text h3{font-size:15px;font-weight:700;color:var(--t1);margin-bottom:2px}
.demo-banner-text p{font-size:13px;color:var(--t3)}

/* ── Stats Grid ── */
.stats-grid{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:16px;
  margin-bottom:40px;
}
@media(max-width:900px){.stats-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:500px){.stats-grid{grid-template-columns:1fr}}

.stat-card{
  background:var(--card);
  border:1px solid var(--border);
  border-radius:var(--r);
  padding:22px 20px;
  transition:all .2s;
  position:relative;
  overflow:hidden;
}
.stat-card::before{
  content:'';position:absolute;
  top:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.06),transparent);
}
.stat-card:hover{border-color:var(--border2)}

.stat-label{
  font-size:10px;font-weight:700;
  text-transform:uppercase;letter-spacing:.08em;
  color:var(--t3);margin-bottom:10px;
}
.stat-value{
  font-size:30px;font-weight:800;
  color:var(--t1);
  letter-spacing:-.03em;line-height:1;
  margin-bottom:6px;
}
.stat-value.green{color:var(--green)}
.stat-value.yellow{color:var(--yellow)}
.stat-value.red{color:var(--red)}
.stat-sub{font-size:12px;color:var(--t3)}

/* ── Section Header ── */
.section-header{
  display:flex;align-items:center;justify-content:space-between;
  margin-bottom:20px;
}
.section-title{
  font-size:18px;font-weight:700;
  color:var(--t1);letter-spacing:-.02em;
}
.section-count{
  font-size:12px;color:var(--t3);
  background:var(--elev);
  padding:3px 10px;border-radius:100px;
}

/* ── Control Cards ── */
.controls-grid{
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:14px;
  margin-bottom:40px;
}
@media(max-width:800px){.controls-grid{grid-template-columns:1fr}}

.control-card{
  background:var(--card);
  border:1px solid var(--border);
  border-radius:var(--r);
  padding:22px;
  cursor:pointer;
  transition:all .2s;
  position:relative;
  overflow:hidden;
}
.control-card::before{
  content:'';position:absolute;
  top:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.05),transparent);
}
.control-card:hover{
  border-color:var(--border2);
  background:var(--card2);
  transform:translateY(-1px);
  box-shadow:0 8px 24px rgba(0,0,0,.3);
}
.control-card:hover .cc-arrow{opacity:1;transform:translateX(0)}

.cc-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.cc-id{font-family:var(--mono);font-size:12px;font-weight:700;color:var(--blue2);letter-spacing:.02em}
.cc-header-right{display:flex;align-items:center;gap:8px}
.cc-arrow{
  color:var(--t3);font-size:14px;
  opacity:0;transform:translateX(-4px);
  transition:all .2s;
}

.cc-name{font-size:15px;font-weight:600;color:var(--t1);margin-bottom:10px;letter-spacing:-.01em}
.cc-summary{font-size:13px;color:var(--t3);margin-bottom:18px;line-height:1.6;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}

.cc-metrics{display:flex;gap:20px}
.cc-metric{flex:1}
.cc-metric-label{
  font-size:10px;text-transform:uppercase;letter-spacing:.07em;
  color:var(--t3);margin-bottom:7px;font-weight:600;
}
.progress-bar{
  background:rgba(255,255,255,.05);
  border-radius:100px;height:5px;
  overflow:hidden;margin-bottom:5px;
}
.progress-fill{height:100%;border-radius:100px;transition:width .8s cubic-bezier(.4,0,.2,1)}
.cc-metric-val{
  font-family:var(--mono);font-size:12px;font-weight:600;color:var(--t2);
}

/* ── Badges ── */
.badge{
  display:inline-flex;align-items:center;
  padding:3px 9px;
  border-radius:100px;
  font-size:10px;font-weight:700;
  text-transform:uppercase;letter-spacing:.05em;
  white-space:nowrap;
}
.badge-pass{background:rgba(16,185,129,.1);color:#34d399;border:1px solid rgba(16,185,129,.2)}
.badge-partial{background:rgba(245,158,11,.1);color:#fbbf24;border:1px solid rgba(245,158,11,.2)}
.badge-fail{background:rgba(239,68,68,.1);color:#f87171;border:1px solid rgba(239,68,68,.2)}
.badge-low{background:rgba(16,185,129,.1);color:#34d399;border:1px solid rgba(16,185,129,.2)}
.badge-med{background:rgba(245,158,11,.1);color:#fbbf24;border:1px solid rgba(245,158,11,.2)}
.badge-high{background:rgba(249,115,22,.1);color:#fb923c;border:1px solid rgba(249,115,22,.2)}
.badge-crit{background:rgba(239,68,68,.12);color:#fca5a5;border:1px solid rgba(239,68,68,.25)}

/* ── Evidence Table ── */
.evidence-table{width:100%;border-collapse:collapse;margin-bottom:32px}
.evidence-table th{
  text-align:left;padding:10px 16px;
  background:var(--elev);
  color:var(--t3);font-size:10px;
  text-transform:uppercase;letter-spacing:.07em;font-weight:700;
}
.evidence-table th:first-child{border-radius:var(--rs) 0 0 var(--rs)}
.evidence-table th:last-child{border-radius:0 var(--rs) var(--rs) 0}
.evidence-table td{
  padding:12px 16px;
  border-bottom:1px solid rgba(30,42,58,.7);
  font-size:13px;
  vertical-align:top;
}
.evidence-table tr:hover td{background:rgba(14,20,32,.6)}
.evidence-table tr:last-child td{border-bottom:none}
.evidence-table code{
  font-family:var(--mono);font-size:11px;
  background:rgba(34,211,238,.06);
  color:var(--cyan);
  padding:2px 7px;border-radius:4px;
}

/* ── Tabs ── */
.tabs{
  display:flex;gap:2px;
  margin-bottom:28px;
  border-bottom:1px solid var(--border);
  padding-bottom:0;
}
.tab{
  padding:10px 18px;
  font-size:13px;font-weight:600;
  color:var(--t3);
  cursor:pointer;border:none;background:none;
  font-family:var(--sans);
  border-bottom:2px solid transparent;
  margin-bottom:-1px;
  transition:all .15s;
  letter-spacing:-.01em;
}
.tab:hover{color:var(--t2)}
.tab.act{color:var(--blue2);border-bottom-color:var(--blue)}
.tab-panel{display:none}.tab-panel.act{display:block}

/* ── Control Detail Slide-over ── */
.slideover-backdrop{
  position:fixed;inset:0;
  background:rgba(0,0,0,.6);
  backdrop-filter:blur(4px);
  -webkit-backdrop-filter:blur(4px);
  z-index:300;
  opacity:0;
  animation:backdropIn .2s ease forwards;
}
@keyframes backdropIn{to{opacity:1}}

.slideover{
  position:fixed;top:0;right:0;bottom:0;
  width:min(640px,100vw);
  background:var(--bg2);
  border-left:1px solid var(--border2);
  z-index:301;
  overflow-y:auto;
  box-shadow:-20px 0 60px rgba(0,0,0,.5);
  transform:translateX(100%);
  animation:slideIn .25s cubic-bezier(.4,0,.2,1) forwards;
}
@keyframes slideIn{to{transform:translateX(0)}}

.slideover-header{
  display:flex;align-items:center;justify-content:space-between;
  padding:24px 28px;
  border-bottom:1px solid var(--border);
  position:sticky;top:0;
  background:var(--bg2);
  z-index:1;
}
.slideover-title{font-size:18px;font-weight:700;color:var(--t1);letter-spacing:-.02em}
.slideover-close{
  width:32px;height:32px;
  display:flex;align-items:center;justify-content:center;
  border-radius:8px;background:var(--elev);
  border:1px solid var(--border2);
  color:var(--t2);cursor:pointer;
  font-size:18px;line-height:1;
  transition:all .15s;
}
.slideover-close:hover{background:var(--card2);color:var(--t1)}

.slideover-body{padding:28px}

.so-section{margin-bottom:32px}
.so-section-title{
  font-size:11px;font-weight:700;
  text-transform:uppercase;letter-spacing:.08em;
  color:var(--t3);
  margin-bottom:14px;
  padding-bottom:8px;
  border-bottom:1px solid var(--border);
}

.so-summary{
  font-size:14px;color:var(--t2);line-height:1.7;
  padding:16px;
  background:var(--card);
  border-radius:var(--rs);
  border:1px solid var(--border);
}

/* Findings in slideover */
.finding-card{
  border-radius:var(--rs);
  overflow:hidden;
  margin-bottom:10px;
  border:1px solid var(--border);
}
.finding-card-header{
  display:flex;align-items:center;gap:10px;
  padding:12px 14px;
  background:var(--card);
}
.finding-card-body{
  padding:12px 14px;
  background:rgba(14,20,32,.5);
  border-top:1px solid var(--border);
}
.finding-title{font-size:14px;font-weight:600;color:var(--t1)}
.finding-desc{font-size:13px;color:var(--t2);line-height:1.6;margin-bottom:8px}
.finding-evidence{
  font-size:11px;color:var(--t3);
  font-family:var(--mono);
  padding:8px 10px;
  background:var(--bg);
  border-radius:6px;
  border:1px solid var(--border);
  line-height:1.5;
}

/* Remediations in slideover */
.rem-card{
  background:var(--card);
  border:1px solid var(--border);
  border-radius:var(--rs);
  margin-bottom:10px;
  overflow:hidden;
}
.rem-card-header{
  display:flex;align-items:flex-start;gap:12px;
  padding:14px 16px;
}
.rem-priority{
  width:28px;height:28px;flex-shrink:0;
  background:var(--grad);
  border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  color:#fff;font-weight:700;font-size:12px;
  box-shadow:0 0 12px rgba(59,130,246,.2);
}
.rem-title{font-size:14px;font-weight:600;color:var(--t1);margin-bottom:3px}
.rem-meta{font-size:11px;color:var(--t3)}
.rem-desc{
  font-size:13px;color:var(--t2);line-height:1.6;
  padding:0 16px 12px 56px;
}
.rem-steps{
  padding:12px 16px;
  background:rgba(6,10,16,.6);
  border-top:1px solid var(--border);
}
.rem-step{
  display:flex;gap:10px;
  padding:6px 0;
  font-size:13px;color:var(--t2);
  border-bottom:1px solid rgba(30,42,58,.5);
}
.rem-step:last-child{border:none;padding-bottom:0}
.rem-step-num{
  color:var(--t3);font-weight:700;font-size:12px;
  font-family:var(--mono);min-width:18px;
}

/* Auditor Q in slideover */
.auditor-q{
  display:flex;gap:10px;
  padding:12px;
  background:var(--card);
  border:1px solid var(--border);
  border-radius:var(--rs);
  margin-bottom:8px;
  font-size:13px;color:var(--t2);line-height:1.6;
}
.auditor-q-icon{color:var(--yellow);font-size:16px;flex-shrink:0;margin-top:1px}

/* ── Connect / Setup Steps ── */
.setup-steps{counter-reset:step}
.setup-step{
  display:flex;gap:20px;
  margin-bottom:28px;
  padding-bottom:28px;
  border-bottom:1px solid var(--border);
}
.setup-step:last-child{border:none;margin:0;padding:0}
.setup-step-num{
  width:36px;height:36px;flex-shrink:0;
  border-radius:50%;
  background:var(--grad);
  display:flex;align-items:center;justify-content:center;
  color:#fff;font-weight:700;font-size:14px;
  counter-increment:step;
  box-shadow:0 0 16px rgba(59,130,246,.2);
}
.setup-step-content{flex:1;padding-top:4px}
.setup-step-title{font-size:15px;font-weight:600;color:var(--t1);margin-bottom:6px}
.setup-step-desc{font-size:13px;color:var(--t3);line-height:1.65;margin-bottom:12px}
.inline-code{
  font-family:var(--mono);font-size:12px;
  background:rgba(34,211,238,.07);color:var(--cyan);
  padding:2px 7px;border-radius:4px;
}

/* ── YAML Box ── */
.yaml-box{
  background:var(--bg);
  border:1px solid var(--border2);
  border-radius:var(--rs);
  padding:20px;
  font-family:var(--mono);font-size:12px;
  line-height:1.8;color:var(--cyan);
  overflow-x:auto;max-height:440px;overflow-y:auto;
  white-space:pre;margin-top:16px;
}

/* ── Input ── */
input[type=text]{
  width:100%;padding:11px 16px;
  background:var(--bg2);
  border:1px solid var(--border2);
  border-radius:var(--rs);
  color:var(--t1);
  font-family:var(--mono);font-size:13px;
  outline:none;transition:all .2s;
}
input[type=text]:focus{
  border-color:var(--blue);
  box-shadow:0 0 0 3px rgba(59,130,246,.1);
}
input[type=text]::placeholder{color:var(--t3)}

/* ── Scan Progress ── */
.prog-item{
  display:flex;align-items:center;gap:16px;
  padding:14px 18px;
  background:var(--card);
  border:1px solid var(--border);
  border-radius:var(--rs);
  margin-bottom:8px;
  transition:all .2s;
}
.prog-item.active{border-color:rgba(59,130,246,.4);background:rgba(59,130,246,.04)}
.prog-item.done{border-color:rgba(16,185,129,.25)}
.prog-icon{
  width:38px;height:38px;border-radius:10px;
  display:flex;align-items:center;justify-content:center;
  font-size:17px;flex-shrink:0;
}
.prog-icon.pending{background:var(--elev);color:var(--t3)}
.prog-icon.scanning{background:rgba(59,130,246,.1);color:var(--blue);animation:pulse 1s infinite}
.prog-icon.complete{background:rgba(16,185,129,.1);color:var(--green)}
.prog-icon.error{background:rgba(239,68,68,.1);color:var(--red)}
.prog-name{font-size:14px;font-weight:600;color:var(--t1)}
.prog-msg{font-size:12px;color:var(--t3);margin-top:2px}
.prog-count{font-family:var(--mono);font-size:13px;font-weight:600;color:var(--t2)}

.spin{display:inline-block;animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

/* ── AI Banner ── */
.ai-banner{
  margin-top:24px;padding:18px 20px;
  background:rgba(139,92,246,.05);
  border:1px solid rgba(139,92,246,.15);
  border-radius:var(--rs);
  display:none;
}
.ai-banner-title{
  display:flex;align-items:center;gap:8px;
  color:var(--purple);font-weight:600;font-size:14px;
  margin-bottom:6px;
}
.ai-banner-msg{font-size:13px;color:var(--t3)}

/* ── Remediation cards in tab ── */
.rem-full-card{
  background:var(--card);
  border:1px solid var(--border);
  border-radius:var(--r);
  padding:24px;
  margin-bottom:16px;
}

/* ── Findings in tab ── */
.tab-finding{
  background:var(--card);
  border:1px solid var(--border);
  border-left:3px solid var(--border);
  border-radius:var(--rs);
  padding:16px;
  margin-bottom:10px;
}
.tab-finding.critical{border-left-color:var(--red)}
.tab-finding.high{border-left-color:var(--orange)}
.tab-finding.medium{border-left-color:var(--yellow)}
.tab-finding.low{border-left-color:var(--green)}

/* ── Error box ── */
.error-box{
  padding:12px 16px;
  background:rgba(239,68,68,.06);
  border:1px solid rgba(239,68,68,.2);
  border-radius:var(--rs);
  color:#f87171;font-size:13px;
  margin-top:12px;
}
</style>
</head>
<body>
<div class="app" id="app">

  <!-- Navigation -->
  <nav>
    <div class="nl">
      <div class="nl-logo">L</div>
      <div class="nl-brand">LoxeAI<span>Evidence Tracer</span></div>
    </div>
    <div class="nls">
      <button class="nlk act" onclick="showSection('demo')">Demo</button>
      <button class="nlk" onclick="showSection('connect')">Connect AWS</button>
      <button class="nlk" onclick="showSection('scan')">Scan</button>
      <button class="nlk" onclick="showSection('results')">Results</button>
    </div>
  </nav>

  <div class="ctr">

    <!-- ══ DEMO SECTION ══ -->
    <div class="sec act" id="sec-demo">
      <div class="eyebrow"><span class="eyebrow-dot"></span>Live Demo — AcmePay Inc.</div>
      <h1 class="hero-title">SOC 2 evidence collection<br>in <span class="gr">4 minutes, not 4 weeks.</span></h1>
      <p class="hero-sub">LoxeAI Evidence Tracer scans your AWS infrastructure, maps evidence to SOC 2 controls with AI, and generates an auditor-ready report — automatically.</p>

      <div class="hero-cta">
        <button class="btn btn-primary" onclick="showSection('connect')">⚡ Connect Your AWS Account</button>
        <button class="btn btn-secondary" onclick="scrollToDemoResults()">View Demo Results</button>
      </div>

      <div class="demo-banner" id="demo-results-anchor">
        <div class="demo-banner-icon">🏦</div>
        <div class="demo-banner-text">
          <h3>AcmePay Inc. — Demo Scan Results</h3>
          <p>Series B fintech SaaS &bull; AWS Account 743820195634 &bull; 847 evidence items &bull; Scanned in 4m 32s</p>
        </div>
      </div>

      <div class="stats-grid" id="demo-stats"></div>

      <div class="section-header" style="margin-top:8px">
        <div class="section-title">SOC 2 Control Assessment</div>
        <div class="section-count" id="demo-control-count"></div>
      </div>
      <div class="controls-grid" id="demo-controls"></div>

      <div class="section-header">
        <div class="section-title">Evidence Findings</div>
      </div>
      <table class="evidence-table">
        <thead>
          <tr>
            <th>Service</th>
            <th>Finding</th>
            <th>Status</th>
            <th>Resource</th>
            <th>Region</th>
          </tr>
        </thead>
        <tbody id="demo-findings"></tbody>
      </table>
    </div>

    <!-- ══ CONNECT SECTION ══ -->
    <div class="sec" id="sec-connect">
      <h1 class="hero-title" style="font-size:34px;margin-bottom:12px">Connect Your <span class="gr">AWS Account</span></h1>
      <p class="hero-sub" style="margin-bottom:40px">Deploy a read-only IAM role via CloudFormation, then enter the Role ARN below. LoxeAI never gets write access to your account.</p>

      <div class="setup-steps">
        <div class="setup-step">
          <div class="setup-step-num">1</div>
          <div class="setup-step-content">
            <div class="setup-step-title">Download the CloudFormation Stack</div>
            <div class="setup-step-desc">This template creates a read-only IAM role named <span class="inline-code">LoxeAI-EVT-ReadOnly</span> with permissions to read IAM, CloudTrail, S3, Config, EC2, and CloudWatch data. No write permissions are granted.</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <button class="btn btn-primary btn-sm" onclick="downloadCFN()">⬇ Download YAML</button>
              <button class="btn btn-secondary btn-sm" onclick="toggleYaml()">View Template</button>
            </div>
            <div id="yaml-display" style="display:none">
              <div class="yaml-box" id="cfn-yaml"></div>
            </div>
          </div>
        </div>

        <div class="setup-step">
          <div class="setup-step-num">2</div>
          <div class="setup-step-content">
            <div class="setup-step-title">Deploy in AWS CloudFormation</div>
            <div class="setup-step-desc">Go to <strong style="color:var(--t2)">AWS Console → CloudFormation → Create Stack</strong>. Upload the YAML file. Enter your LoxeAI AWS Account ID when prompted. Wait for the stack to complete (~60 seconds).</div>
          </div>
        </div>

        <div class="setup-step">
          <div class="setup-step-num">3</div>
          <div class="setup-step-content">
            <div class="setup-step-title">Enter Your Role ARN</div>
            <div class="setup-step-desc">Copy the Role ARN from the CloudFormation Outputs tab and paste it below.</div>
            <input type="text" id="role-arn-input" placeholder="arn:aws:iam::123456789012:role/LoxeAI-EVT-ReadOnly">
          </div>
        </div>

        <div class="setup-step">
          <div class="setup-step-num">4</div>
          <div class="setup-step-content">
            <div class="setup-step-title">Run Evidence Scan</div>
            <div class="setup-step-desc">Click the button below to start scanning. LoxeAI will assume the role, collect evidence across all regions, and analyze it against SOC 2 controls.</div>
            <button class="btn btn-primary" onclick="startScan()">⚡ Run Evidence Scan</button>
            <div id="scan-error" class="error-box" style="display:none"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ SCAN PROGRESS SECTION ══ -->
    <div class="sec" id="sec-scan">
      <h1 class="hero-title" style="font-size:32px;margin-bottom:8px">
        <span class="spin">⚙</span> Scanning <span class="gr">AWS Infrastructure</span>
      </h1>
      <p class="hero-sub" style="margin-bottom:28px" id="scan-status-msg">Initializing scan...</p>
      <div id="scan-progress"></div>
      <div class="ai-banner" id="scan-ai-status">
        <div class="ai-banner-title"><span class="spin">⚙</span> AI Analysis in Progress</div>
        <div class="ai-banner-msg" id="ai-progress-msg">Mapping evidence to SOC 2 controls...</div>
      </div>
    </div>

    <!-- ══ RESULTS SECTION ══ -->
    <div class="sec" id="sec-results">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:28px;gap:16px;flex-wrap:wrap">
        <div>
          <h1 class="hero-title" style="font-size:32px;margin-bottom:4px">Scan <span class="gr">Results</span></h1>
          <p style="color:var(--t3);font-size:14px" id="results-meta"></p>
        </div>
        <div style="display:flex;gap:8px;flex-shrink:0">
          <button class="btn btn-green btn-sm" onclick="downloadReport('html')">⬇ HTML Report</button>
          <button class="btn btn-secondary btn-sm" onclick="downloadReport('json')">⬇ JSON Package</button>
        </div>
      </div>

      <div class="stats-grid" id="results-stats"></div>

      <div class="tabs">
        <button class="tab act" onclick="showTab('tab-controls',this)">Controls</button>
        <button class="tab" onclick="showTab('tab-findings',this)">Findings</button>
        <button class="tab" onclick="showTab('tab-remediation',this)">Remediation</button>
        <button class="tab" onclick="showTab('tab-evidence',this)">Evidence</button>
      </div>

      <div class="tab-panel act" id="tab-controls">
        <div class="controls-grid" id="results-controls"></div>
      </div>
      <div class="tab-panel" id="tab-findings">
        <div id="results-findings"></div>
      </div>
      <div class="tab-panel" id="tab-remediation">
        <div id="results-remediation"></div>
      </div>
      <div class="tab-panel" id="tab-evidence">
        <table class="evidence-table">
          <thead>
            <tr><th>Service</th><th>Finding</th><th>Status</th><th>Resource</th><th>Region</th></tr>
          </thead>
          <tbody id="results-evidence"></tbody>
        </table>
      </div>
    </div>

  </div><!-- /ctr -->
</div><!-- /app -->

<!-- ══ CONTROL DETAIL SLIDE-OVER ══ -->
<div id="slideover-backdrop" class="slideover-backdrop" style="display:none" onclick="closeSlideOver()"></div>
<div id="slideover" class="slideover" style="display:none">
  <div class="slideover-header">
    <div>
      <div id="so-control-id" style="font-family:var(--mono);font-size:12px;font-weight:700;color:var(--blue2);margin-bottom:4px"></div>
      <div class="slideover-title" id="so-control-name"></div>
    </div>
    <div style="display:flex;align-items:center;gap:10px">
      <span id="so-status-badge"></span>
      <div class="slideover-close" onclick="closeSlideOver()">✕</div>
    </div>
  </div>
  <div class="slideover-body" id="slideover-body"></div>
</div>

<script>
// ════════════════════════════════════════════════
// State
// ════════════════════════════════════════════════
let currentScanId = null;
let currentResults = null;

// ════════════════════════════════════════════════
// Navigation
// ════════════════════════════════════════════════
function showSection(name) {
  document.querySelectorAll('.sec').forEach(s => s.classList.remove('act'));
  document.getElementById('sec-' + name)?.classList.add('act');
  document.querySelectorAll('.nlk').forEach(l => l.classList.remove('act'));
  const map = {demo:'demo',connect:'connect',scan:'scan',results:'result'};
  document.querySelectorAll('.nlk').forEach(l => {
    if (l.textContent.toLowerCase().includes(map[name] || name)) l.classList.add('act');
  });
}

function showTab(tabId, btn) {
  document.querySelectorAll('.tab-panel').forEach(t => t.classList.remove('act'));
  document.getElementById(tabId)?.classList.add('act');
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('act'));
  btn?.classList.add('act');
}

function scrollToDemoResults() {
  const el = document.getElementById('demo-results-anchor');
  if (el) el.scrollIntoView({behavior:'smooth', block:'start'});
}

// ════════════════════════════════════════════════
// Badge helpers
// ════════════════════════════════════════════════
function statusBadge(status) {
  const map = {
    PASS:'pass', PARTIAL:'partial', FAIL:'fail',
    LOW:'low', MEDIUM:'med', HIGH:'high', CRITICAL:'crit'
  };
  const cls = map[status] || 'med';
  return '<span class="badge badge-' + cls + '">' + status + '</span>';
}

function findingBadge(status) {
  if (status === 'pass') return '<span class="badge badge-pass">PASS</span>';
  if (status === 'fail') return '<span class="badge badge-fail">FAIL</span>';
  return '<span class="badge badge-med">INFO</span>';
}

function barColor(v) {
  return v >= 80 ? 'var(--green)' : v >= 60 ? 'var(--yellow)' : 'var(--red)';
}

// ════════════════════════════════════════════════
// Render helpers
// ════════════════════════════════════════════════
function renderStats(containerId, stats) {
  document.getElementById(containerId).innerHTML = stats.map(s =>
    '<div class="stat-card">' +
    '<div class="stat-label">' + s.label + '</div>' +
    '<div class="stat-value ' + (s.color || '') + '">' + s.value + '</div>' +
    '<div class="stat-sub">' + s.sub + '</div></div>'
  ).join('');
}

function renderControls(containerId, controls) {
  const source = containerId.includes('demo') ? 'demo' : 'results';
  document.getElementById(containerId).innerHTML = controls.map(c =>
    '<div class="control-card" onclick="openControlDetail(' + "'" + c.control_id + "','" + source + "'" + ')">' +
    '<div class="cc-header">' +
    '<span class="cc-id">' + c.control_id + '</span>' +
    '<div class="cc-header-right">' +
    statusBadge(c.status) +
    '<span class="cc-arrow">→</span>' +
    '</div></div>' +
    '<div class="cc-name">' + c.control_name + '</div>' +
    '<div class="cc-summary">' + c.summary + '</div>' +
    '<div class="cc-metrics">' +
    '<div class="cc-metric">' +
    '<div class="cc-metric-label">Gap Score</div>' +
    '<div class="progress-bar"><div class="progress-fill" style="width:' + c.gap_score + '%;background:' + barColor(c.gap_score) + '"></div></div>' +
    '<div class="cc-metric-val">' + c.gap_score + '/100</div></div>' +
    '<div class="cc-metric">' +
    '<div class="cc-metric-label">Freshness</div>' +
    '<div class="progress-bar"><div class="progress-fill" style="width:' + c.freshness_score + '%;background:' + barColor(c.freshness_score) + '"></div></div>' +
    '<div class="cc-metric-val">' + c.freshness_score + '/100</div></div>' +
    '<div class="cc-metric">' +
    '<div class="cc-metric-label">Audit Risk</div>' +
    statusBadge(c.audit_risk) + '</div>' +
    '</div></div>'
  ).join('');
}

function renderFindings(containerId, controls) {
  let html = '';
  controls.forEach(c => {
    if (!c.critical_findings?.length) return;
    html += '<h3 style="font-size:14px;font-weight:700;color:var(--t1);margin:20px 0 10px;letter-spacing:-.01em">' +
      '<span style="font-family:var(--mono);color:var(--blue2);margin-right:8px">' + c.control_id + '</span>' +
      c.control_name + '</h3>';
    c.critical_findings.forEach(f => {
      const cls = f.severity.toLowerCase();
      html += '<div class="tab-finding ' + cls + '">' +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">' +
        statusBadge(f.severity) +
        '<strong style="color:var(--t1);font-size:14px;letter-spacing:-.01em">' + f.title + '</strong></div>' +
        '<div style="font-size:13px;color:var(--t2);line-height:1.6;margin-bottom:8px">' + f.description + '</div>' +
        '<div style="font-size:11px;color:var(--t3);font-family:var(--mono);padding:8px;background:var(--bg);border-radius:6px">Resource: ' + f.resource + '</div>' +
        '</div>';
    });
  });
  document.getElementById(containerId).innerHTML = html || '<p style="color:var(--t3)">No critical findings.</p>';
}

function renderRemediation(containerId, controls) {
  let all = [];
  controls.forEach(c => {
    (c.recommended_remediations || []).forEach(r => all.push({...r, control_id: c.control_id}));
  });
  all.sort((a, b) => a.priority - b.priority);
  document.getElementById(containerId).innerHTML = all.map(r =>
    '<div class="rem-full-card">' +
    '<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">' +
    '<div style="width:30px;height:30px;flex-shrink:0;background:var(--grad);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:12px">P' + r.priority + '</div>' +
    '<div><div style="color:var(--t1);font-weight:600;font-size:15px;letter-spacing:-.01em">' + r.title + '</div>' +
    '<div style="font-size:11px;color:var(--t3);margin-top:2px">' + r.control_id + ' — ' + r.estimated_effort + '</div></div></div>' +
    '<p style="font-size:13px;color:var(--t2);line-height:1.65;margin-bottom:14px">' + r.description + '</p>' +
    '<div style="background:var(--bg2);border-radius:var(--rs);padding:14px;border:1px solid var(--border)">' +
    r.steps.map((s, i) =>
      '<div style="display:flex;gap:10px;padding:6px 0;border-bottom:1px solid rgba(30,42,58,.6);font-size:13px;color:var(--t2)">' +
      '<span style="color:var(--t3);font-family:var(--mono);font-size:11px;font-weight:700;min-width:18px">' + (i + 1) + '.</span>' + s + '</div>'
    ).join('') +
    '</div></div>'
  ).join('');
}

function renderEvidence(containerId, items) {
  document.getElementById(containerId).innerHTML = (items || []).map(e =>
    '<tr>' +
    '<td style="color:var(--cyan);font-family:var(--mono);font-size:11px">' + e.service + '</td>' +
    '<td style="color:var(--t2)">' + e.summary + '</td>' +
    '<td>' + findingBadge(e.status) + '</td>' +
    '<td><code>' + e.resource_id + '</code></td>' +
    '<td style="color:var(--t3);font-size:12px">' + e.region + '</td></tr>'
  ).join('');
}

// ════════════════════════════════════════════════
// Control Detail Slide-over
// ════════════════════════════════════════════════
function openControlDetail(controlId, source) {
  const data = currentResults;
  if (!data) return;
  const c = data.controls.find(x => x.control_id === controlId);
  if (!c) return;

  document.getElementById('so-control-id').textContent = c.control_id;
  document.getElementById('so-control-name').textContent = c.control_name;
  document.getElementById('so-status-badge').innerHTML = statusBadge(c.status);

  let html = '';

  // Summary
  html += '<div class="so-section"><div class="so-section-title">Assessment Summary</div>';
  html += '<div class="so-summary">' + c.summary + '</div></div>';

  // Metrics row
  html += '<div class="so-section"><div class="so-section-title">Scores</div>';
  html += '<div style="display:flex;gap:16px">';
  [
    {label:'Gap Score', val: c.gap_score},
    {label:'Freshness', val: c.freshness_score}
  ].forEach(m => {
    html += '<div style="flex:1;background:var(--card);border:1px solid var(--border);border-radius:var(--rs);padding:14px">' +
      '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--t3);margin-bottom:8px">' + m.label + '</div>' +
      '<div class="progress-bar"><div class="progress-fill" style="width:' + m.val + '%;background:' + barColor(m.val) + '"></div></div>' +
      '<div style="font-family:var(--mono);font-size:14px;font-weight:700;color:var(--t1);margin-top:6px">' + m.val + '/100</div>' +
      '</div>';
  });
  html += '<div style="background:var(--card);border:1px solid var(--border);border-radius:var(--rs);padding:14px">' +
    '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--t3);margin-bottom:10px">Audit Risk</div>' +
    statusBadge(c.audit_risk) + '</div>';
  html += '</div></div>';

  // Findings
  if (c.critical_findings?.length) {
    html += '<div class="so-section"><div class="so-section-title">Findings (' + c.critical_findings.length + ')</div>';
    c.critical_findings.forEach(f => {
      const cls = f.severity.toLowerCase();
      html += '<div class="finding-card">' +
        '<div class="finding-card-header">' +
        statusBadge(f.severity) +
        '<div class="finding-title">' + f.title + '</div></div>' +
        '<div class="finding-card-body">' +
        '<div class="finding-desc">' + f.description + '</div>' +
        '<div class="finding-evidence"><strong>Resource:</strong> ' + f.resource + '<br><strong>Evidence:</strong> ' + f.evidence + '</div>' +
        '</div></div>';
    });
    html += '</div>';
  }

  // Remediations
  if (c.recommended_remediations?.length) {
    html += '<div class="so-section"><div class="so-section-title">Recommended Remediations</div>';
    c.recommended_remediations.forEach(r => {
      html += '<div class="rem-card">' +
        '<div class="rem-card-header">' +
        '<div class="rem-priority">P' + r.priority + '</div>' +
        '<div><div class="rem-title">' + r.title + '</div>' +
        '<div class="rem-meta">' + r.estimated_effort + '</div></div></div>' +
        '<div class="rem-desc">' + r.description + '</div>';
      if (r.steps?.length) {
        html += '<div class="rem-steps">' +
          r.steps.map((s, i) =>
            '<div class="rem-step"><span class="rem-step-num">' + (i + 1) + '.</span><span>' + s + '</span></div>'
          ).join('') +
          '</div>';
      }
      html += '</div>';
    });
    html += '</div>';
  }

  // Auditor questions
  if (c.auditor_questions?.length) {
    html += '<div class="so-section"><div class="so-section-title">Likely Auditor Questions</div>';
    c.auditor_questions.forEach(q => {
      html += '<div class="auditor-q"><span class="auditor-q-icon">?</span><span>' + q + '</span></div>';
    });
    html += '</div>';
  }

  document.getElementById('slideover-body').innerHTML = html;

  // Show
  const backdrop = document.getElementById('slideover-backdrop');
  const panel = document.getElementById('slideover');
  backdrop.style.display = 'block';
  panel.style.display = 'block';
  // Force reflow then animate
  panel.style.transform = 'translateX(100%)';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      panel.style.transition = 'transform .25s cubic-bezier(.4,0,.2,1)';
      panel.style.transform = 'translateX(0)';
    });
  });
  document.body.style.overflow = 'hidden';
}

function closeSlideOver() {
  const panel = document.getElementById('slideover');
  const backdrop = document.getElementById('slideover-backdrop');
  panel.style.transition = 'transform .2s cubic-bezier(.4,0,.2,1)';
  panel.style.transform = 'translateX(100%)';
  backdrop.style.opacity = '0';
  backdrop.style.transition = 'opacity .2s ease';
  setTimeout(() => {
    panel.style.display = 'none';
    backdrop.style.display = 'none';
    backdrop.style.opacity = '';
    backdrop.style.transition = '';
    panel.style.transition = '';
    document.body.style.overflow = '';
  }, 200);
}

// Close on Escape
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSlideOver(); });

// ════════════════════════════════════════════════
// Demo Data
// ════════════════════════════════════════════════
async function loadDemoData() {
  try {
    const resp = await fetch('/api/demo');
    if (!resp.ok) throw new Error('Failed to load demo');
    return await resp.json();
  } catch(e) {
    console.error('Demo load error:', e);
    return null;
  }
}

// ════════════════════════════════════════════════
// CloudFormation YAML
// ════════════════════════════════════════════════
let cfnYaml = '';
async function loadCFN() {
  try {
    const resp = await fetch('/api/cloudformation');
    cfnYaml = await resp.text();
    document.getElementById('cfn-yaml').textContent = cfnYaml;
  } catch(e) { console.error(e); }
}
function toggleYaml() {
  const el = document.getElementById('yaml-display');
  el.style.display = el.style.display === 'none' ? 'block' : 'none';
  if (!cfnYaml) loadCFN();
}
function downloadCFN() {
  if (!cfnYaml) {
    fetch('/api/cloudformation').then(r => r.text()).then(t => {
      cfnYaml = t;
      triggerDownload(cfnYaml, 'loxeai-evt-role.yaml', 'text/yaml');
    });
  } else {
    triggerDownload(cfnYaml, 'loxeai-evt-role.yaml', 'text/yaml');
  }
}
function triggerDownload(content, filename, mime) {
  const blob = new Blob([content], {type: mime});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ════════════════════════════════════════════════
// Real Scan
// ════════════════════════════════════════════════
async function startScan() {
  const roleArn = document.getElementById('role-arn-input').value.trim();
  if (!roleArn || !roleArn.startsWith('arn:aws:iam::')) {
    const err = document.getElementById('scan-error');
    err.style.display = 'block';
    err.textContent = 'Please enter a valid IAM Role ARN (e.g. arn:aws:iam::123456789012:role/LoxeAI-EVT-ReadOnly)';
    return;
  }
  document.getElementById('scan-error').style.display = 'none';
  showSection('scan');

  const services = ['iam','s3','cloudtrail','config','ec2','cloudwatch'];
  const icons = {iam:'👤',s3:'🗂',cloudtrail:'👁',config:'⚙',ec2:'💻',cloudwatch:'📈'};
  const names = {
    iam:'IAM — Users, Roles, Keys, MFA',
    s3:'S3 — Buckets, Encryption, Access',
    cloudtrail:'CloudTrail — Trails, Logging',
    config:'AWS Config — Recorders, Rules',
    ec2:'EC2 — Instances, Security Groups, VPCs',
    cloudwatch:'CloudWatch — Alarms, Log Groups'
  };

  document.getElementById('scan-progress').innerHTML = services.map(s =>
    '<div class="prog-item" id="prog-' + s + '">' +
    '<div class="prog-icon pending" id="prog-icon-' + s + '">' + icons[s] + '</div>' +
    '<div style="flex:1"><div class="prog-name">' + names[s] + '</div>' +
    '<div class="prog-msg" id="prog-msg-' + s + '">Waiting...</div></div>' +
    '<div class="prog-count" id="prog-count-' + s + '">—</div></div>'
  ).join('');

  try {
    const resp = await fetch('/api/scan', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({role_arn: roleArn, org_name:'My Organization'})
    });
    if (!resp.ok) { const err = await resp.json(); throw new Error(err.error || 'Scan failed'); }
    const result = await resp.json();
    currentScanId = result.scan_id;
    pollScanProgress(result.scan_id);
  } catch(e) {
    const msg = document.getElementById('scan-status-msg');
    msg.textContent = 'Error: ' + e.message;
    msg.style.color = 'var(--red)';
  }
}

async function pollScanProgress(scanId) {
  const waitForScan = async () => {
    try {
      const resp = await fetch('/api/scan/' + scanId + '/status');
      const data = await resp.json();
      if (data.progress) {
        data.progress.forEach(p => {
          const icon = document.getElementById('prog-icon-' + p.service);
          const msg = document.getElementById('prog-msg-' + p.service);
          const count = document.getElementById('prog-count-' + p.service);
          const item = document.getElementById('prog-' + p.service);
          if (!icon) return;
          icon.className = 'prog-icon ' + p.status;
          if (msg) msg.textContent = p.message;
          if (count) count.textContent = p.itemCount > 0 ? p.itemCount + ' items' : '—';
          if (item) {
            item.className = 'prog-item' + (p.status === 'scanning' ? ' active' : '') + (p.status === 'complete' ? ' done' : '');
          }
        });
      }
      if (data.status === 'error') {
        document.getElementById('scan-status-msg').textContent = 'Error: ' + (data.error || 'Unknown');
        document.getElementById('scan-status-msg').style.color = 'var(--red)';
        return;
      }
      if (data.status === 'analyzing' || data.status === 'complete') {
        document.getElementById('scan-ai-status').style.display = 'block';
        document.getElementById('scan-status-msg').textContent = 'Evidence collected. Running AI analysis...';
        pollAnalysis(scanId, 0);
        return;
      }
      setTimeout(waitForScan, 2000);
    } catch(e) { setTimeout(waitForScan, 3000); }
  };
  waitForScan();
}

async function pollAnalysis(scanId, analyzed) {
  document.getElementById('ai-progress-msg').textContent = 'Analyzing control ' + (analyzed + 1) + ' of 8...';
  try {
    const resp = await fetch('/api/scan/' + scanId + '/analyze', {method:'POST'});
    const data = await resp.json();
    if (data.control_id) {
      document.getElementById('ai-progress-msg').textContent = 'Analyzed ' + data.analyzed + '/8: ' + data.control_id + ' ✓';
    }
    if (data.done) {
      document.getElementById('ai-progress-msg').textContent = 'All controls analyzed. Loading results...';
      await loadScanResults(scanId);
      showSection('results');
      return;
    }
    setTimeout(() => pollAnalysis(scanId, data.analyzed || analyzed + 1), 500);
  } catch(e) { setTimeout(() => pollAnalysis(scanId, analyzed), 3000); }
}

async function loadScanResults(scanId) {
  try {
    const resp = await fetch('/api/scan/' + scanId + '/results');
    const data = await resp.json();
    currentResults = data;
    displayResults(data);
  } catch(e) { console.error('Load results error:', e); }
}

function displayResults(data) {
  const controls = data.controls || [];
  const evidence = data.evidence || [];
  const org = data.org || {};
  const avgGap = controls.length ? Math.round(controls.reduce((s,c) => s + c.gap_score, 0) / controls.length) : 0;
  const avgFresh = controls.length ? Math.round(controls.reduce((s,c) => s + c.freshness_score, 0) / controls.length) : 0;
  const fail = controls.filter(c => c.status === 'FAIL').length;
  const partial = controls.filter(c => c.status === 'PARTIAL').length;

  document.getElementById('results-meta').textContent =
    (org.name||'Organization') + ' — ' + (org.accountId||'N/A') + ' — ' + (evidence.length||0) + ' evidence items';

  renderStats('results-stats', [
    {label:'Evidence Items', value: evidence.length||org.totalEvidenceItems||0, sub:'Across 6 AWS services'},
    {label:'Avg Gap Score', value: avgGap+'/100', sub: fail+' failing, '+partial+' partial', color: avgGap>=80?'green':avgGap>=60?'yellow':'red'},
    {label:'Avg Freshness', value: avgFresh+'/100', sub:'Evidence recency score', color: avgFresh>=80?'green':'yellow'},
    {label:'Controls Assessed', value: controls.length, sub: controls.filter(c=>c.status==='PASS').length+' passing', color:'green'},
  ]);

  renderControls('results-controls', controls);
  renderFindings('results-findings', controls);
  renderRemediation('results-remediation', controls);
  renderEvidence('results-evidence', evidence);
}

async function downloadReport(type) {
  if (!currentScanId && currentResults) {
    window.open('/api/demo/report?type=' + type, '_blank');
    return;
  }
  if (currentScanId) {
    window.open('/api/scan/' + currentScanId + '/report?type=' + type, '_blank');
  }
}

// ════════════════════════════════════════════════
// Init — load demo on page load
// ════════════════════════════════════════════════
loadDemoData().then(data => {
  if (!data) return;
  currentResults = data;

  const avgGap = Math.round(data.controls.reduce((s,c) => s + c.gap_score, 0) / data.controls.length);
  const avgFresh = Math.round(data.controls.reduce((s,c) => s + c.freshness_score, 0) / data.controls.length);
  const fail = data.controls.filter(c => c.status === 'FAIL').length;
  const partial = data.controls.filter(c => c.status === 'PARTIAL').length;

  renderStats('demo-stats', [
    {label:'Evidence Items', value: data.org.totalEvidenceItems, sub:'Across 6 AWS services'},
    {label:'Avg Gap Score', value: avgGap+'/100', sub: fail+' failing, '+partial+' partial', color: avgGap>=80?'green':avgGap>=60?'yellow':'red'},
    {label:'Avg Freshness', value: avgFresh+'/100', sub:'Evidence recency score', color: avgFresh>=80?'green':'yellow'},
    {label:'Scan Time', value: data.org.scanDuration, sub: data.org.regions.length+' regions scanned'},
  ]);

  const countEl = document.getElementById('demo-control-count');
  if (countEl) countEl.textContent = data.controls.length + ' controls assessed';

  renderControls('demo-controls', data.controls);
  renderEvidence('demo-findings', data.evidence);
});
</script>
</body>
</html>`;
}
