import express from "express";
import { createServer as createViteServer } from "vite";
import webpush from "web-push";
import path from "path";
import cors from "cors";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json());

  const dataDir = process.env.RAILWAY_VOLUME_MOUNT_PATH || process.cwd();
  const vapidKeysFile = path.join(dataDir, "vapid_keys.json");
  const subscriptionsFile = path.join(dataDir, "subscriptions.json");
  const dbFile = path.join(dataDir, "db.json");
  const notifsFile = path.join(dataDir, "notifs.json");

  // === WEB PUSH SETUP ===
  let vapidKeys: any = null;
  if (fs.existsSync(vapidKeysFile)) {
    try { vapidKeys = JSON.parse(fs.readFileSync(vapidKeysFile, "utf-8")); } catch(e) {}
  }
  
  if (!vapidKeys || !vapidKeys.publicKey) {
    console.log("Generando nuevas VAPID keys para seguridad...");
    vapidKeys = webpush.generateVAPIDKeys();
    fs.writeFileSync(vapidKeysFile, JSON.stringify(vapidKeys, null, 2));
  }

  webpush.setVapidDetails(
    "mailto:mitratamientofdm@gmail.com",
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );

  let subscriptions: Record<string, any> = {};
  if (fs.existsSync(subscriptionsFile)) {
    try { subscriptions = JSON.parse(fs.readFileSync(subscriptionsFile, "utf-8")); } catch (e) { }
  }
  const saveSubscriptions = () => { fs.writeFileSync(subscriptionsFile, JSON.stringify(subscriptions, null, 2)); };

  // === API ROUTES ===
  
  app.get("/api/db", (req, res) => {
    if (fs.existsSync(dbFile)) {
      res.sendFile(dbFile);
    } else {
      res.status(404).json({error: "No DB"});
    }
  });

  app.post("/api/db", async (req, res) => {
    fs.writeFileSync(dbFile, JSON.stringify(req.body, null, 2));

    const webhookUrl = req.body.webhookUrl;
    if (webhookUrl && webhookUrl.startsWith("http")) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(req.body),
        });
      } catch (e) {
        console.error("Error triggering auto-backup webhook", e);
      }
    }

    res.json({success: true});
  });

  app.get("/api/notifs", (req, res) => {
    if (fs.existsSync(notifsFile)) {
      res.sendFile(notifsFile);
    } else {
      res.status(404).json({error: "No Notifs"});
    }
  });

  app.post("/api/notifs", (req, res) => {
    fs.writeFileSync(notifsFile, JSON.stringify(req.body, null, 2));
    res.json({success: true});
  });
  
  // 1. Get Public Key for the Frontend
  app.get("/api/vapid-key", (req, res) => {
    res.json({ publicKey: vapidKeys.publicKey });
  });

  // 2. Patient Subscribe to Push (called by the user's phone)
  app.post("/api/subscribe", (req, res) => {
    const { patientId, subscription } = req.body;
    subscriptions[patientId] = subscription;
    saveSubscriptions();
    console.log(`[Push] Nuevo paciente suscrito: PID ${patientId}`);
    res.status(201).json({ success: true });
  });

  // 3. Admin Send Push (mock example for testing)
  app.post("/api/send-push", async (req, res) => {
    const { patientId, payload } = req.body;
    const sub = subscriptions[patientId];
    if (sub) {
      try {
        await webpush.sendNotification(sub, JSON.stringify(payload));
        res.json({ success: true, message: "Push enviado!" });
      } catch (err: any) {
        console.error("Error al enviar push", err);
        res.status(500).json({ error: err.message });
      }
    } else {
      res.status(404).json({ error: "El paciente aún no se vinculó en su celular." });
    }
  });

  // === VITE MIDDLEWARE ===
  if (process.env.NODE_ENV !== "production") {
    console.log("Iniciando Vite en modo desarrollo...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Iniciando en modo Producción...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0" as any, () => {
    console.log(`Servidor seguro Express + Vite corriendo en http://localhost:${PORT}`);
    console.log(`Listos para producción en Railway!`);
  });
}

startServer().catch((e) => {
  console.error("Error iniciando servidor:", e);
});
