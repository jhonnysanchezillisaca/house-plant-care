# The actual, official HA base image
ARG BUILD_FROM=ghcr.io/home-assistant/amd64-base:latest
FROM $BUILD_FROM

# Install Node.js, NPM, openssl, and nginx
RUN apk add --no-cache nodejs npm openssl nginx

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

# Nuxt/Nitro listens on 3001 (behind nginx on 3000)
ENV HOST=127.0.0.1
ENV PORT=3001

# Ensure run.sh is executable
RUN chmod +x /app/ha-addon/run.sh

# Start the application via the HA add-on run script
# This starts nginx on 3000 and Nuxt on 3001
CMD [ "/app/ha-addon/run.sh" ]