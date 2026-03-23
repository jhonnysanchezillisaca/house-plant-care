#!/bin/bash
set -e

echo "🌿 House Plant Care - Deploy"
echo "============================"

INSTALL_DIR="/opt/plant-care"
cd "$INSTALL_DIR"

echo "Pulling latest code..."
git pull

echo "Cleaning old build..."
rm -rf .output .nuxt

echo "Installing dependencies..."
npm ci

echo "Building..."
npm run build

echo "Verifying build..."
if [ ! -d ".output/server" ]; then
  echo "❌ Build failed: .output/server not found"
  exit 1
fi

echo "Installing native module in output directory..."
cd .output/server
npm init -y > /dev/null 2>&1
npm install better-sqlite3
cd ../..

echo "Restarting service..."
pm2 restart plant-care 2>/dev/null || systemctl restart plant-care 2>/dev/null || true

echo "✅ Deploy complete!"