ARG BUILD_FROM
FROM $BUILD_FROM

RUN apk add --no-cache nodejs npm python3 make g++

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

RUN cd .output/server && npm init -y > /dev/null 2>&1 && npm install better-sqlite3 && cd ../..

RUN mkdir -p /app/data /app/public/uploads

ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

COPY ha-addon/run.sh /run.sh
RUN chmod a+x /run.sh

CMD [ "/run.sh" ]