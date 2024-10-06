#!/bin/sh

# entrypoint.sh

# Check if the main.js.template file exists
if [ ! -f /usr/share/nginx/html/js/main.js.template ]; then
    echo "Template file not found, exiting."
    exit 1
fi

# Replace placeholders in the main.js.template with environment variables
envsubst '${VITE_BACKEND_URL}' < /usr/share/nginx/html/js/main.js.template > /usr/share/nginx/html/js/app.js

# Start Nginx
nginx -g 'daemon off;'
