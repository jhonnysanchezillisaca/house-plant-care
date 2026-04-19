ARG BUILD_FROM=ghcr.io/home-assistant/amd64-base-nodejs:latest
FROM $BUILD_FROM

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies (using clean-install for production)
RUN npm ci

# Copy the rest of your Nuxt code
COPY . .

# Build the Nuxt app (Nitro server)
RUN npm run build

# HA Add-ons use S6-overlay, but for a simple Node app, 
# you can just tell it how to start.
# Note: Ensure your Nuxt app looks at /data for the SQLite file!
CMD [ "node", ".output/server/index.mjs" ]