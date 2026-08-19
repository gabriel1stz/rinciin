import { sendChat } from "../services/chat.service.js";
import { sendReplyWithTyping } from "../handlers/command.handler.js";

export async function menuCommand(sock, jid, phone, pushName = "") {
  try {
    const res = await sendChat(phone, "menu", pushName);

    const reply =
      res?.data?.text ??
      res?.data?.message ??
      res?.text ??
      res?.message ??
      "Menu tidak tersedia.";

    await sendReplyWithTyping(sock, jid, reply);
  } catch (err) {
    console.error("❌ Error menuCommand:", err.message);
    await sock.sendMessage(jid, {
      text: "❌ Terjadi kesalahan saat memuat menu."
    });
  }
}


