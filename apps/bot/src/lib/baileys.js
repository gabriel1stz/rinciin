import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState
} from "@whiskeysockets/baileys";

import P from "pino";
import { Boom } from "@hapi/boom";

import { handleMessage } from "../handlers/message.handler.js";
import { setBotSocket, setLatestQr, setConnectionState, setBotInfo } from "../server.js";

let currentSock = null;
let isStarting = false;

export async function requestPairingCode(phone) {
  if (!currentSock) {
    throw new Error("Bot WhatsApp sedang memuat... Silakan tunggu 5 detik dan coba lagi.");
  }
  let cleanPhone = String(phone).replace(/\D/g, "");
  if (cleanPhone.startsWith("0")) {
    cleanPhone = "62" + cleanPhone.slice(1);
  } else if (!cleanPhone.startsWith("62")) {
    cleanPhone = "62" + cleanPhone;
  }

  if (cleanPhone.length < 10 || cleanPhone.length > 15) {
    throw new Error("Nomor WhatsApp tidak valid. Masukkan nomor yang benar (contoh: 08123456789).");
  }

  console.log(`📲 [Pairing] Meminta kode pairing untuk nomor: ${cleanPhone}...`);
  const code = await currentSock.requestPairingCode(cleanPhone);
  console.log(`✅ [Pairing] Kode pairing berhasil dibuat: ${code}`);
  return code;
}

export async function startBot() {
  if (isStarting) return;
  isStarting = true;

  try {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      auth: state,
      logger: P({ level: "silent" }),
      printQRInTerminal: false,
      browser: ["Ubuntu", "Chrome", "20.0.04"],
      syncFullHistory: false,
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 0,
      keepAliveIntervalMs: 15000
    });

    currentSock = sock;
    setBotSocket(sock);

    sock.ev.on("creds.update", saveCreds);

    let reconnectAttempts = 0;

    sock.ev.on("connection.update", ({ connection, qr, lastDisconnect }) => {
      if (qr) {
        setLatestQr(qr);
        console.log("📱 [WA QR] QR Code diperbarui untuk scan browser.");
      }

      if (connection === "open") {
        console.log("✅ [WA Connected] WhatsApp Bot Berhasil Terhubung!");
        setLatestQr(null);
        setConnectionState("open");
        const userJid = sock.user?.id || sock.user?.name || "Connected";
        const cleanNumber = userJid.split(":")[0] || userJid.split("@")[0];
        setBotInfo({ phone: cleanNumber });
        reconnectAttempts = 0;
        isStarting = false;
        setBotSocket(sock);
      }

      if (connection === "close") {
        setConnectionState("close");
        isStarting = false;
        const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;

        console.log("❌ [WA Close] WhatsApp Connection Closed. Status:", statusCode);

        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

        if (shouldReconnect) {
          reconnectAttempts++;
          const backoffMs = Math.min(25000, Math.pow(1.5, reconnectAttempts) * 2000);
          console.log(`🔄 [Auto-Reconnect] Menghubungkan ulang dalam ${Math.round(backoffMs / 1000)}s...`);
          setTimeout(() => startBot(), backoffMs);
        } else {
          console.log("🚪 [WA Logout] Logged out dari WhatsApp. Silakan scan atau masukkan pairing code lagi.");
        }
      }
    });

    sock.ev.on("messages.upsert", handleMessage.bind(null, sock));
  } catch (err) {
    console.error("❌ Error saat startBot:", err);
    isStarting = false;
    setTimeout(() => startBot(), 5000);
  }
}