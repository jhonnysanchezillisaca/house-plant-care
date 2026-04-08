# House Plant Care - Home Assistant Integration

This custom integration connects Home Assistant to your House Plant Care application.

## Installation

### Via HACS (recommended)
1. Add this repository as a custom repository in HACS
2. Search for "House Plant Care" and install it
3. Restart Home Assistant
4. Go to **Settings** → **Devices & Services** → **Add Integration**
5. Search for "House Plant Care" and follow the setup wizard

### Manual Installation
1. Copy the `custom_components/house_plant_care` folder to your Home Assistant's `custom_components` directory
2. Restart Home Assistant
3. Go to **Settings** → **Devices & Services** → **Add Integration**
4. Search for "House Plant Care" and follow the setup wizard

## Setup

You need:
- **URL**: The URL where your House Plant Care app is running (e.g., `http://homeassistant.local:3000` or the add-on URL)
- **API Token**: Create one in the app under **Settings** → **API Tokens**

## Entities

For each plant with a care schedule, the integration creates:

### Sensors
- **`{Plant} {Care Type} overdue`** — Days overdue for that care task (0 = not overdue)
- **`{Plant} {Care Type} last performed`** — Timestamp of the last care activity
- **`{Plant} {Care Type} next due`** — Calculated next due date

### Buttons
- **`Log {Care Type} for {Plant}`** — Press to log that you performed a care activity

## Services

### `house_plant_care.log_care`
Log a care activity from an automation.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `plant_id` | integer | Yes | ID of the plant |
| `care_type_id` | integer | Yes | ID of the care type |
| `notes` | string | No | Optional notes |

## Example Automations

### Send notification when any care is overdue
```yaml
automation:
  - alias: "Plant care overdue notification"
    trigger:
      - platform: state
        entity_id: sensor.monstera_water_overdue
        to: "1"
    action:
      - service: notify.mobile_app
        data:
          title: "Plant needs attention!"
          message: "Your Monstera is overdue for watering!"
```

### Morning plant care summary
```yaml
automation:
  - alias: "Morning plant care summary"
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
              {{ overdue | length }} plants need attention!
            {% else %}
              All plants are happy! 🌱
            {% endif %}
```