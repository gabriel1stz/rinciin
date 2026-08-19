import express from "express";
import cors from "cors";
import path from "path";

import modules from "./modules/index.js";

import { logger } from "./middleware/logger.middleware.js";
import { auditMiddleware } from "./middleware/audit.middleware.js";
import { notFound } from "./middleware/notfound.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { apiGeneralLimiter } from "./middleware/rate-limit.middleware.js";

const app = express();

// Trust reverse proxy (Nginx / Cloudflare) in production
app.set("trust proxy", 1);

app.use(cors());
app.use(express.json());

app.use(logger);
app.use(auditMiddleware);
app.use("/api", apiGeneralLimiter);


app.get("/", (req, res) => {
  res.json({
    success: true,
    name: "Rinci.in API",
    status: "running"
  });
});

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api", modules);

app.use(notFound);

app.use(errorHandler);

export default app;