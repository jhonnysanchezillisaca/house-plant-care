#!/usr/bin/with-contenv bashio

bashio::log.info "=== Plant Care Test Add-on Starting ==="

INGRESS_PATH="$(bashio::addon.ingress_entry)"

bashio::log.info "Ingress path: ${INGRESS_PATH}"

if [ -n "$INGRESS_PATH" ]; then
    export NUXT_APP_BASE_URL="${INGRESS_PATH}/"
fi

export HOST=127.0.0.1
export PORT=3000

bashio::log.info "NUXT_APP_BASE_URL: ${NUXT_APP_BASE_URL}"
bashio::log.info "Starting nginx on port 8099..."
nginx -g 'error_log stderr;' || bashio::log.error "nginx failed to start"

bashio::log.info "Starting Nuxt on port 3000..."
exec node /app/.output/server/index.mjs