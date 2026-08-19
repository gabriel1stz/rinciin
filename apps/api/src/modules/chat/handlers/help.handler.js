import { formatHelpText } from "../../formatter/help.formatter.js";

export async function helpHandler() {

  return {
    success: true,
    intent: "HELP",
    text: formatHelpText()
  };

}