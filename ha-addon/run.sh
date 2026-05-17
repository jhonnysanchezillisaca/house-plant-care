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
export HOST=127.0.0.1
export PORT=3001

INGRESS_PATH="$(bashio::addon.ingress_entry)"

bashio::log.info "=== House Plant Care Add-on Starting ==="
bashio::log.info "Ingress path: ${INGRESS_PATH}"

if [ -n "$INGRESS_PATH" ]; then
    export NUXT_APP_BASE_URL="${INGRESS_PATH}/"
    bashio::log.info "NUXT_APP_BASE_URL set to: ${NUXT_APP_BASE_URL}"

    cat > /etc/nginx/http.d/ingress.conf <<EOF
server {
    listen 3000;

    location ${INGRESS_PATH}/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host \$http_host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$http_host;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location / {
        return 302 ${INGRESS_PATH}/;
    }
}
EOF
else
    bashio::log.warning "No ingress path found, running without Ingress"

    cat > /etc/nginx/http.d/ingress.conf <<EOF
server {
    listen 3000;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host \$http_host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF
fi

bashio::log.info "Writing nginx config..."
cat /etc/nginx/http.d/ingress.conf

bashio::log.info "Starting nginx..."
nginx -g 'error_log stderr;' || bashio::log.error "nginx failed to start"

mkdir -p /data/uploads

if [ ! -L /app/public/uploads ]; then
    rm -rf /app/public/uploads 2>/dev/null
    ln -s /data/uploads /app/public/uploads
fi

bashio::log.info "Starting Nuxt server on port 3001..."
exec node /app/.output/server/index.mjs