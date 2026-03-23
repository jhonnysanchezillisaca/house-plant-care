# 🌱 House Plant Care

A self-hosted application to manage the care of your house plants.

## Features

- **Multi-user authentication** - Family members can each have their own account
- **Shared data** - All users see the same rooms and plants (ideal for households)
- **Rooms** - Organize plants by location in your home
- **Plant profiles** - Track name, species, photos, and notes
- **Species lookup** - Search Trefle API for plant info and images
- **Care schedules** - Set watering, fertilizing, misting, and more
- **Activity logging** - Track who did what and when
- **Overdue alerts** - Dashboard shows plants needing attention
- **Mobile-friendly** - Responsive design works on all devices

## Requirements

- **Node.js 22+** (required - Vite 6 needs Node ≥22)
- **npm 10+**

## Quick Start

### Proxmox LXC / Linux Server

```bash
# Download and run setup script
curl -fsSL https://raw.githubusercontent.com/YOUR_REPO/main/scripts/setup.sh | bash

# Or manually:
git clone https://github.com/YOUR_REPO.git /opt/plant-care
cd /opt/plant-care
./scripts/setup.sh
```

### Configure Environment

```bash
nano /opt/plant-care/.env
```

Set:
```env
NUXT_SESSION_PASSWORD=your-secure-random-string-min-32-characters
TREFLE_API_TOKEN=your-trefle-token  # Optional
```

### Deploy Updates

```bash
cd /opt/plant-care
git pull
npm ci
npm run build
pm2 restart plant-care
```

Or use the deploy script:
```bash
./scripts/deploy.sh
```

## Management

### Check Status

```bash
pm2 status
```

### View Logs

```bash
# Real-time logs (follow mode)
pm2 logs plant-care

# Last 100 lines
pm2 logs plant-care --lines 100

# Only errors
pm2 logs plant-care --err

# Flush logs
pm2 flush plant-care
```

### Restart/Stop

```bash
pm2 restart plant-care
pm2 stop plant-care
pm2 start plant-care
```

### Using systemd (if installed)

```bash
systemctl status plant-care
systemctl restart plant-care
journalctl -u plant-care -f       # Follow logs
journalctl -u plant-care --since yesterday
```

### Application Logs Location

PM2 stores logs in:
```
~/.pm2/logs/plant-care-out.log    # Standard output
~/.pm2/logs/plant-care-error.log  # Errors
```

## Development

```bash
# Requires Node.js 22+
npm install
npm run dev
```

## Manual Installation

```bash
# 1. Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# 2. Install and build
npm ci
npm run build

# 3. Create environment
cp .env.example .env
# Edit .env and set NUXT_SESSION_PASSWORD

# 4. Run
node .output/server/index.mjs
```

## Docker (Alternative)

```bash
docker-compose up -d

# View logs
docker-compose logs -f plant-care
```

## Reverse Proxy

### Caddy (Recommended)
```bash
apt install caddy
cat > /etc/caddy/Caddyfile << EOF
your-domain.com {
    reverse_proxy localhost:3000
}
EOF
systemctl restart caddy
```

### Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```

## Troubleshooting

### App won't start

```bash
# Check if port 3000 is in use
ss -tlnp | grep 3000

# Check PM2 logs
pm2 logs plant-care

# Check if database exists
ls -la /opt/plant-care/data/
```

### Database errors

```bash
# Database is stored in
/opt/plant-care/data/db.sqlite

# Backup before any repair
cp /opt/plant-care/data/db.sqlite /opt/plant-care/data/db.sqlite.backup
```

### Reset application

```bash
cd /opt/plant-care
pm2 stop plant-care
rm -rf node_modules package-lock.json
npm ci
npm run build
pm2 start plant-care
```

## Data Backup

Backup these directories:
- `data/` - SQLite database
- `public/uploads/` - Uploaded photos

```bash
# Quick backup
tar -czf plant-care-backup.tar.gz data/ public/uploads/
```

## Care Types

💧 Water | 🧪 Fertilize | 🌫️ Mist | ✂️ Prune | 🪴 Repot | 👁️ Check | 🔄 Rotate | ✨ Clean Leaves | 🌱 Propagate

## License

MIT