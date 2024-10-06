#!/bin/sh

# Substitute environment variables in the nginx.conf
envsubst '$VITE_APP_API_URL' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Start NGINX
exec nginx -g 'daemon off;'
