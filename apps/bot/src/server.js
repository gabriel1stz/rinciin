import http from "http";
import { requestPairingCode, resetAuthSession } from "./lib/baileys.js";

let botSocket = null;
let latestQr = null;
let connectionState = "connecting";
let botInfo = null;

export function setBotSocket(sock) {
  botSocket = sock;
}

export function setLatestQr(qr) {
  latestQr = qr;
}

export function setConnectionState(state) {
  connectionState = state;
}

export function setBotInfo(info) {
  botInfo = info;
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
    // 0. POST /api/reset-session -> Clean restart session
    // ==========================================
    if (req.method === "POST" && url.pathname === "/api/reset-session") {
      const ok = resetAuthSession();
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ success: ok, message: "Session reset and restarted" }));
    }

    // ==========================================
    // 1. POST /api/request-pairing -> Interactive Pairing Code via Web
    // ==========================================
    if (req.method === "POST" && url.pathname === "/api/request-pairing") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", async () => {
        try {
          const data = JSON.parse(body || "{}");
          const { phone } = data;

          if (!phone) {
            res.writeHead(400, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ success: false, error: "Nomor WhatsApp wajib diisi" }));
          }

          const code = await requestPairingCode(phone);
          res.writeHead(200, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ success: true, code }));
        } catch (err) {
          console.error("❌ [API Pairing] Error:", err.message);
          res.writeHead(500, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }

    // ==========================================
    // 2. GET /qr-data -> Realtime status endpoint
    // ==========================================
    if (req.method === "GET" && url.pathname === "/qr-data") {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          connected: connectionState === "open",
          qr: latestQr || null,
          qrImageUrl: latestQr
            ? `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=12&data=${encodeURIComponent(latestQr)}`
            : null,
          botInfo
        })
      );
    }

    // ==========================================
    // 3. GET / or /qr -> Interactive Web Dashboard
    // ==========================================
    if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/qr")) {
      const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hubungkan WhatsApp Bot - Rinci.in</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    body { background: #080d1a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px 16px; }
    .card { background: #0f172a; border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 28px; padding: 36px 30px; max-width: 480px; width: 100%; text-align: center; box-shadow: 0 25px 60px -15px rgba(0,0,0,0.8); }
    h1 { font-size: 22px; font-weight: 700; color: #f1f5f9; margin-bottom: 6px; }
    p.subtitle { font-size: 13.5px; color: #94a3b8; line-height: 1.5; margin-bottom: 22px; }
    .status-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; border-radius: 9999px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 22px; text-transform: uppercase; }
    .status-badge.waiting { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.35); }
    .status-badge.connected { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.5); }
    .pulse-dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.85); } }
    
    /* Tabs */
    .tab-container { display: flex; background: #1e293b; padding: 4px; border-radius: 14px; margin-bottom: 24px; }
    .tab-btn { flex: 1; padding: 10px 14px; background: transparent; border: none; color: #94a3b8; font-size: 13px; font-weight: 600; border-radius: 10px; cursor: pointer; transition: 0.2s; }
    .tab-btn.active { background: #10b981; color: #ffffff; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
    
    /* Pairing Form */
    .input-group { margin-bottom: 16px; text-align: left; }
    .input-group label { display: block; font-size: 12.5px; font-weight: 600; color: #cbd5e1; margin-bottom: 8px; }
    .phone-input-wrapper { display: flex; align-items: center; background: #1e293b; border: 1px solid #334155; border-radius: 14px; padding: 4px 14px; transition: 0.2s; }
    .phone-input-wrapper:focus-within { border-color: #10b981; box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2); }
    .country-code { font-weight: 600; color: #10b981; font-size: 14px; margin-right: 8px; }
    .phone-input { flex: 1; background: transparent; border: none; color: #ffffff; font-size: 14px; font-weight: 500; padding: 10px 0; outline: none; }
    .btn-submit { width: 100%; background: #10b981; color: #ffffff; border: none; padding: 13px; border-radius: 14px; font-size: 14px; font-weight: 700; cursor: pointer; transition: 0.2s; margin-top: 6px; box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3); }
    .btn-submit:hover { background: #059669; }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

    /* Code Display Box */
    .code-display { display: none; background: #080d1a; border: 2px dashed #10b981; border-radius: 18px; padding: 22px; margin-top: 20px; text-align: center; }
    .code-title { font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .code-value { font-size: 32px; font-weight: 800; color: #34d399; letter-spacing: 4px; font-family: monospace; margin-bottom: 12px; }
    .btn-copy { background: #1e293b; color: #cbd5e1; border: 1px solid #334155; padding: 8px 16px; border-radius: 10px; font-size: 12px; font-weight: 600; cursor: pointer; transition: 0.2s; }
    .btn-copy:hover { background: #334155; color: #ffffff; }

    /* QR Code Display */
    .qr-container { background: #ffffff; padding: 16px; border-radius: 20px; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 12px 30px rgba(0,0,0,0.5); margin: 10px 0 20px 0; width: 290px; height: 290px; }
    .qr-img { width: 258px; height: 258px; display: block; border-radius: 8px; }

    /* Steps */
    .steps { text-align: left; background: #1e293b; padding: 16px 20px; border-radius: 16px; border: 1px solid #334155; font-size: 12.5px; color: #cbd5e1; line-height: 1.6; margin-top: 18px; }
    .steps strong { color: #f1f5f9; display: block; margin-bottom: 6px; }
    .steps ol { padding-left: 18px; }
    .steps li { margin-bottom: 4px; }

    /* Success Screen */
    .success-box { display: none; padding: 24px 0; }
    .success-icon { font-size: 60px; margin-bottom: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <div id="statusBadge" class="status-badge waiting">
      <span class="pulse-dot"></span>
      <span id="statusText">MENUNGGU KONEKSI...</span>
    </div>

    <div id="mainSection">
      <h1>Hubungkan WhatsApp Bot</h1>
      <p class="subtitle">Pilih cara yang paling mudah untuk menautkan nomor WhatsApp bot kamu:</p>

      <div class="tab-container">
        <button id="tabPairingBtn" class="tab-btn active" onclick="switchTab('pairing')">🔢 Kode Pairing (Input Nomor)</button>
        <button id="tabQrBtn" class="tab-btn" onclick="switchTab('qr')">📷 Scan QR Code</button>
      </div>

      <!-- TAB 1: PAIRING CODE VIA PHONE INPUT -->
      <div id="tabPairing">
        <div class="input-group">
          <label for="phoneNumber">Masukkan Nomor WhatsApp Kamu:</label>
          <div class="phone-input-wrapper">
            <span class="country-code">+62</span>
            <input type="tel" id="phoneNumber" class="phone-input" placeholder="87848622365 (tanpa angka 0)" value="87848622365" />
          </div>
        </div>
        <button id="btnGetPairing" class="btn-submit" onclick="submitPairing()">🚀 Dapatkan Kode Pairing (8 Digit)</button>

        <div id="codeDisplay" class="code-display">
          <div class="code-title">Kode Pairing WhatsApp Kamu:</div>
          <div id="codeValue" class="code-value">---- ----</div>
          <button class="btn-copy" onclick="copyCode()">📋 Salin Kode</button>
          
          <div class="steps" style="margin-top: 16px;">
            <strong>Cara Memasukkan Kode di HP:</strong>
            <ol>
              <li>Buka <strong>WhatsApp</strong> di HP kamu</li>
              <li>Ketuk <strong>Menu (Titik 3)</strong> ➡️ <strong>Perangkat Tertaut</strong></li>
              <li>Ketuk <strong>Tautkan Perangkat</strong></li>
              <li>Ketuk opsi: <strong>"Tautkan dengan nomor telepon saja"</strong></li>
              <li>Masukkan 8 digit kode di atas!</li>
            </ol>
          </div>
        </div>
      </div>

      <!-- TAB 2: QR CODE -->
      <div id="tabQr" style="display: none;">
        <div class="qr-container">
          <div id="qrPlaceholder" style="color: #64748b; font-size: 13px;">Sedang memuat QR Code...</div>
          <img id="qrImage" class="qr-img" src="" alt="WhatsApp QR Code" style="display: none;" />
        </div>
        <div class="steps">
          <strong>Cara Scan:</strong>
          <ol>
            <li>Buka <strong>WhatsApp</strong> di HP kamu</li>
            <li>Ketuk <strong>Menu (Titik 3)</strong> ➡️ <strong>Perangkat Tertaut</strong></li>
            <li>Ketuk <strong>Tautkan Perangkat</strong> ➡️ Arahkan kamera ke QR di atas</li>
          </ol>
        </div>
      </div>
    </div>

    <!-- SUCCESS SCREEN -->
    <div id="successSection" class="success-box">
      <div class="success-icon">🎉</div>
      <h1 style="color: #34d399; font-size: 24px;">WhatsApp Terhubung!</h1>
      <p style="margin-top: 10px; color: #cbd5e1; font-size: 14px;">Bot Rinci.in sudah aktif 24 jam di server. Bot sekarang siap mengirim kode OTP login dan mencatat transaksi.</p>
    </div>
  </div>

  <script>
    let activeTab = 'pairing';
    let currentCode = '';
    let isConnected = false;
    let lastQrUrl = '';

    function switchTab(tab) {
      activeTab = tab;
      document.getElementById('tabPairingBtn').className = 'tab-btn' + (tab === 'pairing' ? ' active' : '');
      document.getElementById('tabQrBtn').className = 'tab-btn' + (tab === 'qr' ? ' active' : '');
      document.getElementById('tabPairing').style.display = tab === 'pairing' ? 'block' : 'none';
      document.getElementById('tabQr').style.display = tab === 'qr' ? 'block' : 'none';
    }

    async function submitPairing() {
      const input = document.getElementById('phoneNumber').value.trim();
      const btn = document.getElementById('btnGetPairing');
      const codeDisplay = document.getElementById('codeDisplay');
      const codeValue = document.getElementById('codeValue');

      if (!input) {
        alert('Masukkan nomor WhatsApp terlebih dahulu!');
        return;
      }

      btn.disabled = true;
      btn.innerText = '⏳ Mengambil Kode dari WhatsApp...';

      try {
        let phone = input.replace(/\\D/g, '');
        if (phone.startsWith('0')) phone = '62' + phone.slice(1);
        if (!phone.startsWith('62')) phone = '62' + phone;

        const res = await fetch('/api/request-pairing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone })
        });

        const data = await res.json();
        if (data.success && data.code) {
          currentCode = data.code;
          codeValue.innerText = data.code;
          codeDisplay.style.display = 'block';
          btn.innerText = '🔄 Minta Kode Baru';
          btn.disabled = false;
        } else {
          alert('Gagal mengambil kode: ' + (data.error || 'Silakan coba lagi.'));
          btn.innerText = '🚀 Dapatkan Kode Pairing (8 Digit)';
          btn.disabled = false;
        }
      } catch (err) {
        alert('Error: ' + err.message);
        btn.innerText = '🚀 Dapatkan Kode Pairing (8 Digit)';
        btn.disabled = false;
      }
    }

    function copyCode() {
      if (currentCode) {
        navigator.clipboard.writeText(currentCode.replace(/\\s/g, ''));
        alert('Kode ' + currentCode + ' berhasil disalin!');
      }
    }

    async function checkStatus() {
      try {
        const res = await fetch('/qr-data');
        const data = await res.json();

        const badge = document.getElementById('statusBadge');
        const statusText = document.getElementById('statusText');
        const mainSection = document.getElementById('mainSection');
        const successSection = document.getElementById('successSection');
        const qrImage = document.getElementById('qrImage');
        const qrPlaceholder = document.getElementById('qrPlaceholder');

        if (data.connected) {
          if (!isConnected) {
            isConnected = true;
            badge.className = 'status-badge connected';
            statusText.innerText = 'WHATSAPP TERHUBUNG';
            mainSection.style.display = 'none';
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
        console.warn('Status check...', err);
      }
    }

    checkStatus();
    setInterval(checkStatus, 2500);
  </script>
</body>
</html>`;

      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(html);
    }

    // ==========================================
    // 4. GET /status -> Health check
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
    // 5. POST /send-message -> Send WhatsApp message from API
    // ==========================================
    if (req.method === "POST" && url.pathname === "/send-message") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));

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
