#!/bin/sh

# Generate config.json from environment variables
# This allows runtime configuration of the Angular app in Docker

CONFIG_FILE="/usr/share/nginx/html/assets/config.json"

# Create assets directory if it doesn't exist
mkdir -p /usr/share/nginx/html/assets

# Generate config.json with environment variables
cat > "$CONFIG_FILE" <<EOF
{
  "defaultApiKey": "${DEFAULT_API_KEY:-}",
  "defaultApiUrl": "${DEFAULT_API_URL:-}"
}
EOF

echo "Generated config.json:"
cat "$CONFIG_FILE"

# Start nginx
exec nginx -g "daemon off;"
