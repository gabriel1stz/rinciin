import { processWebhook } from "./payment.webhook.service.js";

export async function webhook(req, res) {
  try {

    await processWebhook(req.body);

    res.json({
      success: true
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }
}