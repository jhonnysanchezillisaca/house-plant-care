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

mkdir -p /data/uploads

if [ ! -L /app/public/uploads ]; then
    rm -rf /app/public/uploads 2>/dev/null
    ln -s /data/uploads /app/public/uploads
fi

exec node /app/.output/server/index.mjs