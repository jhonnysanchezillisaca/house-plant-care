#!/bin/bash

echo "🌿 House Plant Care - Status"
echo "=============================="
echo ""

# Check Node version
echo "Node.js: $(node --version 2>/dev/null || echo 'Not found')"
echo "npm: $(npm --version 2>/dev/null || echo 'Not found')"
echo ""

# Check PM2 status
if command -v pm2 &> /dev/null; then
  echo "=== PM2 Status ==="
  pm2 list
  echo ""
  
  # Check if plant-care is running
  if pm2 list | grep -q "plant-care.*online"; then
    echo "✅ Application is running"
    echo ""
    echo "Status details:"
    pm2 show plant-care
  else
    echo "⚠️  Application is not running"
    echo ""
    echo "Start with: pm2 start ecosystem.config.cjs"
  fi
else
  echo "PM2 not found."
  
  # Check systemd
  if systemctl is-active --quiet plant-care 2>/dev/null; then
    echo "=== Systemd Status ==="
    systemctl status plant-care --no-pager
  else
    echo "Systemd service 'plant-care' not found."
  fi
fi

echo ""

# Check port
echo "=== Port 3000 ==="
if ss -tlnp 2>/dev/null | grep -q ":3000"; then
  ss -tlnp | grep ":3000"
  echo ""
  echo "✅ Port 3000 is in use"
else
  echo "Port 3000 is free"
fi

echo ""

# Check data directory
echo "=== Data Directory ==="
if [ -d "data" ]; then
  ls -la data/
  echo ""
  
  if [ -f "data/db.sqlite" ]; then
    echo "Database size: $(du -h data/db.sqlite | cut -f1)"
    
    # Count records if sqlite3 is available
    if command -v sqlite3 &> /dev/null; then
      USERS=$(sqlite3 data/db.sqlite "SELECT COUNT(*) FROM users" 2>/dev/null || echo "?")
      ROOMS=$(sqlite3 data/db.sqlite "SELECT COUNT(*) FROM rooms" 2>/dev/null || echo "?")
      PLANTS=$(sqlite3 data/db.sqlite "SELECT COUNT(*) FROM plants" 2>/dev/null || echo "?")
      echo "Users: $USERS, Rooms: $ROOMS, Plants: $PLANTS"
    fi
  else
    echo "No database file found"
  fi
else
  echo "Data directory not found"
fi

echo ""

# Check uploads
echo "=== Uploads ==="
if [ -d "public/uploads" ]; then
  UPLOAD_COUNT=$(find public/uploads -type f | wc -l)
  echo "Uploaded files: $UPLOAD_COUNT"
else
  echo "Uploads directory not found"
fi