FROM ghcr.io/home-assistant/base:latest

RUN apk add --no-cache nodejs npm openssl nginx && mkdir -p /run/nginx

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

COPY ha-addon/nginx.conf /etc/nginx/http.d/house-plant-care.conf

RUN mkdir -p /data/uploads

RUN chmod +x /app/ha-addon/run.sh

CMD [ "/app/ha-addon/run.sh" ]