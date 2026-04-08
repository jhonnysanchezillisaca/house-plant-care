# House Plant Care - Home Assistant Add-on

Track and manage your house plant care schedules with alerts and overdue notifications.

## Installation

1. Copy the `ha-addon` folder to your Home Assistant `/addons/` directory (via Samba or SSH)
2. In Home Assistant, go to **Settings** → **Apps** → **App Store** (bottom right)
3. Click the three-dot menu → **Check for updates**
4. Find **House Plant Care** under "Local apps" and install it
5. Configure the add-on options (session password, Trefle token)
6. Start the add-on
7. Access via the sidebar under **Plant Care**

## Configuration

| Option | Required | Description |
|--------|----------|-------------|
| `session_password` | No | Encryption password for browser sessions (auto-generated if empty) |
| `trefle_api_token` | No | Trefle API token for plant species lookup |

## Features

- **Ingress UI**: Access the app directly from the Home Assistant sidebar
- **Plant management**: Add plants with photos, species lookup, room assignment
- **Care schedules**: Set up recurring watering, fertilizing, misting, etc.
- **Overdue alerts**: Dashboard highlights overdue care tasks
- **Activity logging**: Track when care was performed

## Home Assistant Integration

For deeper integration (sensors, automations, notifications), install the 
`custom_components/house_plant_care` custom integration and create an API token
in the app's Settings page.