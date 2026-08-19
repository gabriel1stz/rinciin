// ecosystem.config.cjs - PM2 Production Process Manager for Rinci.in
module.exports = {
  apps: [
    {
      name: "rinci-api",
      script: "apps/api/src/server.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "./logs/api-error.log",
      out_file: "./logs/api-out.log",
      time: true,
    },
    {
      name: "rinci-bot",
      script: "apps/bot/src/index.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        API_URL: "http://localhost:3000/api",
      },
      error_file: "./logs/bot-error.log",
      out_file: "./logs/bot-out.log",
      time: true,
    },
  ],
};
