import { sendChat } from "../services/chat.service.js";
import { menuCommand } from "../commands/menu.js";
import { helpCommand } from "../commands/help.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function sendReplyWithTyping(sock, jid, text) {
  try {
    await sock.sendPresenceUpdate("composing", jid);
    await delay(600 + Math.floor(Math.random() * 400));
    await sock.sendMessage(jid, {
      text: String(text)
    });
    await sock.sendPresenceUpdate("paused", jid);
  } catch (err) {
    console.error("❌ Error sending message with typing:", err.message);
  }
}

export async function handleCommand(sock, jid, text, pushName = "", customPhone = null) {
  try {
    const phone = customPhone || jid.split("@")[0];
    const cmd = text.trim().toLowerCase();

    switch (cmd) {
      case "/start":
      case "start":
      case "menu":
        return await menuCommand(sock, jid, phone, pushName);

      case "help":
      case "bantuan":
        return await helpCommand(sock, jid, phone, pushName);

      default: {
        await sock.sendPresenceUpdate("composing", jid);

        const res = await sendChat(phone, text, pushName);

        const reply =
          res?.data?.text ||
          res?.data?.message ||
          res?.text ||
          res?.message ||
          "Maaf, saya belum memahami pesan tersebut. Ketik *menu* untuk melihat panduan.";

        await delay(500 + Math.floor(Math.random() * 300));

        await sock.sendMessage(jid, {
          text: String(reply)
        });

        // Jika response memiliki attachment dokumen (misal export CSV)
        const docBase64 = res?.document || res?.data?.document;
        if (docBase64) {
          const fileName = res?.fileName || res?.data?.fileName || "Rinci-Keuangan.csv";
          const mimetype = res?.mimetype || res?.data?.mimetype || "text/csv";

          await delay(400);
          await sock.sendMessage(jid, {
            document: Buffer.from(docBase64, "base64"),
            fileName,
            mimetype
          });
        }

        await sock.sendPresenceUpdate("paused", jid);
        return;
      }
    }
  } catch (err) {
    console.error("❌ Error handling command:", err.message);
  }
}
