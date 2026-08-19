import api from "./api.service.js";

export async function sendChat(phone, message, name = "", extra = {}) {
  try {
    const res = await api.post("/chat", {
      phone,
      message,
      name,
      ...extra
    });

    return res.data;

  } catch (err) {
    if (err.response?.data) {
      return err.response.data;
    }

    console.error("❌ API Chat Error:", err.message);
    return {
      success: false,
      message: "❌ Backend API tidak dapat dihubungi atau sedang offline."
    };
  }
}