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
    // 1. GET /qr-data -> JSON Realtime Endpoint (No flicker)
    // ==========================================
    if (req.method === "GET" && url.pathname === "/qr-data") {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          connected: connectionState === "open",
          qr: latestQr || null,
          qrImageUrl: latestQr
            ? `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=12&data=${encodeURIComponent(latestQr)}`
            : null
        })
      );
    }

    // ==========================================
    // 2. GET / or /qr -> Seamless Realtime Web QR Scanner (Anti-Reload)
    // ==========================================
    if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/qr")) {
      const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hubungkan WhatsApp Bot - Rinci.in</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    body { background: #080d1a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
    .card { background: #0f172a; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 28px; padding: 36px 28px; max-width: 460px; width: 100%; text-align: center; box-shadow: 0 25px 60px -15px rgba(0,0,0,0.7); }
    h1 { font-size: 22px; font-weight: 700; margin-bottom: 8px; color: #10b981; }
    p { font-size: 13.5px; color: #94a3b8; line-height: 1.5; margin-bottom: 20px; }
    .status-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; border-radius: 9999px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 20px; text-transform: uppercase; transition: 0.3s; }
    .status-badge.waiting { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.35); }
    .status-badge.connected { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.5); }
    .pulse-dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.85); } }
    .qr-container { background: #ffffff; padding: 18px; border-radius: 20px; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 12px 30px rgba(0,0,0,0.4); margin-bottom: 22px; width: 300px; height: 300px; position: relative; }
    .qr-img { width: 264px; height: 264px; display: block; border-radius: 10px; transition: opacity 0.2s ease; }
    .qr-loading { color: #64748b; font-size: 13px; font-weight: 500; }
    .steps { text-align: left; background: #1e293b; padding: 16px 20px; border-radius: 16px; border: 1px solid #334155; font-size: 12.5px; color: #cbd5e1; line-height: 1.6; }
    .steps strong { color: #f1f5f9; display: block; margin-bottom: 6px; }
    .steps ol { padding-left: 18px; }
    .steps li { margin-bottom: 4px; }
    .success-box { display: none; padding: 20px 0; }
    .success-icon { font-size: 56px; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <div id="statusBadge" class="status-badge waiting">
      <span class="pulse-dot"></span>
      <span id="statusText">MENUNGGU SCAN...</span>
    </div>

    <div id="scanSection">
      <h1>Scan QR WhatsApp</h1>
      <p>Arahkan kamera WhatsApp HP kamu ke QR Code di bawah ini (otomatis aktif tanpa refresh halaman):</p>

      <div class="qr-container">
        <div id="qrPlaceholder" class="qr-loading">Memuat QR Code WhatsApp...</div>
        <img id="qrImage" class="qr-img" src="" alt="WhatsApp QR Code" style="display: none;" />
      </div>

      <div class="steps">
        <strong>Cara Scan dari HP:</strong>
        <ol>
          <li>Buka aplikasi <strong>WhatsApp</strong> di HP kamu</li>
          <li>Ketuk <strong>Menu (Titik 3)</strong> atau <strong>Settings</strong></li>
          <li>Pilih <strong>Perangkat Tertaut (Linked Devices)</strong></li>
          <li>Ketuk <strong>Tautkan Perangkat</strong> & arahkan ke QR di atas</li>
        </ol>
      </div>
    </div>

    <div id="successSection" class="success-box">
      <div class="success-icon">🎉</div>
      <h1 style="color: #34d399; font-size: 24px;">WhatsApp Terhubung!</h1>
      <p style="margin-top: 10px; color: #cbd5e1;">Bot Rinci.in sudah aktif 24 jam. Kamu sekarang bisa mengirim pesan transaksi dan menerima kode OTP login.</p>
    </div>
  </div>

  <script>
    let lastQrUrl = '';
    let isConnected = false;

    async function checkQR() {
      try {
        const res = await fetch('/qr-data');
        const data = await res.json();

        const badge = document.getElementById('statusBadge');
        const statusText = document.getElementById('statusText');
        const scanSection = document.getElementById('scanSection');
        const successSection = document.getElementById('successSection');
        const qrImage = document.getElementById('qrImage');
        const qrPlaceholder = document.getElementById('qrPlaceholder');

        if (data.connected) {
          if (!isConnected) {
            isConnected = true;
            badge.className = 'status-badge connected';
            statusText.innerText = 'WHATSAPP TERHUBUNG';
            scanSection.style.display = 'none';
            successSection.style.display = 'block';
          }
          return;
        }

        if (data.qrImageUrl && data.qrImageUrl !== lastQrUrl) {
          lastQrUrl = data.qrImageUrl;
          qrImage.src = data.qrImageUrl;
          qrImage.onload = () => {
            qrPlaceholder.style.display = 'none';
            qrImage.style.display = 'block';
          };
        }
      } catch (err) {
        console.warn('Checking QR status...', err);
      }
    }

    // Check every 2.5 seconds seamlessly without page reload
    checkQR();
    setInterval(checkQR, 2500);
  </script>
</body>
</html>`;

      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(html);
    }

    // ==========================================
    // 3. GET /status -> Health check
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
    // 4. POST /send-message -> Send WhatsApp message from API
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
