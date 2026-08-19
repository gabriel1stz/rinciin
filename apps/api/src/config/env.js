import "dotenv/config";

export const env = {
  APP_NAME: process.env.APP_NAME || "Rinci.in",
  API_PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL,
  
  PAKASIR_SLUG: process.env.PAKASIR_SLUG,
  PAKASIR_API_KEY: process.env.PAKASIR_API_KEY,
  PAKASIR_BASE_URL: process.env.PAKASIR_BASE_URL || "https://app.pakasir.com",
};