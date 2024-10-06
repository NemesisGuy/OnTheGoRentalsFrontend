# Stage 1: Build the Vue.js app
FROM node:lts-alpine AS build-stage

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire Vue.js app into the container
COPY . .

# Build the Vue.js app for production
RUN npm run build

# Stage 2: Serve the app using Nginx
FROM nginx:stable-alpine AS production-stage

# Copy the built app from the previous stage to Nginx's default directory
COPY --from=build-stage /app/dist /usr/share/nginx/html
# Copy a custom nginx configuration file (if needed)
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Expose port 80 (the default Nginx port)
EXPOSE 80

# Command to start Nginx
CMD ["nginx", "-g", "daemon off;"]
