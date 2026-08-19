import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState
} from "@whiskeysockets/baileys";

import P from "pino";
import qrcode from "qrcode-terminal";
import { Boom } from "@hapi/boom";

import { handleMessage } from "../handlers/message.handler.js";
import { setBotSocket, setLatestQr, setConnectionState } from "../server.js";

let currentSock = null;

export async function requestPairingCode(phone) {
  if (!currentSock) throw new Error("Bot socket belum aktif");
  const cleanPhone = String(phone).replace(/\D/g, "");
  const code = await currentSock.requestPairingCode(cleanPhone);
  return code;
}

export async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");

  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: P({ level: "silent" }),
    printQRInTerminal: false
  });

  currentSock = sock;
  setBotSocket(sock);

  // Auto-request Pairing Code if PAIRING_PHONE is provided
  const pairingPhone = process.env.PAIRING_PHONE || process.env.BOT_PHONE || process.env.PHONE_NUMBER;
  if (pairingPhone && !sock.authState.creds.registered) {
    let cleanPhone = String(pairingPhone).replace(/\D/g, "");
    if (cleanPhone.startsWith("0")) cleanPhone = "62" + cleanPhone.slice(1);
    console.log(`\n📲 Meminta Kode Pairing WhatsApp untuk nomor: ${cleanPhone}...`);

    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(cleanPhone);
        console.log("\n╔══════════════════════════════════════════╗");
        console.log("║    🔢 KODE PAIRING WHATSAPP KAMU:        ║");
        console.log(`║          👉  ${code}  👈              ║`);
        console.log("╚══════════════════════════════════════════╝");
        console.log("Cara pakai: Buka WA di HP > Perangkat Tertaut > Tautkan dg nomor telepon > Masukkan kode di atas!\n");
      } catch (pairErr) {
        console.error("❌ Gagal request pairing code:", pairErr.message);
      }
    }, 2500);
  }

  sock.ev.on("creds.update", saveCreds);

  let reconnectAttempts = 0;

  sock.ev.on("connection.update", ({ connection, qr, lastDisconnect }) => {
    if (qr && !pairingPhone) {
      setLatestQr(qr);
      qrcode.generate(qr, { small: true });
      console.log("\n========================================");
      console.log("📱 SCAN QR CODE WHATSAPP");
      console.log("👉 Buka link browser service bot untuk QR jernih!");
      console.log("========================================\n");
    }

    if (connection === "open") {
      console.log("✅ WhatsApp Connected Successfully");
      setLatestQr(null);
      setConnectionState("open");
      reconnectAttempts = 0;
      setBotSocket(sock);
    }

    if (connection === "close") {
      setConnectionState("close");
      const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;

      console.log("❌ WhatsApp Connection Closed");
      console.log("Status Code:", statusCode);
      console.log("Reason:", lastDisconnect?.error?.message || lastDisconnect?.error);

      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      if (shouldReconnect) {
        reconnectAttempts++;
        const backoffMs = Math.min(30000, Math.pow(1.5, reconnectAttempts) * 2000);
        console.log(`🔄 [Auto-Reconnect] Attempt #${reconnectAttempts} in ${Math.round(backoffMs / 1000)}s...`);
        setTimeout(() => startBot(), backoffMs);
      } else {
        console.log("🚪 Logged out dari WhatsApp. Silakan scan ulang QR.");
      }
    }
  });

  sock.ev.on("messages.upsert", handleMessage.bind(null, sock));
}