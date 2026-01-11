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

# Copy entrypoint script and make executable
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port 80
EXPOSE 80

# Use entrypoint script to generate config and start nginx
ENTRYPOINT ["/docker-entrypoint.sh"]
