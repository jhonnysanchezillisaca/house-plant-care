#!/usr/bin/with-contenv bashio

SESSION_PASSWORD="$(bashio::config 'session_password')"
TREFLE_API_TOKEN="$(bashio::config 'trefle_api_token')"

if [ -z "$SESSION_PASSWORD" ]; then
    SESSION_PASSWORD=$(openssl rand -hex 32)
fi

export NUXT_SESSION_PASSWORD="$SESSION_PASSWORD"
export TREFLE_API_TOKEN="$TREFLE_API_TOKEN"
export HA_ADDON=true
export DATA_DIR=/data
UPLOAD_PATH="$(bashio::config 'upload_path')"

# Log available storage mounts for debugging
if [ -d /media ]; then
    bashio::log.info "Available media mounts:"
    ls -la /media 2>/dev/null || true
fi
if [ -d /mnt ]; then
    bashio::log.info "Available mnt mounts:"
    ls -la /mnt 2>/dev/null || true
fi

if [ -n "$UPLOAD_PATH" ]; then
    # Try to create the directory if it doesn't exist
    if [ ! -d "$UPLOAD_PATH" ]; then
        bashio::log.info "Upload path '${UPLOAD_PATH}' does not exist, attempting to create it..."
        mkdir -p "$UPLOAD_PATH" 2>/dev/null || true
    fi

    if [ -d "$UPLOAD_PATH" ] && [ -w "$UPLOAD_PATH" ]; then
        export UPLOAD_DIR="$UPLOAD_PATH"
        bashio::log.info "Using custom upload path: ${UPLOAD_PATH}"
    else
        export UPLOAD_DIR=/data/uploads
        bashio::log.warning "Upload path '${UPLOAD_PATH}' not accessible, falling back to /data/uploads"
        bashio::log.warning "Check the logs above for available mounts under /media or /mnt"
    fi
else
    export UPLOAD_DIR=/data/uploads
fi

INGRESS_PATH="$(bashio::addon.ingress_entry)"

if [ -n "$INGRESS_PATH" ]; then
    export NUXT_APP_BASE_URL="${INGRESS_PATH}/"
fi

bashio::log.info "=== House Plant Care Add-on Starting ==="
bashio::log.info "Ingress path: ${INGRESS_PATH}"
bashio::log.info "NUXT_APP_BASE_URL: ${NUXT_APP_BASE_URL}"

bashio::log.info "Starting nginx on port 8099..."
nginx -g 'error_log stderr;' || bashio::log.error "nginx failed to start"

mkdir -p "$UPLOAD_DIR"

# Always recreate the symlink to ensure it points to the correct upload dir
rm -rf /app/public/uploads 2>/dev/null
ln -s "$UPLOAD_DIR" /app/public/uploads
bashio::log.info "Uploads symlink: /app/public/uploads -> $(readlink -f /app/public/uploads 2>/dev/null || readlink /app/public/uploads)"

bashio::log.info "Starting Nuxt server on port 3000..."
HOST=127.0.0.1
PORT=3000
export HOST PORT

exec node /app/.output/server/index.mjs