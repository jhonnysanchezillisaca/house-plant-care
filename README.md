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

## Deployment Options

### Option 1: Proxmox LXC with Node.js (Most Efficient)

**Resource usage:** ~50-100MB RAM

```bash
# In your LXC container (Ubuntu 22.04 or Debian 12)
apt update && apt install -y nodejs npm git

# Clone and setup
git clone <repository-url> /opt/plant-care
cd /opt/plant-care
npm ci --production
npm run build

# Create environment file
cp .env.example .env
nano .env  # Set NUXT_SESSION_PASSWORD

# Create directories
mkdir -p data public/uploads

# Install PM2
npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

**Using systemd service instead:**
```bash
cp plant-care.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable plant-care
systemctl start plant-care
```

### Option 2: Docker Compose

**Resource usage:** ~200-400MB RAM (includes Docker overhead)

```bash
docker-compose up -d
```

### Option 3: Manual Build

```bash
npm install
npm run build
NODE_ENV=production NUXT_SESSION_PASSWORD=your-secret node .output/server/index.mjs
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NUXT_SESSION_PASSWORD` | Yes | Session encryption key (min 32 chars) |
| `TREFLE_API_TOKEN` | No | [Trefle API](https://trefle.io) token for species lookup |
| `NUXT_HOST` | No | Server host (default: 0.0.0.0) |
| `NUXT_PORT` | No | Server port (default: 3000) |

## Reverse Proxy Setup

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
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Development

```bash
npm install
npm run dev
```

## Data Storage

- **SQLite database**: `./data/db.sqlite`
- **Uploaded photos**: `./public/uploads/`

**Backup these directories regularly!**

## License

MIT