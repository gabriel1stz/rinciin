import http from "http";
import { requestPairingCode } from "./lib/baileys.js";

let botSocket = null;
let latestQr = null;
let connectionState = "connecting";

export function setBotSocket(sock) {
  botSocket = sock;
}

export function setLatestQr(qr) {
  latestQr = qr;
}

export function setConnectionState(state) {
  connectionState = state;
}

export function startInternalServer(port = 3001) {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

    // Enable CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      return res.end();
    }

    // ==========================================
    // 1. GET / or /qr -> Web QR Code Scanner Page (Jernih & Mudah di-scan)
    // ==========================================
    if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/qr")) {
      const isConnected = connectionState === "open";
      const qrImageUrl = latestQr
        ? `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=15&data=${encodeURIComponent(latestQr)}`
        : null;

      const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hubungkan WhatsApp Bot - Rinci.in</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    body { background: #0b0f19; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
    .card { background: #131b2e; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 24px; padding: 32px 24px; max-width: 440px; width: 100%; text-align: center; box-shadow: 0 25px 60px -15px rgba(0,0,0,0.5); }
    h1 { font-size: 20px; margin-bottom: 8px; color: #10b981; }
    p { font-size: 13px; color: #94a3b8; line-height: 1.5; margin-bottom: 24px; }
    .qr-box { background: #ffffff; padding: 16px; border-radius: 16px; display: inline-block; box-shadow: 0 10px 25px rgba(0,0,0,0.3); margin-bottom: 20px; }
    .qr-img { width: 260px; height: 260px; display: block; border-radius: 8px; }
    .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-bottom: 18px; }
    .connected { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); }
    .waiting { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); }
    .steps { text-align: left; background: #0f172a; padding: 16px; border-radius: 12px; border: 1px solid #1e293b; font-size: 12px; color: #cbd5e1; margin-top: 16px; }
    .steps ol { padding-left: 18px; }
    .steps li { margin-bottom: 6px; }
    .btn-refresh { background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 12px; font-weight: 600; font-size: 13px; cursor: pointer; margin-top: 14px; transition: 0.2s; }
    .btn-refresh:hover { background: #059669; }
  </style>
  <script>
    setTimeout(() => {
      window.location.reload();
    }, 6000);
  </script>
</head>
<body>
  <div class="card">
    ${
      isConnected
        ? `
      <div class="status-badge connected">● WHATSAPP TERHUBUNG</div>
      <h1>Bot WhatsApp Online! 🎉</h1>
      <p>Bot Rinci.in sudah aktif dan siap menerima pesan, transaksi, dan mengirim OTP.</p>
    `
        : `
      <div class="status-badge waiting">● MENUNGGU SCAN</div>
      <h1>Scan QR WhatsApp</h1>
      <p>Arahkan kamera WhatsApp HP kamu ke QR Code jernih di bawah ini:</p>
      <div class="qr-box">
        ${
          qrImageUrl
            ? `<img class="qr-img" src="${qrImageUrl}" alt="WhatsApp QR Code" />`
            : `<div style="width:260px;height:260px;display:flex;align-items:center;justify-content:center;color:#64748b;font-size:12px;">Sedang memuat QR code...</div>`
        }
      </div>
      <div class="steps">
        <strong>Cara Scan:</strong>
        <ol>
          <li>Buka <strong>WhatsApp</strong> di HP kamu</li>
          <li>Ketuk <strong>Menu (Titik 3)</strong> atau <strong>Settings</strong></li>
          <li>Pilih <strong>Perangkat Tertaut (Linked Devices)</strong></li>
          <li>Ketuk <strong>Tautkan Perangkat</strong> & scan QR di atas</li>
        </ol>
      </div>
      <button class="btn-refresh" onclick="window.location.reload()">🔄 Refresh QR Manual</button>
    `
    }
  </div>
</body>
</html>`;

      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(html);
    }

    // ==========================================
    // 2. GET /status -> Check connection status
    // ==========================================
    if (req.method === "GET" && url.pathname === "/status") {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          connected: connectionState === "open",
          hasQr: Boolean(latestQr)
        })
      );
    }

    // ==========================================
    // 3. POST /send-message -> Send WhatsApp message from API
    // ==========================================
    if (req.method === "POST" && url.pathname === "/send-message") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", async () => {
        try {
          const data = JSON.parse(body || "{}");
          const { phone, message } = data;

          if (!phone || !message) {
            res.writeHead(400, { "Content-Type": "application/json" });
            return res.end(
              JSON.stringify({ success: false, error: "Phone and message are required" })
            );
          }

          if (!botSocket) {
            res.writeHead(503, { "Content-Type": "application/json" });
            return res.end(
              JSON.stringify({ success: false, error: "WhatsApp bot socket is not connected" })
            );
          }

          let cleanPhone = String(phone).replace(/\D/g, "");
          if (cleanPhone.startsWith("0")) {
            cleanPhone = "62" + cleanPhone.slice(1);
          } else if (!cleanPhone.startsWith("62")) {
            cleanPhone = "62" + cleanPhone;
          }

          let targetJid = `${cleanPhone}@s.whatsapp.net`;
          try {
            if (typeof botSocket.onWhatsApp === "function") {
              const checkResults = await botSocket.onWhatsApp(cleanPhone);
              if (checkResults && checkResults.length > 0 && checkResults[0]?.exists) {
                targetJid = checkResults[0].jid;
              }
            }
          } catch (chkErr) {
            console.warn("⚠️ [Notif WA] onWhatsApp check skipped:", chkErr.message);
          }

          await botSocket.sendMessage(targetJid, {
            text: String(message)
          });

          console.log(`📨 [Notif WA] Successfully sent OTP/Notif to ${targetJid}`);

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, message: "Notification sent" }));
        } catch (err) {
          console.error("❌ [Notif WA] Error:", err.message);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not Found" }));
  });

  const listenPort = Number(process.env.PORT) || Number(port) || 3001;
  server.listen(listenPort, "0.0.0.0", () => {
    console.log(`🤖 WhatsApp Bot Server listening on 0.0.0.0:${listenPort}`);
  });

  return server;
}
