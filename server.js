// server.js — FarmaAvisa con notificaciones push reales
const express  = require('express');
const path     = require('path');
const fs       = require('fs');
const webpush  = require('web-push');
const cron     = require('node-cron');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ── VAPID ─────────────────────────────────────────────────────
var VAPID_PUBLIC  = process.env.VAPID_PUBLIC;
var VAPID_PRIVATE = process.env.VAPID_PRIVATE;

if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
  var keys = webpush.generateVAPIDKeys();
  VAPID_PUBLIC  = keys.publicKey;
  VAPID_PRIVATE = keys.privateKey;
  console.log('\n⚠️  VAPID KEYS — Agregá estas variables en Railway → Variables:');
  console.log('VAPID_PUBLIC=' + VAPID_PUBLIC);
  console.log('VAPID_PRIVATE=' + VAPID_PRIVATE + '\n');
}

webpush.setVapidDetails(
  'mailto:' + (process.env.CONTACT_EMAIL || 'admin@farmaciademia.com'),
  VAPID_PUBLIC,
  VAPID_PRIVATE
);

// ── ALMACENAMIENTO DE SUSCRIPCIONES (archivo JSON) ────────────
var SUBS_FILE = path.join(__dirname, 'subscriptions.json');
var NOTIFS_FILE = path.join(__dirname, 'scheduled_notifs.json');

function loadSubs() {
  try { return JSON.parse(fs.readFileSync(SUBS_FILE, 'utf8')); } catch(e) { return {}; }
}
function saveSubs(subs) {
  fs.writeFileSync(SUBS_FILE, JSON.stringify(subs, null, 2));
}
function loadScheduled() {
  try { return JSON.parse(fs.readFileSync(NOTIFS_FILE, 'utf8')); } catch(e) { return []; }
}
function saveScheduled(ns) {
  fs.writeFileSync(NOTIFS_FILE, JSON.stringify(ns, null, 2));
}

// ── RUTAS API ──────────────────────────────────────────────────

// Obtener VAPID public key
app.get('/api/vapid-key', function(req, res) {
  res.json({ publicKey: VAPID_PUBLIC });
});

// Suscribir un paciente a notificaciones push
app.post('/api/subscribe', function(req, res) {
  var patientId    = req.body.patientId;
  var patientName  = req.body.patientName;
  var subscription = req.body.subscription;
  if (!patientId || !subscription) return res.status(400).json({ error: 'Faltan datos' });
  var subs = loadSubs();
  subs[patientId] = { name: patientName, subscription: subscription, updatedAt: new Date().toISOString() };
  saveSubs(subs);
  res.json({ ok: true });
});

// Desuscribir
app.delete('/api/subscribe/:patientId', function(req, res) {
  var subs = loadSubs();
  delete subs[req.params.patientId];
  saveSubs(subs);
  res.json({ ok: true });
});

// Guardar notificación programada desde el frontend
app.post('/api/schedule', function(req, res) {
  var ns = loadScheduled();
  var n  = req.body;
  if (!n.patientId || !n.fecha || !n.hora || !n.mensaje) return res.status(400).json({ error: 'Faltan datos' });
  // Evitar duplicados por id
  ns = ns.filter(function(x) { return x.id !== n.id; });
  ns.push(n);
  saveScheduled(ns);
  res.json({ ok: true });
});

// Eliminar notificación programada
app.delete('/api/schedule/:id', function(req, res) {
  var ns = loadScheduled().filter(function(x) { return String(x.id) !== String(req.params.id); });
  saveScheduled(ns);
  res.json({ ok: true });
});

// Notificación de prueba
app.post('/api/test/:patientId', function(req, res) {
  var subs = loadSubs();
  var entry = subs[req.params.patientId];
  if (!entry) return res.status(404).json({ error: 'Paciente sin suscripción' });
  sendPush(entry.subscription, {
    title: '💊 Farmacia de María te avisa',
    body: 'Hola ' + entry.name + ', esta es una notificación de prueba. ¡Todo funciona!',
    tag: 'farmaavisa-test'
  }).then(function() { res.json({ ok: true }); })
    .catch(function(e) { res.status(500).json({ error: e.message }); });
});

// Verificar si un paciente está suscripto
app.get('/api/subscribed/:patientId', function(req, res) {
  var subs = loadSubs();
  res.json({ subscribed: !!subs[req.params.patientId] });
});

// ── ENVÍO DE PUSH ──────────────────────────────────────────────
function sendPush(subscription, payload) {
  return webpush.sendNotification(subscription, JSON.stringify(payload))
    .catch(function(err) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        // Suscripción expirada — limpiar
        var subs = loadSubs();
        Object.keys(subs).forEach(function(id) {
          if (JSON.stringify(subs[id].subscription) === JSON.stringify(subscription)) {
            delete subs[id];
          }
        });
        saveSubs(subs);
      }
      throw err;
    });
}

// ── CRON: cada minuto verifica y envía notificaciones ─────────
cron.schedule('* * * * *', function() {
  var now    = new Date();
  var fecha  = now.toISOString().split('T')[0];
  var hh     = String(now.getHours()).padStart(2, '0');
  var mm     = String(now.getMinutes()).padStart(2, '0');
  var hora   = hh + ':' + mm;
  var subs   = loadSubs();
  var ns     = loadScheduled();
  var changed = false;

  // Agrupar notificaciones del mismo paciente y hora
  var grupos = {};
  ns.forEach(function(n) {
    if (n.enviada) return;
    if (n.fecha !== fecha) return;
    var nHora = (n.hora || '').slice(0, 5);
    if (nHora !== hora) return;
    var sub = subs[String(n.patientId)];
    if (!sub) return;
    var key = n.patientId + '_' + hora;
    if (!grupos[key]) grupos[key] = { patientId: n.patientId, name: sub.name, subscription: sub.subscription, mensajes: [], ids: [] };
    grupos[key].mensajes.push(n.mensaje);
    grupos[key].ids.push(n.id);
  });

  Object.values(grupos).forEach(function(g) {
    var body;
    if (g.mensajes.length === 1) {
      body = 'Hola ' + g.name + ', ' + g.mensajes[0];
    } else {
      body = 'Hola ' + g.name + ':\n' + g.mensajes.map(function(m, i) { return (i+1) + '. ' + m; }).join('\n');
    }
    sendPush(g.subscription, {
      title: '💊 Farmacia de María te avisa',
      body: body,
      tag: 'farmaavisa-' + g.patientId + '-' + hora,
      renotify: true
    }).then(function() {
      console.log('[PUSH OK]', g.name, '→', g.mensajes.join(' | '));
      // Marcar como enviadas
      ns.forEach(function(n) { if (g.ids.indexOf(n.id) >= 0) { n.enviada = true; n.enviadoEn = new Date().toISOString(); } });
      changed = true;
    }).catch(function(e) {
      console.error('[PUSH ERR]', g.name, e.statusCode || e.message);
    });
  });

  if (changed) saveScheduled(ns);
});

// ── INICIO ────────────────────────────────────────────────────
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, function() {
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║   FarmaAvisa — Farmacia de María     ║');
  console.log('║   Puerto: ' + PORT + '                         ║');
  console.log('╚══════════════════════════════════════╝\n');
});
