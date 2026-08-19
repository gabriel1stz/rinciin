import { processMessage } from "../../core/message/message.engine.js";

export async function processIncomingMessage(text) {
  return processMessage(text);
}