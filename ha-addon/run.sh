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

INGRESS_PATH="$(bashio::addon.ingress_entry)"

if [ -n "$INGRESS_PATH" ]; then
    export NUXT_APP_BASE_URL="${INGRESS_PATH}/"
fi

bashio::log.info "=== House Plant Care Add-on Starting ==="
bashio::log.info "Ingress path: ${INGRESS_PATH}"
bashio::log.info "NUXT_APP_BASE_URL: ${NUXT_APP_BASE_URL}"

bashio::log.info "Starting nginx on port 8099..."
nginx -g 'error_log stderr;' || bashio::log.error "nginx failed to start"

mkdir -p /data/uploads

if [ ! -L /app/public/uploads ]; then
    rm -rf /app/public/uploads 2>/dev/null
    ln -s /data/uploads /app/public/uploads
fi

bashio::log.info "Starting Nuxt server on port 3000..."
HOST=127.0.0.1
PORT=3000
export HOST PORT

exec node /app/.output/server/index.mjs