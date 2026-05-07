const fs = require('fs');

const rawHtml = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta name="theme-color" content="#1a6b4a">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="FarmaAvisa">
<title>FarmaAvisa — Farmacia de María</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
:root{
  --v:#1a6b4a;--vc:#2d9166;--vp:#e8f5ee;--vm:#c2e8d3;
  --ac:#f0a500;--fondo:#f7faf8;--blanco:#fff;
  --gris:#6b7a72;--gc:#edf1ef;--texto:#1c2b22;
  --danger:#d93025;--info:#1a6b9a;--purple:#7c3aed;
  --wa:#25d366;--wa-dark:#128c7e;
  --sh:0 2px 12px rgba(26,107,74,.10);--shl:0 6px 32px rgba(26,107,74,.14);
  --r:14px;--rs:8px;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans',sans-serif;background:var(--fondo);color:var(--texto);min-height:100vh}

/* ── LOGIN ── */
.lbg{position:fixed;inset:0;background:linear-gradient(160deg,var(--v) 0%,#0d3d28 100%);display:flex;align-items:center;justify-content:center;z-index:999;padding:1rem}
.lbox{background:var(--blanco);border-radius:22px;padding:2.2rem 2rem;width:100%;max-width:380px;box-shadow:0 24px 64px rgba(0,0,0,.35);text-align:center}
.l-logo-img{width:80px;height:80px;object-fit:contain;border-radius:12px;margin:0 auto 12px;display:block}
.l-logo-ph{width:80px;height:80px;border-radius:12px;background:var(--v);display:flex;align-items:center;justify-content:center;font-size:2.2rem;margin:0 auto 12px}
.l-title{font-family:'DM Serif Display',serif;font-size:1.8rem;color:var(--v);line-height:1}
.l-title span{color:var(--vc)}
.l-sub{font-size:.72rem;color:var(--gris);text-transform:uppercase;letter-spacing:.1em;margin-bottom:1.8rem}
.lf{text-align:left;margin-bottom:.9rem}
.lf label{display:block;font-size:.73rem;font-weight:600;color:var(--gris);text-transform:uppercase;letter-spacing:.04em;margin-bottom:.35rem}
.lf input{width:100%;padding:.7rem 1rem;border:1.5px solid var(--gc);border-radius:var(--rs);font-family:'DM Sans',sans-serif;font-size:.9rem;outline:none;transition:border .15s}
.lf input:focus{border-color:var(--vc)}
.l-err{color:var(--danger);font-size:.78rem;margin:.4rem 0;min-height:18px;text-align:left}
.l-btn{width:100%;padding:.82rem;background:var(--v);color:#fff;border:none;border-radius:var(--rs);font-family:'DM Sans',sans-serif;font-size:.95rem;font-weight:600;cursor:pointer;transition:background .15s;margin-top:.3rem}
.l-btn:hover{background:var(--vc)}
.l-link{font-size:.8rem;color:var(--gris);margin-top:.9rem;cursor:pointer}
.l-link a{color:var(--vc);font-weight:600;text-decoration:none}
.l-link a:hover{text-decoration:underline}

/* ── SIDEBAR ── */
#SB{position:fixed;top:0;left:0;width:230px;height:100vh;background:var(--v);display:flex;flex-direction:column;z-index:100;box-shadow:4px 0 24px rgba(0,0,0,.12)}
.sl{padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.12)}
.sl-top{display:flex;align-items:center;gap:10px}
.sl-ic{width:38px;height:38px;border-radius:8px;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0;overflow:hidden}
.sl-tx h1{font-family:'DM Serif Display',serif;font-size:1.15rem;color:#fff;line-height:1.1}
.sl-tx h1 span{color:#a8f0ce}
.sl-tx p{font-size:.62rem;color:rgba(255,255,255,.5);letter-spacing:.08em;text-transform:uppercase}
.snav{flex:1;padding:8px 0;overflow-y:auto}
.ni{position:relative;display:flex;align-items:center;gap:10px;padding:10px 18px;color:rgba(255,255,255,.78);font-size:.86rem;font-weight:500;cursor:pointer;transition:background .15s;border-left:3px solid transparent}
.ni:hover{background:rgba(255,255,255,.09);color:#fff}
.ni.act{background:rgba(255,255,255,.15);color:#fff;border-left-color:var(--ac)}
.ni-ic{width:19px;text-align:center;font-size:1rem}
.ni-badge{position:absolute;right:14px;top:50%;transform:translateY(-50%);background:var(--danger);color:#fff;font-size:.6rem;font-weight:700;min-width:18px;height:18px;border-radius:9px;display:flex;align-items:center;justify-content:center;padding:0 4px}
.sfooter{padding:10px 18px;border-top:1px solid rgba(255,255,255,.12)}
.urow{display:flex;align-items:center;gap:8px;padding:4px 0}
.uav{width:30px;height:30px;border-radius:50%;background:var(--ac);display:flex;align-items:center;justify-content:center;font-size:.76rem;font-weight:700;color:#fff}
.uname{color:#fff;font-weight:600;font-size:.8rem}
.urole{color:rgba(255,255,255,.5);font-size:.69rem}

/* ── MAIN ── */
#main{margin-left:230px;min-height:100vh;display:flex;flex-direction:column}
.topbar{background:var(--blanco);border-bottom:1px solid var(--gc);padding:11px 24px;display:flex;align-items:center;gap:12px;position:sticky;top:0;z-index:50;box-shadow:0 1px 6px rgba(0,0,0,.05)}
.topbar h2{font-family:'DM Serif Display',serif;font-size:1.18rem;color:var(--v)}
.topbar-r{margin-left:auto;display:flex;gap:9px;align-items:center}
.sbox{display:flex;align-items:center;gap:7px;background:var(--gc);border-radius:30px;padding:6px 14px}
.sbox input{border:none;background:transparent;outline:none;font-size:.86rem;font-family:'DM Sans',sans-serif;width:180px}
.content{padding:20px 24px;flex:1}

/* ── BOTONES ── */
.btn{display:inline-flex;align-items:center;gap:6px;padding:7px 15px;border-radius:30px;font-family:'DM Sans',sans-serif;font-size:.82rem;font-weight:600;border:none;cursor:pointer;transition:all .15s}
.btn-primary{background:var(--v);color:#fff}.btn-primary:hover{background:var(--vc)}
.btn-danger{background:var(--danger);color:#fff}
.btn-outline{background:transparent;border:2px solid var(--v);color:var(--v)}.btn-outline:hover{background:var(--vp)}
.btn-ghost{background:var(--gc);color:var(--gris)}.btn-ghost:hover{background:#dde3df}
.btn-info{background:var(--info);color:#fff}
.btn-purple{background:var(--purple);color:#fff}
.btn-wa{background:var(--wa);color:#fff;font-weight:700}.btn-wa:hover{background:var(--wa-dark)}
.btn-warn{background:var(--ac);color:#fff}
.btn-sm{padding:4px 11px;font-size:.75rem}

/* ── CARDS ── */
.card{background:var(--blanco);border-radius:var(--r);box-shadow:var(--sh);overflow:hidden;margin-bottom:14px}
.card-hd{padding:12px 18px;border-bottom:1px solid var(--gc);display:flex;align-items:center;gap:9px}
.card-hd h3{font-size:.97rem;font-weight:600;font-family:'DM Serif Display',serif;flex:1}
.card-bd{padding:16px 18px}

/* ── PACIENTES ── */
.pgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}
.pc{background:var(--blanco);border-radius:var(--r);box-shadow:var(--sh);padding:14px 16px;cursor:pointer;transition:all .15s;border:2px solid transparent}
.pc:hover{border-color:var(--vm);box-shadow:var(--shl);transform:translateY(-2px)}
.pc-top{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.pav{width:39px;height:39px;border-radius:50%;background:linear-gradient(135deg,var(--v),var(--vc));display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:.93rem;flex-shrink:0}
.pname{font-weight:600;font-size:.9rem;line-height:1.3}.pdni{font-size:.74rem;color:var(--gris)}
.prow{font-size:.77rem;color:var(--gris);margin-bottom:2px}
.pbadges{display:flex;gap:4px;margin-top:7px;flex-wrap:wrap}
.mb{font-size:.64rem;font-weight:600;padding:2px 7px;border-radius:20px;border:1px solid}
.mb-c{color:var(--v);border-color:var(--v);background:var(--vp)}
.mb-s{color:var(--info);border-color:var(--info);background:#e8f3fa}
.mb-ok{color:#059669;border-color:#059669;background:#d1fae5}
.pc-ac{display:flex;gap:5px;margin-top:8px;border-top:1px solid var(--gc);padding-top:7px}

/* ── FICHA ── */
.pdhdr{background:var(--blanco);border-radius:var(--r);box-shadow:var(--sh);padding:17px 21px;margin-bottom:13px;display:flex;gap:15px;align-items:flex-start}
.pdav{width:58px;height:58px;border-radius:50%;background:linear-gradient(135deg,var(--v),var(--ac));display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.25rem;font-weight:700;flex-shrink:0}
.pdi h2{font-family:'DM Serif Display',serif;font-size:1.3rem}
.dfields{display:grid;grid-template-columns:repeat(3,1fr);gap:4px 12px;margin-top:7px}
.df{font-size:.79rem}.df label{color:var(--gris);font-size:.7rem;text-transform:uppercase;letter-spacing:.05em;display:block}.df span{font-weight:500}.df.full{grid-column:1/-1}
.mtabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px}
.mtab{display:flex;align-items:center;gap:5px;padding:7px 14px;border-radius:30px;font-size:.81rem;font-weight:600;border:2px solid var(--gc);background:var(--blanco);color:var(--gris);cursor:pointer;transition:all .15s}
.mtab:hover{border-color:var(--v);color:var(--v)}.mtab.active{background:var(--v);border-color:var(--v);color:#fff}

/* ── TABLAS ── */
.tbl{width:100%;border-collapse:collapse;font-size:.82rem}
.tbl th{text-align:left;font-size:.69rem;text-transform:uppercase;letter-spacing:.05em;color:var(--gris);padding:6px 9px;background:var(--gc);font-weight:600}
.tbl td{padding:8px 9px;border-bottom:1px solid var(--gc);vertical-align:middle}
.tbl tr:hover td{background:var(--vp)}
.sp{font-size:.69rem;font-weight:700;padding:2px 8px;border-radius:20px;display:inline-block}
.sp-ok{background:#d4f5e2;color:#1a6b4a}.sp-w{background:#fef4d8;color:#b07800}.sp-d{background:#fde8e6;color:var(--danger)}
.mr{display:grid;gap:7px;align-items:center;padding:7px 9px;border-bottom:1px solid var(--gc);font-size:.8rem}
.mr.bp{grid-template-columns:98px 56px 56px 64px 86px 1fr auto auto}
.mr.gl{grid-template-columns:98px 76px 94px 76px 1fr auto}
.mr-hd{font-size:.69rem;color:var(--gris);text-transform:uppercase;font-weight:600;background:var(--gc);border-radius:6px 6px 0 0}
.vc-card{background:var(--gc);border-radius:var(--rs);padding:10px 13px;margin-bottom:7px;display:flex;gap:12px;align-items:center}

/* ── MODAL ── */
.mbg{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:200;display:flex;align-items:center;justify-content:center;padding:18px}
.modal{background:var(--blanco);border-radius:var(--r);box-shadow:var(--shl);width:100%;max-width:620px;max-height:90vh;overflow-y:auto;animation:mi .2s ease}
@keyframes mi{from{opacity:0;transform:scale(.96) translateY(8px)}to{opacity:1;transform:none}}
.mhd{padding:14px 20px;border-bottom:1px solid var(--gc);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:var(--blanco);z-index:1}
.mhd h3{font-family:'DM Serif Display',serif;font-size:1.06rem}
.mcl{background:none;border:none;font-size:1.2rem;cursor:pointer;color:var(--gris);padding:3px 7px;border-radius:5px}.mcl:hover{background:var(--gc)}
.mbd{padding:18px 20px}.mft{padding:10px 20px;border-top:1px solid var(--gc);display:flex;gap:9px;justify-content:flex-end;flex-wrap:wrap}
.fg{display:grid;grid-template-columns:repeat(2,1fr);gap:11px}.fg.c1{grid-template-columns:1fr}.fg.c3{grid-template-columns:repeat(3,1fr)}
.fp{display:flex;flex-direction:column;gap:4px}.fp.full{grid-column:1/-1}
.fp label{font-size:.75rem;font-weight:600;color:var(--gris);text-transform:uppercase;letter-spacing:.04em}
.fp input,.fp select,.fp textarea{padding:7px 10px;border:1.5px solid var(--gc);border-radius:var(--rs);font-family:'DM Sans',sans-serif;font-size:.85rem;outline:none;transition:border .15s;background:var(--blanco)}
.fp input:focus,.fp select:focus,.fp textarea:focus{border-color:var(--vc)}
.fp textarea{resize:vertical;min-height:60px}

/* ── MISC ── */
.tip{background:var(--vp);border-radius:7px;padding:7px 11px;font-size:.79rem;margin-top:8px;line-height:1.5}
.empty{text-align:center;padding:28px 16px;color:var(--gris)}.empty .ei{font-size:2rem;display:block;margin-bottom:7px}
.oe{background:var(--blanco);border:1.5px solid var(--gc);border-radius:var(--rs);padding:12px 15px;margin-bottom:9px}
.oeh{display:flex;align-items:center;gap:9px;margin-bottom:6px;flex-wrap:wrap}
.ot{font-size:.72rem;font-weight:700;padding:2px 9px;border-radius:20px}
.ot-r{background:#fde8e6;color:var(--danger)}.ot-o{background:var(--vp);color:var(--v)}.ot-m{background:#e8f3fa;color:var(--info)}.ot-x{background:var(--gc);color:var(--gris)}
.otx{font-size:.84rem;line-height:1.5}
.stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px}
.stat-c{background:var(--blanco);border-radius:var(--r);padding:15px 17px;box-shadow:var(--sh);border-left:4px solid transparent;display:flex;align-items:center;gap:11px}
.stat-c.ok{border-color:var(--v)}.stat-c.wn{border-color:var(--ac)}.stat-c.pu{border-color:var(--purple)}.stat-c.wa{border-color:var(--wa)}
.snum{font-size:1.6rem;font-weight:700;font-family:'DM Serif Display',serif}.slabel{font-size:.74rem;color:var(--gris)}
.role-badge{font-size:.65rem;font-weight:700;padding:2px 8px;border-radius:20px;display:inline-block}
.rb-owner{background:#fef3c7;color:#b45309}.rb-staff{background:#e8f3fa;color:#1a6b9a}

/* ── NOTIF PANEL ── */
.nsec{background:var(--blanco);border-radius:var(--r);box-shadow:var(--sh);margin-bottom:10px;overflow:hidden}
.nsec-hd{display:flex;align-items:center;gap:10px;padding:13px 18px;cursor:pointer;user-select:none;transition:background .15s}
.nsec-hd:hover{background:var(--vp)}
.nsec-title{flex:1;font-family:'DM Serif Display',serif;font-size:1rem;font-weight:600}
.nsec-count{font-size:.72rem;font-weight:700;padding:3px 10px;border-radius:20px}
.nsec-pend .nsec-count{background:#fef4d8;color:#b07800}
.nsec-lista .nsec-count{background:#d1fae5;color:#059669}
.nsec-hist .nsec-count{background:var(--gc);color:var(--gris)}
.nsec-arrow{font-size:.8rem;color:var(--gris);transition:transform .25s}
.nsec-arrow.open{transform:rotate(180deg)}
.nsec-body{display:none;border-top:1px solid var(--gc)}
.nsec-body.open{display:block}
.nsec-search{display:flex;align-items:center;gap:8px;background:var(--gc);border-radius:30px;padding:6px 14px;margin:12px 18px 8px}
.nsec-search input{border:none;background:transparent;outline:none;font-size:.84rem;font-family:'DM Sans',sans-serif;width:100%}
.nsec-list{padding:0 18px 14px}
.nc{background:var(--fondo);border-radius:var(--rs);padding:11px 14px;margin-bottom:7px;display:flex;align-items:flex-start;gap:10px;border-left:3px solid transparent}
.nc.pendiente{border-left-color:var(--ac)}
.nc.lista{border-left-color:var(--wa);background:#f0fff6}
.nc.historial{border-left-color:var(--gc);opacity:.75}
.nc-ic{font-size:1.3rem;flex-shrink:0;margin-top:1px}
.nc-body{flex:1;min-width:0}
.nc-paciente{font-weight:700;font-size:.85rem;color:var(--v);margin-bottom:2px}
.nc-msg{font-size:.82rem;line-height:1.4;margin-bottom:4px}
.nc-meta{font-size:.73rem;color:var(--gris);display:flex;gap:8px;flex-wrap:wrap}
.nc-actions{display:flex;gap:5px;flex-wrap:wrap;margin-top:7px}
.canal-opt{flex:1;display:flex;align-items:center;gap:8px;padding:10px 14px;border:2px solid var(--gc);border-radius:10px;cursor:pointer;background:#fff;transition:all .15s}
.canal-opt.sel-push{border-color:var(--v);background:var(--vp)}
.canal-opt.sel-wa{border-color:var(--wa);background:#e9fbe9}

/* ── CONFIRM MODAL ── */
.confirm-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:300;display:flex;align-items:center;justify-content:center;padding:1rem}
.confirm-box{background:#fff;border-radius:16px;padding:2rem 1.8rem;max-width:340px;width:100%;box-shadow:0 16px 48px rgba(0,0,0,.3);text-align:center}
.confirm-box h3{font-family:'DM Serif Display',serif;color:var(--danger);margin-bottom:.5rem;font-size:1.1rem}
.confirm-box p{font-size:.85rem;color:var(--gris);margin-bottom:1.2rem;line-height:1.5}
.confirm-box .fp{text-align:left;margin-bottom:.8rem}
.confirm-err{color:var(--danger);font-size:.78rem;margin-bottom:.5rem;min-height:16px}

/* ── RESPONSIVE MÓVIL ── */
.hamburger{display:none;background:none;border:none;cursor:pointer;padding:6px;color:var(--v);font-size:1.5rem;line-height:1;flex-shrink:0}
.sb-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:99}
.sb-overlay.open{display:block}
@media(max-width:700px){
  .hamburger{display:flex;align-items:center;justify-content:center}
  #SB{transform:translateX(-100%);transition:transform .28s ease;z-index:150;width:240px}
  #SB.open{transform:translateX(0)}
  #main{margin-left:0!important}
  .topbar{padding:10px 14px;gap:8px}
  .topbar h2{font-size:1rem}
  .sbox input{width:110px}
  .content{padding:14px 12px 80px}
  .pgrid{grid-template-columns:1fr}
  .stats-grid{grid-template-columns:1fr;gap:8px}
  .dfields{grid-template-columns:repeat(2,1fr)}
  .fg{grid-template-columns:1fr!important}
  .fg.c3{grid-template-columns:1fr!important}
  .mr.bp{grid-template-columns:80px 46px 46px 46px 70px 1fr auto auto;font-size:.74rem}
  .mr.gl{grid-template-columns:80px 60px 80px 60px 1fr auto;font-size:.74rem}
  .mbg{padding:0;align-items:flex-end}
  .modal{border-radius:20px 20px 0 0;max-height:92vh;max-width:100%}
  .mtabs{flex-wrap:nowrap;overflow-x:auto;padding-bottom:4px;-webkit-overflow-scrolling:touch;gap:5px}
  .mtab{white-space:nowrap;font-size:.75rem;padding:6px 11px}
  #mobile-nav{display:flex;position:fixed;bottom:0;left:0;right:0;z-index:80;background:var(--blanco);border-top:1px solid var(--gc);box-shadow:0 -4px 16px rgba(0,0,0,.08);padding:6px 0 env(safe-area-inset-bottom)}
  .mn-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 4px;cursor:pointer;border:none;background:none;color:var(--gris);font-size:.6rem;font-weight:500;font-family:'DM Sans',sans-serif;transition:color .15s;position:relative}
  .mn-item .mn-ic{font-size:1.25rem;line-height:1}
  .mn-item.act{color:var(--v)}
  .mn-badge{position:absolute;top:2px;right:20%;background:var(--danger);color:#fff;font-size:.55rem;font-weight:700;min-width:15px;height:15px;border-radius:8px;display:flex;align-items:center;justify-content:center;padding:0 3px}
  .lbox{padding:1.6rem 1.4rem}
}
@media(min-width:701px){#mobile-nav{display:none!important}.hamburger{display:none!important}}
@media print{#SB,.topbar,.mtabs,.no-print,.btn,button{display:none!important}#main{margin-left:0}.content{padding:0}body{background:#fff}}
#toast-msg{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(10px);background:var(--texto);color:#fff;border-radius:20px;padding:.6rem 1.2rem;font-size:.84rem;z-index:9999;opacity:0;transition:all .3s;pointer-events:none;white-space:nowrap}
#toast-msg.show{opacity:1;transform:translateX(-50%) translateY(0)}
.logo-preview-img{width:80px;height:80px;border-radius:10px;object-fit:contain;border:2px solid var(--gc)}
</style>
</head>
<body>

<!-- LOGIN -->
<div id="LS">
  <div class="lbg">
    <div class="lbox">
      <div id="l-logo-wrap"><div class="l-logo-ph">💊</div></div>
      <div class="l-title">Farma<span>Avisa</span></div>
      <div class="l-sub">Farmacia de María</div>
      <div id="lf-main">
        <div class="lf"><label>Email</label><input id="lu" type="email" placeholder="usuario@mail.com" autocomplete="username"/></div>
        <div class="lf"><label>Contraseña</label><input id="lp" type="password" placeholder="••••••••" autocomplete="current-password"/></div>
        <div class="l-err" id="l-err"></div>
        <button class="l-btn" onclick="doLogin()">Entrar →</button>
        <div class="l-link" onclick="showRecovery()">¿Olvidaste tu contraseña?</div>
      </div>
      <div id="lf-recovery" style="display:none">
        <div style="font-size:.85rem;color:var(--gris);margin-bottom:1rem;line-height:1.5;">Respondé la pregunta secreta del dueño para recuperar el acceso.</div>
        <div class="lf"><label>Pregunta secreta</label><input id="rec-q" readonly style="background:var(--gc);color:var(--gris)"/></div>
        <div class="lf"><label>Tu respuesta</label><input id="rec-a" type="text" placeholder="Escribí tu respuesta"/></div>
        <div class="l-err" id="rec-err"></div>
        <button class="l-btn" onclick="doRecovery()">Verificar →</button>
        <div class="l-link" onclick="showLogin()">← Volver al login</div>
      </div>
      <div id="lf-newpass" style="display:none">
        <div style="font-size:.85rem;color:var(--v);font-weight:600;margin-bottom:1rem;">✅ Identidad verificada. Creá tu nueva contraseña.</div>
        <div class="lf"><label>Nueva Contraseña</label><input id="np-pass" type="password" placeholder="Mínimo 6 caracteres"/></div>
        <div class="lf"><label>Repetir Contraseña</label><input id="np-pass2" type="password" placeholder="Igual que arriba"/></div>
        <div class="l-err" id="np-err"></div>
        <button class="l-btn" onclick="doNewPass()">Guardar nueva contraseña →</button>
      </div>
    </div>
  </div>
</div>

<!-- APP -->
<div id="APP" style="display:none">
  <div class="sb-overlay" id="sb-overlay" onclick="closeSB()"></div>
  <div id="SB">
    <div class="sl">
      <div class="sl-top">
        <div class="sl-ic" id="sl-ic">💊</div>
        <div class="sl-tx"><h1>Farma<span>Avisa</span></h1><p>Farmacia de María</p></div>
      </div>
    </div>
    <nav class="snav">
      <div class="ni act" id="N-pacientes" onclick="SP('pacientes')"><span class="ni-ic">👥</span> Pacientes</div>
      <div class="ni" id="N-nuevo" onclick="SP('nuevo')"><span class="ni-ic">➕</span> Nuevo Paciente</div>
      <div class="ni" id="N-notifpanel" onclick="SP('notifpanel')"><span class="ni-ic">🔔</span> Notificaciones<span class="ni-badge" id="notif-badge" style="display:none">0</span></div>
      <div class="ni" id="N-usuarios" onclick="SP('usuarios')"><span class="ni-ic">👤</span> Usuarios</div>
      <div class="ni" id="N-config" onclick="SP('config')"><span class="ni-ic">⚙️</span> Configuración</div>
    </nav>
    <div class="sfooter">
      <div class="urow">
        <div class="uav" id="UAV">D</div>
        <div><div class="uname" id="UNAME">—</div><div class="urole" id="UROLE">—</div></div>
      </div>
      <button class="btn btn-ghost btn-sm" style="margin-top:8px;width:100%;justify-content:center" onclick="doLogout()">🚪 Cerrar sesión</button>
    </div>
  </div>
  <div id="main">
    <div class="topbar">
      <button class="hamburger" onclick="toggleSB()">☰</button>
      <h2 id="TT">Pacientes</h2>
      <div class="topbar-r">
        <div class="sbox" id="GS-wrap"><span>🔍</span><input type="text" id="GS" placeholder="Buscar…" oninput="filterP()"/></div>
      </div>
    </div>
    <div class="content" id="CA"></div>
  </div>
</div>

<nav id="mobile-nav" style="display:none">
  <button class="mn-item act" id="MN-pacientes" onclick="SP('pacientes');closeSB()"><span class="mn-ic">👥</span><span>Pacientes</span></button>
  <button class="mn-item" id="MN-nuevo" onclick="SP('nuevo');closeSB()"><span class="mn-ic">➕</span><span>Nuevo</span></button>
  <button class="mn-item" id="MN-notifpanel" onclick="SP('notifpanel');closeSB()" style="position:relative"><span class="mn-ic">🔔</span><span>Notif.</span><span class="mn-badge" id="mn-badge" style="display:none">0</span></button>
  <button class="mn-item" id="MN-config" onclick="SP('config');closeSB()"><span class="mn-ic">⚙️</span><span>Config.</span></button>
  <button class="mn-item" onclick="toggleSB()"><span class="mn-ic">☰</span><span>Más</span></button>
</nav>

<div id="toast-msg"></div>

<script src="/legacy_app.js"></script>
</body>
</html>`;

fs.writeFileSync('index.html', rawHtml);
console.log('index.html correctly rewritten with ALL elements.');
