#!/bin/sh
set -e

# This is the single source of truth for the backend URL.
# It uses the environment variable BACKEND_API_BASE_URL if it's set,
# otherwise it falls back to a default value for local testing.
# IMPORTANT: The trailing slash is significant.
BACKEND_URL="${BACKEND_API_BASE_URL:-http://localhost:8080/}"

# Define the path to the config file that will be generated inside the container.
CONFIG_FILE_PATH="/usr/share/nginx/html/config.js"

echo "Entrypoint: Configuring application with backend API URL: ${BACKEND_URL}"

# Create the config.js file by writing the window.runtimeConfig object to it.
# This makes the backend URL available to the Vue app globally.
cat > "${CONFIG_FILE_PATH}" <<EOF
window.runtimeConfig = {
  API_BASE_URL: "${BACKEND_URL}"
};
EOF

# Optional: Print the content of the generated file for debugging purposes.
echo "Entrypoint: Generated ${CONFIG_FILE_PATH} with the following content:"
cat "${CONFIG_FILE_PATH}"

echo "Entrypoint: Starting Nginx..."
# Use exec to replace the shell process with the Nginx process.
# This is the standard way to run the main application in a container.
exec nginx -g 'daemon off;'