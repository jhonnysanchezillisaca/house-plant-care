# Home Assistant Integration

House Plant Care integrates with Home Assistant in two complementary ways:

1. **Add-on** — runs the web app inside Home Assistant with sidebar access (Ingress)
2. **Custom Integration** — creates native HA entities (sensors, buttons) and a service for automations

For the best experience, install **both**.

## Architecture

```
┌─────────────────┐     push      ┌──────────────────────────────┐
│   Your dev machine │ ──────────► │  Gitea Container Registry    │
│   or act_runner    │             │  gitea.home.arpa              │
└─────────────────┘               └──────────────┬───────────────┘
                                                  │ pull
                                                  ▼
                                        ┌─────────────────────┐
                                        │  Home Assistant OS    │
                                        │  Supervisor pulls     │
                                        │  the add-on image     │
                                        └─────────────────────┘
```

- The add-on image is built from `ha-addon/Dockerfile` and pushed to Gitea's container registry
- HA Supervisor pulls the image when installing or updating the add-on
- The custom integration communicates with the app via its REST API

## Prerequisites

### Gitea Container Registry

Your Gitea instance at `gitea.home.arpa` must have the container registry enabled (it is by default in Gitea 1.17+).

### Self-signed Certificate Trust

Your Gitea instance is behind a Caddy reverse proxy using `tls internal` (self-signed certificate). Docker and Home Assistant need to trust this certificate.

**Extract Caddy's root CA certificate** (on the machine running Caddy):

```bash
# Caddy stores its internal CA here:
cat ~/.local/share/caddy/pki/roots/default/root.crt
```

Copy this certificate to:

**Docker (for building/pushing images)** — on any machine that runs `docker push`:

```bash
# Linux:
sudo mkdir -p /etc/docker/certs.d/gitea.home.arpa
sudo cp root.crt /etc/docker/certs.d/gitea.home.arpa/ca.crt
sudo systemctl restart docker

# macOS:
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain root.crt
# Then restart Docker Desktop
```

**Home Assistant OS** — for pulling add-on images:

```bash
# Via HA SSH add-on:
mkdir -p /usr/local/share/ca-certificates
cp root.crt /usr/local/share/ca-certificates/caddy-root.crt
update-ca-certificates
# Then restart HA
```

### Gitea Access Token

Create a Personal Access Token in Gitea with these scopes:

- **package:write** — push container images to the registry, clean up old versions
- **repository:write** — auto-sync add-on config to `ha-addon-repo`

Go to Gitea → Settings → Applications → Generate Token, then add it as a repository secret:

1. Go to the `house-plant-care` repo → Settings → Actions → Secrets
2. Add a secret named `GITEA_TOKEN` with the token value

### Gitea Actions Runner (for CI/CD)

If you want automatic builds on push to `main`, you need an `act_runner` registered with your Gitea instance. See [Gitea's Act Runner docs](https://docs.gitea.com/usage/actions/act-runner) for setup.

## Option A: Home Assistant Add-on

The add-on runs House Plant Care inside Home Assistant with Ingress support — the app appears in the HA sidebar with no separate login required.

### One-time Setup: Add-on Repository

HA needs a separate Git repository to discover add-ons. Create a repo on Gitea called `jhonny/ha-addon-repo` with this structure:

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
    "url": "https://gitea.home.arpa/jhonny/ha-addon-repo",
    "image": "gitea.home.arpa/jhonny/house-plant-care-{arch}"
  }
]
```

The CI pipeline (`.gitea/workflows/build.yml`) auto-syncs the add-on config files from this repo to `ha-addon-repo` on every push to `main`, so you only need to set up the repo structure once manually.

### Install via HA Add-on Store

1. Make sure the Caddy CA cert is trusted by HA (see [Self-signed Certificate Trust](#self-signed-certificate-trust))
2. In HA, go to **Settings → Add-ons → Add-on Store**
3. Click the three-dot menu (top right) → **Repositories**
4. Add: `https://gitea.home.arpa/jhonny/ha-addon-repo`
5. Find **House Plant Care** under the repository → click **Install**
6. Configure add-on options:
   - **Session password** — leave empty to auto-generate, or set your own (min 32 characters)
   - **Trefle API token** — optional, for plant species lookup from [trefle.io](https://trefle.io/)
7. Click **Start**
8. Access via **Plant Care** in the HA sidebar

### Build and Push from Your Local Machine

Use the build script for manual builds:

```bash
# Build and push the latest image
./scripts/build-addon.sh

# Build only, don't push
./scripts/build-addon.sh --no-push

# Build, push, and clean up old package versions
./scripts/build-addon.sh --cleanup --token YOUR_GITEA_TOKEN

# Build with a specific tag
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

The `.gitea/workflows/build.yml` pipeline runs automatically on every push to `main`:

1. Builds the Docker image using `ha-addon/Dockerfile` with the full project as context
2. Tags it as `latest` only — no versioned tags
3. Pushes to `gitea.home.arpa/jhonny/house-plant-care:latest`
4. Deletes all previous package versions from Gitea (keeps only the latest)
5. Auto-syncs add-on config files (`config.yaml`, `DOCS.md`, `translations/`) to the `ha-addon-repo`

**Required secret:** `GITEA_TOKEN` (see [Gitea Access Token](#gitea-access-token))

**Required runner label:** The pipeline uses `runs-on: ubuntu-latest` — adjust this to match your act_runner's label if different.

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

### Docker push fails with TLS error

```
error: failed to solve: failed to push xxx: tls: failed to verify certificate
```

The Caddy self-signed certificate isn't trusted by Docker. See [Self-signed Certificate Trust](#self-signed-certificate-trust) for adding the CA cert.

### HA can't pull the add-on image

If HA shows an error installing the add-on (certificate verification failure), the Caddy CA cert hasn't been added to HA's trust store. See [Self-signed Certificate Trust](#self-signed-certificate-trust).

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