# Frontend Docker Deployment with Runtime API Configuration

This document explains how the Vue.js frontend application is Dockerized and configured to connect to a backend API whose URL can be set at runtime during deployment. This allows the same frontend Docker image to be used across different environments (development, staging, production) by simply changing an environment variable.

## Core Concept

The frontend is a Single Page Application (SPA) built with Vue.js. For deployment, the static assets (HTML, CSS, JavaScript) are served by an Nginx web server running inside a Docker container.

To allow the Vue app (which runs in the user's browser) to know the location of the backend API, we use a runtime configuration strategy:
1.  An `entrypoint.sh` script runs when the frontend Docker container starts.
2.  This script reads an environment variable (e.g., `VUE_APP_API_URL`) passed to the container.
3.  It then dynamically generates a small JavaScript file (e.g., `config.js`) inside the Nginx web root, embedding the API URL into it.
4.  The `index.html` of the Vue app loads this `config.js` before the main application bundle.
5.  The Vue application (specifically, the Axios instance in `src/api.js`) reads the API URL from the global `window.runtimeConfig` object created by `config.js`.

## File Breakdown and Their Roles

Here are the key files involved in building and running the frontend Docker container:

### 1. `Dockerfile` (e.g., in the Vue project root)

*   **Purpose:** Defines the instructions to build the frontend Docker image.
* **Key Steps:**
    *   Uses a base Nginx image (e.g., `nginx:stable-alpine`).
    *   Removes the default Nginx configuration to avoid conflicts.
    *   Copies your custom `nginx.conf` to `/etc/nginx/conf.d/` (e.g., as `custom_app.conf` or `default.conf`).
    *   Copies the pre-built static assets from your Vue application (the `dist/` folder, created by `npm run build` or `yarn build`) into the Nginx web root (`/usr/share/nginx/html`).
    *   Copies the `entrypoint.sh` script into the image and makes it executable.
    *   Sets `entrypoint.sh` as the `ENTRYPOINT`, so it runs when the container starts.
    *   Exposes port `80` (the default Nginx port).

  ```dockerfile
  # Example Dockerfile
  FROM nginx:stable-alpine

  RUN rm -f /etc/nginx/conf.d/default.conf
  COPY ../nginx.conf /etc/nginx/conf.d/custom_app.conf

  COPY ../dist /usr/share/nginx/html
  COPY ../entrypoint.sh /entrypoint.sh
  RUN chmod +x /entrypoint.sh

  EXPOSE 80
  ENTRYPOINT ["/entrypoint.sh"]
  ```

### 2. `nginx.conf` (e.g., in the Vue project root, copied by Dockerfile)

*   **Purpose:** Configures the Nginx web server running inside the Docker container.
*   **Key Configuration:**
    *   Listens on port `80`.
    *   Sets the web root to `/usr/share/nginx/html` (where Vue assets are).
    *   Serves `index.html` as the default file.
    *   Includes a `location` block for `/config.js` with cache-control headers to ensure the browser always fetches the latest version of this dynamically generated file.
    *   Includes a `location / { ... }` block with `try_files $uri $uri/ /index.html;`. This is crucial for SPAs, ensuring that all routes are directed to `index.html` so Vue Router can handle client-side navigation.
    *   **Important:** This Nginx configuration does *not* proxy API calls to the backend. It only serves static files. The Vue app itself makes direct calls to the backend API URL.

    ```nginx
    # Example nginx.conf
    server {
        listen 80 default_server;
        server_name _;

        root /usr/share/nginx/html;
        index index.html index.htm;

        location = /config.js {
            add_header 'Cache-Control' 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0';
            add_header 'Pragma' 'no-cache';
            add_header 'Expires' '0';
            try_files $uri =404;
        }

        location / {
            try_files $uri $uri/ /index.html;
        }
    }
    ```

### 3. `entrypoint.sh` (e.g., in the Vue project root, copied by Dockerfile)

*   **Purpose:** This shell script runs when the Docker container starts, *before* Nginx is launched.
*   **Key Actions:**
    *   Reads an environment variable (e.g., `VUE_APP_API_URL`) that was passed to the Docker container at runtime (e.g., from `docker-compose.yml`).
    *   Provides a fallback default URL if the environment variable is not set.
    *   Dynamically creates/overwrites a file named `config.js` in the Nginx web root (`/usr/share/nginx/html/config.js`).
    *   This `config.js` file defines a global JavaScript object, for example, `window.runtimeConfig`, and populates a property (e.g., `API_URL`) with the value of the environment variable.
    *   Includes `echo` statements for debugging to show which URL is being written.
    *   Finally, it starts the Nginx server in the foreground (`exec nginx -g 'daemon off;'`).

    ```bash
    #!/bin/sh
    set -e

    FALLBACK_API_URL="http://localhost:8087/api" # Example fallback
    API_URL_TO_USE="${VUE_APP_API_URL:-$FALLBACK_API_URL}"
    CONFIG_FILE_PATH="/usr/share/nginx/html/config.js"

    echo "Entrypoint: Received VUE_APP_API_URL='${VUE_APP_API_URL}'"
    echo "Entrypoint: Using API_URL_TO_USE='${API_URL_TO_USE}'"

    echo "window.runtimeConfig = {" > "${CONFIG_FILE_PATH}"
    echo "  API_URL: \"${API_URL_TO_USE}\"" >> "${CONFIG_FILE_PATH}"
    echo "};" >> "${CONFIG_FILE_PATH}"

    echo "Entrypoint: Generated ${CONFIG_FILE_PATH} with API_URL: ${API_URL_TO_USE}"
    cat "${CONFIG_FILE_PATH}" # Log content for verification

    echo "Entrypoint: Starting Nginx..."
    exec nginx -g 'daemon off;'
    ```

### 4. `public/index.html` (In your Vue project's `public` folder)

*   **Purpose:** The main HTML shell for your Vue application.
*   **Key Modification:**
    *   A `<script src="/config.js"></script>` tag is added in the `<head>` section, **before** the script tag that loads your main Vue application bundle. This ensures `window.runtimeConfig` is available when your app starts.

    ```html
    <!-- Example public/index.html head section -->
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1.0">
      <title>My Vue App</title>
      <!-- Load runtime config first -->
      <script src="/config.js"></script>
    </head>
    ```

### 5. `src/api.js` (Or wherever your Axios instance is configured in Vue)

*   **Purpose:** Configures the Axios instance used for making API calls.
*   **Key Modification:**
    *   It reads `window.runtimeConfig.API_URL` to set the `baseURL` for Axios.
    *   Includes fallback logic to use build-time environment variables (like `process.env.VUE_APP_API_URL` or `import.meta.env.VITE_API_BASE_URL`) or a hardcoded default, which is useful for local development *outside* of Docker or if `config.js` fails to load.

    ```javascript
    // Example src/api.js
    import axios from 'axios';

    const getApiBaseUrl = () => {
      if (window.runtimeConfig && typeof window.runtimeConfig.API_URL === 'string') {
        return window.runtimeConfig.API_URL;
      }
      // Fallback logic
      const buildTimeApiUrl = process.env.VUE_APP_API_URL || (typeof import.meta !== 'undefined' ? import.meta.env.VITE_API_BASE_URL : undefined) || 'http://localhost:8087/api';
      console.warn("Runtime config not found, using build-time or default API URL:", buildTimeApiUrl);
      return buildTimeApiUrl;
    };

    const API_BASE_URL = getApiBaseUrl();
    const api = axios.create({ baseURL: API_BASE_URL });
    // ... your interceptors ...
    export default api;
    ```

### 6. `docker-compose.frontend.yml` (Or a service definition in a larger `docker-compose.yml`)

*   **Purpose:** Defines how to run your frontend Docker container. This file is used on the deployment server.
*   **Key Configuration:**
    *   Specifies the Docker image to use (e.g., `nemesisguy/on-the-go-rentals-frontend:latest`).
    *   Maps a host port to the container's port `80` (e.g., `5175:80`).
    *   **Crucially, it sets the `VUE_APP_API_URL` environment variable for the container.** The value for this variable is typically sourced from a `.env` file on the deployment server or set directly in the shell environment when running `docker-compose up`.

    ```yaml
    # Example docker-compose.frontend.yml
    version: "3.7"
    services:
      frontend-app:
        image: nemesisguy/on-the-go-rentals-frontend:latest
        container_name: my-vue-frontend-instance
        restart: always
        ports:
          - "5175:80" # Host port 5175 maps to Nginx in container on port 80
        environment:
          # This value is read by entrypoint.sh
          VUE_APP_API_URL: ${RUNTIME_API_URL_FROM_ENV_FILE}
    ```

### 7. `.env` file (On the deployment server, in the same directory as `docker-compose.frontend.yml`)

*   **Purpose:** To provide the actual value for `RUNTIME_API_URL_FROM_ENV_FILE` (or whatever placeholder you use in `docker-compose.frontend.yml`) without hardcoding it in the compose file itself. **This `.env` file should NOT be committed to version control if it contains environment-specific URLs.**
*   **Content:**
    ```env
    # Example .env file on deployment server
    RUNTIME_API_URL_FROM_ENV_FILE=http://actual-backend-api.example.com/api
    ```

## Deployment Workflow Summary

1.  **Build Vue App:** Run `npm run build` (or `yarn build`) in your Vue project to generate static assets in the `dist/` folder.
2.  **Build Docker Image:** In the Vue project root (where `Dockerfile`, `nginx.conf`, `entrypoint.sh`, and `dist/` are), run `docker build -t your-image-name:tag .`.
3.  **Push Docker Image:** Push the built image to a Docker registry (e.g., Docker Hub).
4.  **On Deployment Server:**
    *   Have the `docker-compose.frontend.yml` file.
    *   Create a `.env` file in the same directory, defining `RUNTIME_API_URL_FROM_ENV_FILE` (or your chosen placeholder name) with the correct public URL of your backend API for that environment.
    *   Run `docker-compose -f docker-compose.frontend.yml pull` (to get the latest image).
    *   Run `docker-compose -f docker-compose.frontend.yml up -d` to start the frontend container.
5.  The `entrypoint.sh` in the container will use the `VUE_APP_API_URL` (which received its value from `RUNTIME_API_URL_FROM_ENV_FILE`) to generate `config.js`.
6.  Users accessing the frontend will have their Vue app configured to point to the specified backend API.

This setup provides a robust and flexible way to manage your frontend's API configuration across different deployment environments.