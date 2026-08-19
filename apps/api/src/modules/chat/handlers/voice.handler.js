import { transcribeAudio } from "../../audio/voice.service.js";

export async function voiceHandler(body, user, processMessageFn) {
  const audioInput = body.audio;
  const mimeType = body.mimeType || "audio/ogg";

  if (!audioInput) {
    return {
      success: false,
      text: "❌ Rekaman suara tidak ditemukan."
    };
  }

  const transcribed = await transcribeAudio(audioInput, mimeType);

  if (!transcribed.success || !transcribed.text) {
    return {
      success: false,
      text: "❌ Maaf, rekaman suara tidak terdengar jelas. Silakan coba rekam kembali lebih dekat dengan mikrofon."
    };
  }

  console.log("🎤 Transcribed Voice Note:", transcribed.text);

  if (typeof processMessageFn === "function") {
    const chatResult = await processMessageFn({
      phone: body.phone,
      name: body.name,
      message: transcribed.text
    });

    const header = `🎤 *Pesan Suara Terdeteksi:*\n_"${transcribed.text}"_\n━━━━━━━━━━━━━━\n`;

    return {
      ...chatResult,
      transcribedText: transcribed.text,
      text: header + (chatResult.text || "")
    };
  }

  return {
    success: true,
    transcribedText: transcribed.text,
    text: `🎤 *Pesan Suara Terdeteksi:*\n_"${transcribed.text}"_`
  };
}
