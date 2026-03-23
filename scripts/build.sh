#!/bin/bash

#Fix for Vite 6 + Tailwind CSS build issue on Node 20.x
# This script applies a workaround for the import.meta error

echo "Building House Plant Care..."

# Check Node version
NODE_MAJOR=$(node -e "console.log(process.versions.node.split('.')[0])")

if [ "$NODE_MAJOR" -lt 22 ]; then
  echo ""
  echo "⚠️  Node.js version $(node -v) detected."
  echo "   Node.js 22+ is recommended for building."
  echo "   If build fails, please upgrade to Node 22 LTS:"
  echo ""
  echo "   Using nvm:"
  echo "     nvm install 22"
  echo "     nvm use 22"
  echo ""
  echo "   Or using NodeSource:"
  echo "     curl -fsSL https://deb.nodesource.com/setup_22.x | bash -"
  echo "     apt install -y nodejs"
  echo ""
  read -p "Continue anyway? [y/N] " -n 1 -r
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Clean previous builds
rm -rf .nuxt .output

# Run nuxt prepare
echo "Running nuxt prepare..."
npx nuxt prepare

# Build
echo "Running nuxt build..."
npm run build

echo ""
echo "✅ Build complete!"
echo "Start with: node .output/server/index.mjs"
echo "Or with PM2: pm2 start ecosystem.config.cjs"