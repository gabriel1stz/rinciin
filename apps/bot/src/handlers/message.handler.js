import fs from "fs";
import path from "path";
import { downloadMediaMessage } from "@whiskeysockets/baileys";
import { handleCommand } from "./command.handler.js";
import { sendChat } from "../services/chat.service.js";
import { checkBotRateLimit } from "../middlewares/rate-limit.bot.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function resolvePhoneNumber(sock, message, jid) {
  if (!jid) return "";

  if (jid.endsWith("@s.whatsapp.net")) {
    return jid.split("@")[0];
  }

  // Handle WhatsApp @lid format
  if (jid.endsWith("@lid")) {
    // 1. Coba dari alt attributes
    const altJid =
      message.key?.remoteJidAlt ||
      message.key?.participantAlt ||
      message.key?.participant;

    if (altJid && typeof altJid === "string" && altJid.endsWith("@s.whatsapp.net")) {
      return altJid.split("@")[0];
    }

    // 2. Coba dari Baileys signalRepository lidMapping
    try {
      if (sock?.signalRepository?.lidMapping?.getPNForLID) {
        const pn = await sock.signalRepository.lidMapping.getPNForLID(jid);
        if (pn && typeof pn === "string") {
          return pn.split("@")[0];
        }
      }
    } catch (e) {}

    // 3. Coba dari disk cache auth_info_baileys
    try {
      const authDir = path.resolve(process.cwd(), "auth_info_baileys");
      if (fs.existsSync(authDir)) {
        const lidUser = jid.split("@")[0];
        const files = fs.readdirSync(authDir);
        for (const file of files) {
          if (file.startsWith("lid-mapping-") && file.endsWith(".json")) {
            const content = fs.readFileSync(path.join(authDir, file), "utf-8");
            if (content.includes(lidUser)) {
              const matched = file.match(/lid-mapping-(\d+)\.json/);
              if (matched && matched[1]) {
                return matched[1];
              }
            }
          }
        }
      }
    } catch (e) {}
  }

  return jid.split("@")[0];
}

export async function handleMessage(sock, msg) {
  try {
    const message = msg.messages?.[0];

    if (!message) return;
    if (!message.message) return;
    if (message.key.fromMe) return;

    const jid = message.key.remoteJid;

    if (jid === "status@broadcast") return;

    const pushName = message.pushName || "";
    const phone = await resolvePhoneNumber(sock, message, jid);

    // ==========================================
    // ANTI-SPAM / RATE LIMIT PER USER
    // ==========================================
    const rateCheck = checkBotRateLimit(jid);
    if (!rateCheck.allowed) {
      if (rateCheck.shouldWarn) {
        await sock.sendMessage(jid, {
          text: `⚠️ *Santai dulu ya kak ${pushName ? pushName : ""}!*\nKirim pesannya jangan terlalu cepat. Tunggu *${rateCheck.retrySeconds} detik* sebelum mengirim pesan berikutnya.`,
        });
      }
      return;
    }

    // ==========================================
    // 1. CEK FOTO STRUK / GAMBAR
    // ==========================================
    if (message.message.imageMessage) {
      const caption = message.message.imageMessage.caption || "";

      console.log("==================================");
      console.log("From  :", jid, pushName ? `(${pushName})` : "");
      console.log("Phone :", phone);
      console.log("Type  : Image / Struk Belanja");
      console.log("Caption:", caption);
      console.log("==================================");

      await sock.sendPresenceUpdate("composing", jid);

      try {
        const buffer = await downloadMediaMessage(
          message,
          "buffer",
          {},
          {
            logger: { info: () => {}, error: () => {}, warn: () => {}, debug: () => {}, trace: () => {} },
            reuploadRequest: sock.updateMediaMessage
          }
        );

        const res = await sendChat(phone, caption, pushName, {
          image: buffer.toString("base64"),
          mimeType: message.message.imageMessage.mimetype || "image/jpeg"
        });

        const reply =
          res?.data?.text ??
          res?.data?.message ??
          res?.text ??
          res?.message ??
          "Terjadi kesalahan saat memproses struk belanja.";

        await delay(500);
        await sock.sendMessage(jid, { text: String(reply) });
        await sock.sendPresenceUpdate("paused", jid);
      } catch (mediaErr) {
        console.error("❌ Error downloading/processing image:", mediaErr.message);
        await sock.sendMessage(jid, {
          text: "❌ Gagal memproses gambar struk. Pastikan koneksi lancar dan coba kirim ulang ya!"
        });
      }
      return;
    }

    // ==========================================
    // 2. CEK VOICE NOTE / AUDIO
    // ==========================================
    if (message.message.audioMessage) {
      console.log("==================================");
      console.log("From  :", jid, pushName ? `(${pushName})` : "");
      console.log("Phone :", phone);
      console.log("Type  : Voice Note / Audio");
      console.log("==================================");

      await sock.sendPresenceUpdate("composing", jid);

      try {
        const buffer = await downloadMediaMessage(
          message,
          "buffer",
          {},
          {
            logger: { info: () => {}, error: () => {}, warn: () => {}, debug: () => {}, trace: () => {} },
            reuploadRequest: sock.updateMediaMessage
          }
        );

        const res = await sendChat(phone, "", pushName, {
          audio: buffer.toString("base64"),
          mimeType: message.message.audioMessage.mimetype || "audio/ogg; codecs=opus"
        });

        const reply =
          res?.data?.text ??
          res?.data?.message ??
          res?.text ??
          res?.message ??
          "Terjadi kesalahan saat memproses pesan suara.";

        await delay(500);
        await sock.sendMessage(jid, { text: String(reply) });
        await sock.sendPresenceUpdate("paused", jid);
      } catch (audioErr) {
        console.error("❌ Error downloading/processing audio:", audioErr.message);
        await sock.sendMessage(jid, {
          text: "❌ Gagal memproses pesan suara. Silakan coba kirim ulang ya!"
        });
      }
      return;
    }

    // ==========================================
    // 3. PESAN TEKS BIASA
    // ==========================================

    const text =
      message.message.conversation ||
      message.message.extendedTextMessage?.text ||
      "";

    if (!text) return;

    console.log("==================================");
    console.log("From  :", jid, pushName ? `(${pushName})` : "");
    console.log("Phone :", phone);
    console.log("Text  :", text);
    console.log("==================================");

    await handleCommand(sock, jid, text, pushName, phone);
  } catch (err) {
    console.error("❌ Error in handleMessage:", err.message);
  }
}

