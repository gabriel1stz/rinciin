import { processIncomingMessage } from "./message.service.js";
import { success, fail } from "../../utils/response.js";

export async function process(req, res) {

  try {

    const { message } = req.body;

    if (!message) {
      return fail(res, "Message wajib diisi");
    }

    const result = await processIncomingMessage(message);

    return success(res, "OK", result);

  } catch (err) {

    return fail(res, err.message, 500);

  }

}