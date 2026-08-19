import http from "http";

let botSocket = null;

export function setBotSocket(sock) {
  botSocket = sock;
}

export function startInternalServer(port = 3001) {
  const server = http.createServer(async (req, res) => {
    // Enable CORS for localhost
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      return res.end();
    }

    if (req.method === "POST" && req.url === "/send-message") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", async () => {
        try {
          const data = JSON.parse(body || "{}");
          const { phone, message } = data;

          if (!phone || !message) {
            res.writeHead(400, { "Content-Type": "application/json" });
            return res.end(
              JSON.stringify({ success: false, error: "Phone and message are required" })
            );
          }

          if (!botSocket) {
            res.writeHead(503, { "Content-Type": "application/json" });
            return res.end(
              JSON.stringify({ success: false, error: "WhatsApp bot socket is not connected" })
            );
          }

          let cleanPhone = String(phone).replace(/\D/g, "");
          if (cleanPhone.startsWith("0")) {
            cleanPhone = "62" + cleanPhone.slice(1);
          } else if (!cleanPhone.startsWith("62")) {
            cleanPhone = "62" + cleanPhone;
          }

          let targetJid = `${cleanPhone}@s.whatsapp.net`;
          try {
            if (typeof botSocket.onWhatsApp === "function") {
              const checkResults = await botSocket.onWhatsApp(cleanPhone);
              if (checkResults && checkResults.length > 0 && checkResults[0]?.exists) {
                targetJid = checkResults[0].jid;
              }
            }
          } catch (chkErr) {
            console.warn("⚠️ [Notif WA] onWhatsApp check skipped:", chkErr.message);
          }

          await botSocket.sendMessage(targetJid, {
            text: String(message)
          });

          console.log(`📨 [Notif WA] Successfully sent OTP/Notif to ${targetJid}`);


          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, message: "Notification sent" }));
        } catch (err) {
          console.error("❌ [Notif WA] Error:", err.message);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not Found" }));
    }
  });

  server.listen(port, () => {
    console.log(`🤖 WhatsApp Bot Internal Notification Server listening on port ${port}`);
  });

  return server;
}
