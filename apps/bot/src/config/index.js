import "dotenv/config";

let rawApiUrl = process.env.API_URL || "http://localhost:3000/api";
if (!rawApiUrl.endsWith("/api")) {
  rawApiUrl = `${rawApiUrl.replace(/\/+$/, "")}/api`;
}

export default {
  BOT_NAME: process.env.BOT_NAME || "Rinci.in",
  API_URL: rawApiUrl,
  SESSION_PATH: process.env.SESSION_PATH || "./session"
};