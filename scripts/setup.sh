#!/bin/bash
set -e

echo "🌿 House Plant Care - Initial Setup"
echo "==================================="
echo ""

if [ "$EUID" -eq 0 ]; then
  echo "Running as root is fine for setup."
fi

INSTALL_DIR="${1:-/opt/plant-care}"

echo "This will install House Plant Care to: $INSTALL_DIR"
echo ""
read -p "Continue? [y/N] " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 1
fi

echo ""
echo "Installing Node.js 22..."
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

echo "Checking Node version..."
node --version
npm --version

echo ""
echo "Creating application directory..."
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

echo ""
echo "Cloning repository..."
if [ -d ".git" ]; then
  echo "Already a git repository, pulling latest..."
  git pull
else
  echo "Enter the git repository URL:"
  read -r REPO_URL
  git clone "$REPO_URL" .
fi

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
echo "Building application (this may take a few minutes)..."
npm install --production --ignore-scripts
npm install esbuild --save-dev
npm run build

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
echo "Next steps:"
echo "1. Edit .env: nano $INSTALL_DIR/.env"
echo "2. Restart: pm2 restart plant-care"
echo "3. Set up reverse proxy (Caddy/Nginx)"
echo ""
echo "To update in the future:"
echo "  cd $INSTALL_DIR && git pull && npm run deploy && pm2 restart plant-care"