FROM ghcr.io/home-assistant/base:latest

RUN apk add --no-cache nodejs npm nginx && mkdir -p /run/nginx

WORKDIR /app

COPY app/package.json ./
RUN npm install

COPY app/ ./
RUN npm run build

COPY ingress.conf /etc/nginx/http.d/

RUN mkdir -p /data

COPY run.sh /
RUN chmod a+x /run.sh

CMD [ "/run.sh" ]