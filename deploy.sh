#!/bin/bash
# ==============================================================================
# Rinci.in - One-Click Production Deployment Script for Ubuntu VPS
# ==============================================================================

set -e

echo "🚀 [1/5] Memulai proses deployment Rinci.in..."

# 1. Install Dependencies
echo "📦 [2/5] Menginstall dependensi seluruh monorepo..."
npm install
cd apps/api && npm install && cd ../..
cd apps/bot && npm install && cd ../..
cd apps/web && npm install && cd ../..

# 2. Database Migration & Prisma Client
echo "🗄️ [3/5] Generate Prisma Client & Run Migrations..."
cd apps/api
npx prisma generate
npx prisma db push
cd ../..

# 3. Build Web Frontend (Vite)
echo "⚡ [4/5] Membangun bundle frontend produksi..."
cd apps/web
npm run build
cd ../..

# 4. Start / Reload with PM2
echo "🤖 [5/5] Menjalankan service dengan PM2..."
mkdir -p logs
npx pm2 startOrReload ecosystem.config.cjs --env production
npx pm2 save

echo "=============================================================================="
echo "✅ DEPLOYMENT BERHASIL!"
echo "Status Service:"
npx pm2 status
echo "=============================================================================="
