# Stage 1: Build the Vue app
FROM node:20-slim AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
# Copy built files from Vue to Nginx folder
COPY --from=build-stage /app/dist /usr/share/nginx/html
# Fly.io usually expects port 80 or 8080
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
