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

## Home Assistant Integration

House Plant Care integrates with Home Assistant in two ways: as an **Add-on** for sidebar access, and as a **Custom Integration** for native sensors, buttons, and automations.

### Option A: Home Assistant Add-on (Sidebar Access)

The add-on runs House Plant Care inside Home Assistant with Ingress support (embedded in the HA sidebar, no separate login needed).

**Install locally (for testing):**

1. Copy the `ha-addon/` folder to your HA instance's `/addons/` directory (via Samba or SSH)
   ```bash
   scp -r ha-addon/ homeassistant:/addons/house_plant_care/
   ```
2. In HA, go to **Settings → Apps → App Store** (bottom right)
3. Click the three-dot menu → **Check for updates**
4. Find **House Plant Care** under "Local apps" and install it
5. Configure the add-on options (session password is auto-generated if left empty)
6. Start the add-on
7. Access via the **Plant Care** link in the HA sidebar

**Configure via add-on options:**

| Option | Required | Description |
|--------|----------|-------------|
| `session_password` | No | Auto-generated if empty. Set a custom password (min 32 chars) if you prefer. |
| `trefle_api_token` | No | Token from [trefle.io](https://trefle.io/) for plant species lookup |

### Option B: Custom Integration (Sensors, Buttons, Automations)

The custom integration creates native HA entities for your plants and exposes a `log_care` service for automations.

**Install:**

1. Copy `custom_components/house_plant_care/` to your HA config directory
   ```bash
   # For HA OS / Supervised:
   scp -r custom_components/house_plant_care/ homeassistant:/config/custom_components/

   # Or use the included script:
   ./scripts/test-ha-integration.sh /config
   ```
2. Restart Home Assistant
3. Go to **Settings → Devices & Services → Add Integration**
4. Search for **House Plant Care**
5. Enter your app URL and an API token

**Before adding the integration, create an API token:**

1. Open House Plant Care in your browser
2. Go to **Settings → API Tokens**
3. Click **Create Token**, give it a name (e.g., "Home Assistant"), and copy the token
4. You'll only see the full token once — save it somewhere secure

**Entities created per plant per care schedule:**

| Entity | Example | Description |
|--------|---------|-------------|
| Overdue sensor | `sensor.monstera_water_overdue` | Days overdue (0 = not overdue) |
| Last performed sensor | `sensor.monstera_water_last_performed` | Timestamp of last care activity |
| Next due sensor | `sensor.monstera_water_next_due` | Calculated next due date |
| Log button | `button.log_water_for_monstera` | Press to log that care was performed |

**Service exposed:**

```yaml
# Log care via automation
service: house_plant_care.log_care
data:
  plant_id: 1
  care_type_id: 1
  notes: "Watered with filtered water"
```

### Example Automations

**Notify when care is overdue:**

```yaml
automation:
  - alias: "Plant needs watering"
    trigger:
      - platform: numeric_state
        entity_id: sensor.monstera_water_overdue
        above: 0
    action:
      - service: notify.mobile_app
        data:
          title: "Plant Care Alert"
          message: "Your Monstera is {{ trigger.to_state.state }} days overdue for watering!"
```

**Morning plant care summary:**

```yaml
automation:
  - alias: "Morning plant summary"
    trigger:
      - platform: time
        at: "08:00:00"
    action:
      - service: notify.mobile_app
        data:
          title: "Plant Care Summary"
          message: >
            {% set overdue = states.sensor
              | selectattr('entity_id', 'search', '_overdue')
              | map(attribute='state')
              | map('int', 0)
              | select('>', 0)
              | list %}
            {% if overdue | length > 0 %}
              {{ overdue | length }} plant(s) need attention!
            {% else %}
              All plants are happy!
            {% endif %}
```

**Log care from HA dashboard:**

Add a button card to your Lovelace dashboard that calls the built-in `button.log_water_for_monstera` entity.

### Running Both Together (Recommended)

For the best experience, run **both** the Add-on and the Custom Integration:

- **Add-on** gives you the full web UI in the HA sidebar (Ingress)
- **Custom Integration** gives you native sensors, buttons, and automation triggers

When using both, point the integration URL to the add-on:

| Integration Setting | Value |
|---------------------|-------|
| URL | `http://a0d7b954-house-plant-care:3000` (HA internal add-on URL) or `http://localhost:3000` |
| API Token | Token created in Settings → API Tokens |

### Testing the API Token Auth

```bash
# Start the app
npx nuxi dev

# Create a token in the browser (Settings → API Tokens), then:
./scripts/test-api-token.sh http://localhost:3000 hpc_YOUR_TOKEN_HERE
```

## Care Types

💧 Water | 🧪 Fertilize | 🌫️ Mist | ✂️ Prune | 🪴 Repot | 👁️ Check | 🔄 Rotate | ✨ Clean Leaves | 🌱 Propagate

## License

MIT