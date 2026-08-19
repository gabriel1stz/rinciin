import { executeGemini } from "../../lib/gemini.js";

/**
 * Transcribe WhatsApp Voice Note / Audio to text
 * @param {Buffer|string} audioInput - Buffer or Base64 string of audio (.ogg / .mp3 / .wav)
 * @param {string} mimeType - e.g. 'audio/ogg; codecs=opus', 'audio/mp4', 'audio/mpeg'
 */
export async function transcribeAudio(audioInput, mimeType = "audio/ogg; codecs=opus") {
  try {
    const base64Data = Buffer.isBuffer(audioInput)
      ? audioInput.toString("base64")
      : audioInput;

    const prompt = `
Dengarkan rekaman suara ini dalam bahasa Indonesia.
Tugasmu adalah mentranskripsikan ucapan pengguna mengenai pencatatan transaksi keuangan secara akurat.

Contoh hasil yang diharapkan:
- "makan siang nasi padang 35 ribu gopay"
- "beli bensin pertalite 50rb bca"
- "isi saldo gopay 200rb"
- "gaji bulanan 7jt bca"
- "laporan bulan ini"
- "saldo"

PENTING:
- Kembalikan HANYA teks transkripsinya dalam format sederhana (lowercase atau kalimat langsung).
- JANGAN sertakan tanda kutip, penjelasan tambahan, atau markdown.
`;

    // Normalize mimeType for Gemini
    let cleanMime = mimeType.split(";")[0].trim();
    if (cleanMime === "audio/ogg" || cleanMime === "audio/opus") {
      cleanMime = "audio/ogg";
    }

    const response = await executeGemini(async (client, model) => {
      return client.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: cleanMime,
                  data: base64Data
                }
              },
              {
                text: prompt
              }
            ]
          }
        ]
      });
    });


    const transcribed = (response.text || "").trim().replace(/^["']|["']$/g, "");

    return {
      success: true,
      text: transcribed
    };
  } catch (err) {
    console.error("❌ Error in transcribeAudio:", err.message);
    return {
      success: false,
      error: err.message
    };
  }
}
