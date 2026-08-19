import { getReport } from "../../report/report.service.js";
import { formatReport } from "../../formatter/report.formatter.js";

export async function reportHandler(body, user) {

  let period = "today";

  if (body.intent?.includes("MONTH")) {
    period = "month";
  }

  if (body.intent?.includes("WEEK")) {
    period = "week";
  }

  const report = await getReport(
    user.id,
    period
);

  return {

    intent: body.intent,

    report,

    text: formatReport(report)

  };

}