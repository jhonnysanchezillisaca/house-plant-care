#!/bin/bash
set -e

echo "🌿 House Plant Care - Initial Setup"
echo "==================================="
echo ""

INSTALL_DIR="${1:-/opt/plant-care}"

# Check Node version
NODE_MAJOR=$(node -e "console.log(process.versions.node.split('.')[0])" 2>/dev/null || echo "0")

if [ "$NODE_MAJOR" -lt 22 ]; then
  echo "⚠️  Node.js 22+ is required (found: $(node -v 2>/dev/null || 'none'))"
  echo ""
  echo "Installing Node.js 22..."
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt install -y nodejs
  echo ""
fi

echo "Node version: $(node --version)"
echo "npm version: $(npm --version)"
echo ""

if [ -d "$INSTALL_DIR/.git" ]; then
  echo "Updating existing installation..."
  cd "$INSTALL_DIR"
  git pull
else
  echo "Enter the git repository URL:"
  read -r REPO_URL
  echo "Cloning repository..."
  git clone "$REPO_URL" "$INSTALL_DIR"
  cd "$INSTALL_DIR"
fi

echo ""
echo "Installing dependencies..."
npm ci

echo ""
echo "Building application..."
npm run build

echo ""
echo "Creating environment file..."
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo ""
  echo "⚠️  IMPORTANT: Edit .env and set NUXT_SESSION_PASSWORD"
  echo ""
  echo "Run: nano $INSTALL_DIR/.env"
fi

echo ""
echo "Creating data directories..."
mkdir -p data public/uploads

echo ""
echo "Installing PM2..."
npm install -g pm2

echo ""
echo "Starting application..."
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup

echo ""
echo "✅ Setup complete!"
echo ""
echo "The app is running at: http://localhost:3000"
echo ""
echo "Commands:"
echo "  pm2 status               - Check status"
echo "  pm2 logs house-plant-care - View logs"
echo "  pm2 restart house-plant-care - Restart"
echo ""
echo "To update:"
echo "  cd $INSTALL_DIR && git pull && npm ci && npm run build && pm2 restart house-plant-care"