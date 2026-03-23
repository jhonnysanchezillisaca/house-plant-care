#!/bin/bash
set -e

echo "🌿 House Plant Care - Deploy"
echo "============================"

INSTALL_DIR="/opt/plant-care"

cd $INSTALL_DIR

echo "Pulling latest code..."
git pull origin main

echo "Cleaning previous build..."
rm -rf node_modules package-lock.json

echo "Installing dependencies..."
npm install --production --ignore-scripts

echo "Installing build dependencies..."
npm install esbuild

echo "Building..."
npm run build

echo "Removing build dependencies..."
npm prune --production

echo "Restarting service..."
systemctl restart plant-care || pm2 restart plant-care || true

echo "✅ Deploy complete!"