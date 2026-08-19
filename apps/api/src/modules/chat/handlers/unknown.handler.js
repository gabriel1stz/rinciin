import { formatUnknownText } from "../../formatter/error.formatter.js";

export async function unknownHandler() {

  return {
    success: false,
    intent: "UNKNOWN",
    text: formatUnknownText()
  };

}