import { processIncomingMessage } from "./chat.service.js";
import { success, fail } from "../../utils/response.js";

export async function processChat(req, res) {
  try {
    const result = await processIncomingMessage(req.body);

    console.log("========== RESULT ==========");
    console.dir(result, { depth: null });
    console.log("============================");

    return success(res, "OK", result);

  } catch (err) {
    console.error(err);

    return fail(res, err.message, err.status || 500);
  }
}