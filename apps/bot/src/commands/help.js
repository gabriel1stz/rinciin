import { sendChat } from "../services/chat.service.js";
import { sendReplyWithTyping } from "../handlers/command.handler.js";

export async function helpCommand(sock, jid, phone, pushName = "") {
  try {
    const res = await sendChat(phone, "help", pushName);

    const reply =
      res?.data?.text ??
      res?.data?.message ??
      res?.text ??
      res?.message ??
      "Bantuan tidak tersedia.";

    await sendReplyWithTyping(sock, jid, reply);
  } catch (err) {
    console.error("❌ Error helpCommand:", err.message);
    await sock.sendMessage(jid, {
      text: "❌ Terjadi kesalahan saat memuat bantuan."
    });
  }
}
