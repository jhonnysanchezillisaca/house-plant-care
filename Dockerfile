FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nuxt

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/.nuxt ./.nuxt

RUN mkdir -p /app/data /app/public/uploads
RUN chown -R nuxt:nodejs /app/data /app/public/uploads

USER nuxt

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]