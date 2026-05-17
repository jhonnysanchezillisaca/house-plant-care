# The actual, official HA base image
ARG BUILD_FROM=ghcr.io/home-assistant/amd64-base:latest
FROM $BUILD_FROM

# Install Node.js, NPM, and openssl
RUN apk add --no-cache nodejs npm openssl

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

# Nuxt/Nitro listens on port 3000
ENV HOST=0.0.0.0
ENV PORT=3000

# Ensure run.sh is executable
RUN chmod +x /app/ha-addon/run.sh

# Start the application via the HA add-on run script
CMD [ "/app/ha-addon/run.sh" ]