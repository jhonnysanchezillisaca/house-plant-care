#!/bin/bash

echo "🌿 House Plant Care - Logs"
echo "=========================="
echo ""

SHOW_LINES=${1:-50}

echo "Recent logs (last $SHOW_LINES lines):"
echo ""

if command -v pm2 &> /dev/null; then
  if pm2 list | grep -q "house-plant-care"; then
    pm2 logs house-plant-care --lines "$SHOW_LINES" --nostream
  else
    echo "PM2 process 'house-plant-care' not found."
    echo ""
    echo "Available PM2 processes:"
    pm2 list
  fi
elif systemctl is-active --quiet house-plant-care 2>/dev/null; then
  journalctl -u house-plant-care -n "$SHOW_LINES" --no-pager
else
  echo "No PM2 or systemd service found."
  echo ""
  echo "Check if the app is running:"
  echo "  ps aux | grep plant-care"
  echo "  ss -tlnp | grep 3000"
fi