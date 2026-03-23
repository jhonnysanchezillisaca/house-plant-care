#!/bin/bash
set -e

echo "🌱 House Plant Care - LXC Installation Script"
echo "============================================="

if [ "$EUID" -ne 0 ]; then 
  echo "Please run as root"
  exit 1
fi

INSTALL_DIR="/opt/plant-care"
SERVICE_USER="www-data"

echo "Installing dependencies..."
apt update && apt install -y nodejs npm

echo "Creating directories..."
mkdir -p $INSTALL_DIR/data $INSTALL_DIR/public/uploads

echo "Copying application..."
cd $INSTALL_DIR

if [ -f "package.json" ]; then
  echo "Installing npm packages..."
  npm ci --production
  echo "Building application..."
  npm run build
fi

echo "Setting permissions..."
chown -R $SERVICE_USER:$SERVICE_USER $INSTALL_DIR

echo "Installing PM2..."
npm install -g pm2

echo "Creating systemd service..."
cat > /etc/systemd/system/plant-care.service << EOF
[Unit]
Description=House Plant Care
After=network.target

[Service]
Type=simple
User=$SERVICE_USER
WorkingDirectory=$INSTALL_DIR
Environment="NODE_ENV=production"
Environment="NUXT_HOST=0.0.0.0"
Environment="NUXT_PORT=3000"
EnvironmentFile=$INSTALL_DIR/.env
ExecStart=/usr/bin/node .output/server/index.mjs
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

echo "Reloading systemd..."
systemctl daemon-reload

echo ""
echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Create .env file:"
echo "   nano $INSTALL_DIR/.env"
echo ""
echo "   Add these lines:"
echo "   NUXT_SESSION_PASSWORD=your-secure-random-string-min-32-characters"
echo "   TREFLE_API_TOKEN=your-trefle-token (optional)"
echo ""
echo "2. Start the service:"
echo "   systemctl enable plant-care"
echo "   systemctl start plant-care"
echo ""
echo "3. Check status:"
echo "   systemctl status plant-care"
echo ""
echo "4. Access at: http://localhost:3000"