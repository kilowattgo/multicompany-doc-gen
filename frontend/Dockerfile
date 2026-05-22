# Stage 1: Build Angular App
FROM node:22-slim AS build
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build --configuration=production

# Stage 2: Serve with Nginx
FROM nginx:alpine
# Copy built files
# Note: Angular 17+ uses dist/<project-name>/browser
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
