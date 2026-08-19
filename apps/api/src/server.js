import "dotenv/config";

import app from "./app.js";
import { env } from "./config/env.js";

app.listen(env.API_PORT, "0.0.0.0", () => {
  console.log(`
========================================
🚀 ${env.APP_NAME} API
Running : http://0.0.0.0:${env.API_PORT}
========================================
`);
});