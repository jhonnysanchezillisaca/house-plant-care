# Home Assistant Integration

House Plant Care integrates with Home Assistant in two complementary ways:

1. **Add-on** — runs the web app inside Home Assistant with sidebar access (Ingress)
2. **Custom Integration** — creates native HA entities (sensors, buttons) and a service for automations

For the best experience, install **both**.

## Architecture

```
┌─────────────────┐     push      ┌──────────────────────────────┐
│   GitHub Actions │ ──────────►  │  GitHub Container Registry    │
│   (CI/CD)        │               │  ghcr.io                      │
└─────────────────┘               └──────────────┬───────────────┘
                                                  │ pull
                                                  ▼
                                        ┌─────────────────────┐
                                        │  Home Assistant OS    │
                                        │  Supervisor pulls     │
                                        │  the add-on image     │
                                        └─────────────────────┘
```

- The add-on image is built from `ha-addon/Dockerfile` and pushed to GitHub Container Registry (`ghcr.io`)
- HA Supervisor pulls the image when installing or updating the add-on
- The custom integration communicates with the app via its REST API

## Option A: Home Assistant Add-on

The add-on runs House Plant Care inside Home Assistant with Ingress support — the app appears in the HA sidebar with no separate login required.

### One-time Setup: Add-on Repository

You need a separate GitHub repository that HA uses to discover add-ons. Create a repo called `jhonnysanchezillisaca/ha-addon-repo` with this structure:

```
ha-addon-repo/
  repository.json
  house_plant_care/
    config.yaml
    DOCS.md
    translations/
      en.yaml
```

**`repository.json`:**

```json
[
  {
    "name": "House Plant Care",
    "slug": "house_plant_care",
    "description": "Track and manage your house plant care schedules with alerts and overdue notifications",
    "url": "https://github.com/jhonnysanchezillisaca/ha-addon-repo",
    "image": "ghcr.io/jhonnysanchezillisaca/house-plant-care-{arch}"
  }
]
```

The CI pipeline (`.github/workflows/build.yml`) auto-syncs the add-on config files from this repo to `ha-addon-repo` on every push to `main`, so you only need to set up the repo structure once manually.

### Install via HA Add-on Store

1. In HA, go to **Settings → Add-ons → Add-on Store**
2. Click the three-dot menu (top right) → **Repositories**
3. Add: `https://github.com/jhonnysanchezillisaca/ha-addon-repo`
4. Find **House Plant Care** under the repository → click **Install**
5. Configure add-on options:
   - **Session password** — leave empty to auto-generate, or set your own (min 32 characters)
   - **Trefle API token** — optional, for plant species lookup from [trefle.io](https://trefle.io/)
6. Click **Start**
7. Access via **Plant Care** in the HA sidebar

### Build and Push from Your Local Machine

Use the build script for manual builds:

```bash
# Build and push the latest image
./scripts/build-addon.sh

# Build only, don't push
./scripts/build-addon.sh --no-push

# Build and push with a specific tag
./scripts/build-addon.sh --tag v1.2.0

# Use a different registry
./scripts/build-addon.sh --registry my-registry.local/plant-care

# Show help
./scripts/build-addon.sh --help
```

After pushing, update the add-on in HA:
1. **Settings → Add-ons → House Plant Care** → click **Update** (if available)
2. Or **Settings → Add-ons → Add-on Store** → three-dot menu → **Check for updates**

### CI/CD Pipeline

The `.github/workflows/build.yml` pipeline runs automatically on every push to `main`:

1. Builds the Docker image using `ha-addon/Dockerfile`
2. Extracts metadata for tags (latest for main, versioned for tags)
3. Pushes to `ghcr.io/jhonnysanchezillisaca/house-plant-care`
4. Auto-syncs add-on config files (`config.yaml`, `DOCS.md`, `translations/`) to the `ha-addon-repo`

**Required secret:** `ADDON_REPO_PAT` — a GitHub Personal Access Token with `repo` scope, added as a repository secret in Settings → Secrets and variables → Actions.

## Option B: Custom Integration

The custom integration creates native HA entities for your plants and exposes a `log_care` service for automations. This works independently of the add-on — you can use it with a standalone deployment too.

### Before Adding the Integration

Create an API token in House Plant Care:

1. Open House Plant Care in your browser
2. Go to **Settings → API Tokens**
3. Click **Create Token**, give it a name (e.g., "Home Assistant")
4. Copy the token — you'll only see it once

### Install

1. Copy `custom_components/house_plant_care/` to your HA config directory:
   ```bash
   # For HA OS / Supervised:
   scp -r custom_components/house_plant_care/ homeassistant:/config/custom_components/

   # Or use the included script:
   ./scripts/test-ha-integration.sh /config
   ```
2. Restart Home Assistant
3. Go to **Settings → Devices & Services → Add Integration**
4. Search for **House Plant Care**
5. Enter your app URL and API token:
   - If using the add-on: `http://a0d7b954-house-plant-care:3000` (HA internal add-on URL) or `http://localhost:3000`
   - If using standalone: `http://<IP_or_hostname>:3000`

### Entities Created

For each plant with a care schedule, the integration creates:

| Entity | Example | Description |
|--------|---------|-------------|
| Overdue sensor | `sensor.monstera_water_overdue` | Days overdue (0 = not overdue) |
| Last performed sensor | `sensor.monstera_water_last_performed` | Timestamp of last care activity |
| Next due sensor | `sensor.monstera_water_next_due` | Calculated next due date |
| Log button | `button.log_water_for_monstera` | Press to log that care was performed |

### Service

```yaml
service: house_plant_care.log_care
data:
  plant_id: 1
  care_type_id: 1
  notes: "Watered with filtered water"
```

### Data Coordinator

The integration polls the House Plant Care API every 5 minutes (configurable in `custom_components/house_plant_care/const.py` → `DEFAULT_SCAN_INTERVAL`) to refresh sensor data.

## Running Both Together (Recommended)

For the best experience, run both the add-on and the custom integration:

- **Add-on** — full web UI in the HA sidebar via Ingress
- **Custom Integration** — native sensors, buttons, and automation triggers

When using both, point the integration URL to the add-on:

| Integration Setting | Value |
|---------------------|-------|
| URL | `http://a0d7b954-house-plant-care:3000` (HA internal add-on URL) or `http://localhost:3000` |
| API Token | Token created in Settings → API Tokens |

## Example Automations

### Notify when care is overdue

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

### Morning plant care summary

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

### Log care from HA dashboard button

Add a button card to your Lovelace dashboard that calls the built-in `button.log_water_for_monstera` entity.

## Troubleshooting

### Integration won't connect

- Verify the app is running and accessible at the configured URL
- Check the API token is correct (create a new one in Settings → API Tokens)
- If using the add-on, use the internal URL `http://a0d7b954-house-plant-care:3000`

### Integration shows stale data

The coordinator polls every 5 minutes. To force a refresh:
1. Go to **Settings → Devices & Services → House Plant Care**
2. Click the three-dot menu → **Reload**

### Testing the API token

```bash
# Start the app
npx nuxi dev

# Create a token in the browser (Settings → API Tokens), then:
./scripts/test-api-token.sh http://localhost:3000 hpc_YOUR_TOKEN_HERE
```