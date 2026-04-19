# The actual, official HA base image
ARG BUILD_FROM=ghcr.io/home-assistant/amd64-base:latest
FROM $BUILD_FROM

# Install Node.js and NPM manually
RUN apk add --no-cache nodejs npm

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of your Nuxt code
COPY . .

# Build the Nuxt app
RUN npm run build

# Nuxt/Nitro listens on 3000 by default, HA expects it to be available
ENV HOST=0.0.0.0
ENV PORT=8099

# Start the application
# Note: Ensure your code points the SQLite db to /data/house-plant.db
CMD [ "node", ".output/server/index.mjs" ]