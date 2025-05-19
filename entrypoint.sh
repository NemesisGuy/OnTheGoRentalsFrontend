#!/bin/sh
# Use /bin/sh for broader compatibility, though /bin/bash is fine if nginx image has it.
set -e # Exit immediately if a command exits with a non-zero status.

# VUE_APP_API_URL will be passed in from the docker-compose environment.
# Provide a sensible fallback if it's not set (e.g., for direct 'docker run' testing).
# Ensure the default matches a typical local development backend URL structure.
# If your backend is at http://localhost:8087/api, use that.
# If backend is at http://localhost:8087 (no /api context path), use that.
#!/bin/sh
set -e

# This is the environment variable Docker Compose will pass into the container.
# We provide a fallback for local testing or if the variable isn't set.
# The fallback should be your typical local development backend URL.
FALLBACK_BACKEND_URL="http://localhost:8087/api" # Default for local dev if backend is on 8087
URL_TO_CONFIGURE_IN_APP="${BACKEND_API_BASE_URL:-$FALLBACK_BACKEND_URL}"

CONFIG_FILE_PATH="/usr/share/nginx/html/config.js"

echo "Entrypoint: Received BACKEND_API_BASE_URL='${BACKEND_API_BASE_URL}'"
echo "Entrypoint: Using URL_TO_CONFIGURE_IN_APP='${URL_TO_CONFIGURE_IN_APP}'"

echo "window.runtimeConfig = {" > "${CONFIG_FILE_PATH}"
echo "  API_BASE_URL: \"${URL_TO_CONFIGURE_IN_APP}\"" >> "${CONFIG_FILE_PATH}" # Changed property name
echo "};" >> "${CONFIG_FILE_PATH}"

echo "Entrypoint: Generated ${CONFIG_FILE_PATH} with API_BASE_URL: ${URL_TO_CONFIGURE_IN_APP}"
cat "${CONFIG_FILE_PATH}"

echo "Entrypoint: Starting Nginx..."
exec nginx -g 'daemon off;'