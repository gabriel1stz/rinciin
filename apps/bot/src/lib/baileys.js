import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState
} from "@whiskeysockets/baileys";

import P from "pino";
import qrcode from "qrcode-terminal";
import { Boom } from "@hapi/boom";

import config from "../config/index.js";
import { handleMessage } from "../handlers/message.handler.js";
import { setBotSocket } from "../server.js";

export async function startBot() {

  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");

  const { version } =
    await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: P({ level: "silent" })
  });

  sock.ev.on("creds.update", saveCreds);

  let reconnectAttempts = 0;

  sock.ev.on("connection.update", ({ connection, qr, lastDisconnect }) => {
    if (qr) {
      qrcode.generate(qr, { small: true });
      console.log("📱 Scan QR WhatsApp");
    }

    if (connection === "open") {
      console.log("✅ WhatsApp Connected Successfully");
      reconnectAttempts = 0;
      setBotSocket(sock);
    }

    if (connection === "close") {
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
        console.log("🚪 Logged out dari WhatsApp. Silakan hapus folder auth_info_baileys lalu scan ulang QR.");
      }
    }
  });

  sock.ev.on("messages.upsert", handleMessage.bind(null, sock));

}