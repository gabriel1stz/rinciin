import { detectIntent, Intent } from "../intent/intent.core.js";
import { parseMessage } from "../parser/message.parser.js";
import { parseBudgetMessage } from "../parser/budget.parser.js";

export function processMessage(message) {

  const intent = detectIntent(message);

  if (intent === Intent.CREATE_TRANSACTION) {

    return {
      success: true,
      intent,
      data: parseMessage(message)
    };

  }

  if (intent === Intent.SET_BUDGET) {

    return {
      success: true,
      intent,
      data: parseBudgetMessage(message)
    };

  }

  return {

    success: true,
    intent,
    data: null

  };

}