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
export UPLOAD_DIR=/data/uploads
export HOST=0.0.0.0
export PORT=3000

INGRESS_PATH="$(bashio::addon.ingress_entry)"

bashio::log.info "=== House Plant Care Add-on Starting ==="
bashio::log.info "Ingress path: ${INGRESS_PATH}"

if [ -n "$INGRESS_PATH" ]; then
    export NUXT_APP_BASE_URL="${INGRESS_PATH}/"
    bashio::log.info "NUXT_APP_BASE_URL: ${NUXT_APP_BASE_URL}"
else
    bashio::log.warning "No ingress path found, running without Ingress support"
fi

mkdir -p /data/uploads

if [ ! -L /app/public/uploads ]; then
    rm -rf /app/public/uploads 2>/dev/null
    ln -s /data/uploads /app/public/uploads
fi

bashio::log.info "Starting Nuxt server on port 3000..."
exec node /app/.output/server/index.mjs