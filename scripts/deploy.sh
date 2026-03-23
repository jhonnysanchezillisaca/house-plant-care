#!/bin/bash
set -e

echo "🌿 House Plant Care - Deploy"
echo "============================"

INSTALL_DIR="/opt/plant-care"
cd "$INSTALL_DIR"

echo "Pulling latest code..."
git pull

echo "Installing dependencies..."
npm ci

echo "Building..."
npm run build

echo "Installing native module in output directory..."
cd .output/server
npm init -y > /dev/null 2>&1
npm install better-sqlite3
cd ../..

echo "Restarting service..."
pm2 restart plant-care 2>/dev/null || systemctl restart plant-care 2>/dev/null || true

echo "✅ Deploy complete!"