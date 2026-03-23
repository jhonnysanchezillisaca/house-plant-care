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

- Node.js 20.19+ or Node.js 22 LTS
- npm 9+

## Quick Start

### Initial Setup (Proxmox LXC / Linux Server)

```bash
# Download and run setup script
curl -fsSL https://raw.githubusercontent.com/YOUR_REPO/main/scripts/setup.sh | bash

# Or manually:
git clone https://github.com/YOUR_REPO.git /opt/plant-care
cd /opt/plant-care
./scripts/setup.sh
```

The setup script will:
1. Install Node.js 22 LTS
2. Clone the repository
3. Create `.env` file (you need to edit it!)
4. Build the application
5. Start with PM2

### Configure Environment

```bash
nano /opt/plant-care/.env
```

Set required variables:
```env
NUXT_SESSION_PASSWORD=your-secure-random-string-min-32-characters
TREFLE_API_TOKEN=your-trefle-token  # Optional
```

### Deploy Updates

```bash
cd /opt/plant-care
git pull
npm run deploy
pm2 restart plant-care
```

That's it! Just `git pull` + `npm run deploy` + restart.

## Deployment Options

### Option 1: Proxmox LXC (Recommended - 50-100MB RAM)

```bash
# One-time setup
./scripts/setup.sh

# Updates
git pull && npm run deploy && pm2 restart plant-care
```

### Option 2: Docker Compose (200-400MB RAM)

```bash
docker-compose up -d
```

### Option 3: Manual

```bash
npm install --production --ignore-scripts
npm install esbuild --save-dev
npm run build
npm prune --production
node .output/server/index.mjs
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NUXT_SESSION_PASSWORD` | Yes | Session encryption key (min 32 chars) |
| `TREFLE_API_TOKEN` | No | [Trefle API](https://trefle.io) token for species lookup |

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

## Development

```bash
npm install
npm run dev
```

## Data Backup

Backup these directories regularly:
- `data/` - SQLite database
- `public/uploads/` - Uploaded photos

## Care Types

💧 Water | 🧪 Fertilize | 🌫️ Mist | ✂️ Prune | 🪴 Repot | 👁️ Check | 🔄 Rotate | ✨ Clean Leaves | 🌱 Propagate

## License

MIT