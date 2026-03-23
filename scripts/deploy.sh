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

echo "Restarting service..."
pm2 restart plant-care 2>/dev/null || systemctl restart plant-care 2>/dev/null || true

echo "✅ Deploy complete!"