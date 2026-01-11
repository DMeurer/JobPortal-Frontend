# Multi-stage build for Angular Frontend

# Stage 1: Build the Angular application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the Angular app for production
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy built Angular app from builder stage
COPY --from=builder /app/dist/Frontend/browser /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create entrypoint script inline to avoid line ending issues
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '# Generate config.json from environment variables' >> /docker-entrypoint.sh && \
    echo 'CONFIG_FILE="/usr/share/nginx/html/assets/config.json"' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '# Create assets directory if it does not exist' >> /docker-entrypoint.sh && \
    echo 'mkdir -p /usr/share/nginx/html/assets' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '# Generate config.json with environment variables' >> /docker-entrypoint.sh && \
    echo 'cat > "$CONFIG_FILE" <<EOF' >> /docker-entrypoint.sh && \
    echo '{' >> /docker-entrypoint.sh && \
    echo '  "defaultApiKey": "${DEFAULT_API_KEY:-}",' >> /docker-entrypoint.sh && \
    echo '  "defaultApiUrl": "${DEFAULT_API_URL:-}"' >> /docker-entrypoint.sh && \
    echo '}' >> /docker-entrypoint.sh && \
    echo 'EOF' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo 'echo "Generated config.json:"' >> /docker-entrypoint.sh && \
    echo 'cat "$CONFIG_FILE"' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '# Start nginx' >> /docker-entrypoint.sh && \
    echo 'exec nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

# Expose port 80
EXPOSE 80

# Use entrypoint script to generate config and start nginx
ENTRYPOINT ["/docker-entrypoint.sh"]
