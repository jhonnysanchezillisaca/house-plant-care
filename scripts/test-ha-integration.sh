#!/bin/bash
set -e

echo "House Plant Care - Home Assistant Integration Test Setup"
echo "========================================================="
echo ""
echo "This script helps you set up the custom integration in"
echo "a running Home Assistant instance for testing."
echo ""

HA_CONFIG="${1:-/config}"

if [ ! -d "$HA_CONFIG" ]; then
  echo "HA config directory not found at: $HA_CONFIG"
  echo ""
  echo "Usage: $0 <ha_config_dir>"
  echo "  e.g., $0 /config          (for HA OS / supervised)"
  echo "  e.g., $0 ~/.homeassistant  (for HA Container)"
  echo ""
  echo "To spin up a test HA instance with Docker:"
  echo ""
  echo "  docker run -d \\"
  echo "    --name homeassistant-test \\"
  echo "    -v ~/.homeassistant:/config \\"
  echo "    -p 8123:8123 \\"
  echo "    homeassistant/home-assistant:stable"
  echo ""
  echo "  Then run: $0 ~/.homeassistant"
  exit 1
fi

CUSTOM_DIR="$HA_CONFIG/custom_components/house_plant_care"

echo "Installing custom integration to: $CUSTOM_DIR"
echo ""

mkdir -p "$CUSTOM_DIR"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SOURCE_DIR="$SCRIPT_DIR/../custom_components/house_plant_care"

cp "$SOURCE_DIR"/*.py "$CUSTOM_DIR/"
cp "$SOURCE_DIR"/*.json "$CUSTOM_DIR/"
cp "$SOURCE_DIR"/*.yaml "$CUSTOM_DIR/"

mkdir -p "$CUSTOM_DIR/translations"
cp "$SOURCE_DIR/translations/"*.json "$CUSTOM_DIR/translations/"

echo "Files installed:"
ls -la "$CUSTOM_DIR/"
echo ""
echo "Next steps:"
echo "  1. Restart Home Assistant"
echo "  2. Go to Settings → Devices & Services → Add Integration"
echo "  3. Search for 'House Plant Care'"
echo "  4. Enter your app URL (e.g., http://homeassistant.local:3000)"
echo "  5. Enter an API token from Settings → API Tokens"
echo ""
echo "After adding the integration, check:"
echo "  - Settings → Devices & Services → House Plant Care"
echo "  - Developer Tools → States (search for 'plant')"
echo "  - Developer Tools → Services (search for 'house_plant_care')"