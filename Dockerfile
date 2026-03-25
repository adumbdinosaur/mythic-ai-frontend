# Mythic AI Frontend — Development Image
# Runs the Vite dev server (hot-reload enabled).
# For a production build, see the commented 'prod' stage at the bottom.

FROM node:22-alpine AS dev

WORKDIR /app

# Copy manifests first so Docker can cache the npm install layer
COPY package*.json ./

# Install all dependencies (including devDeps needed by Vite / Vitest)
RUN npm install --legacy-peer-deps

# Copy the rest of the source
COPY . .

# Vite dev server listens on 0.0.0.0:3000 (configured in vite.config.ts)
EXPOSE 3000

# VITE_API_URL is injected at build-time by docker-compose.
# It must be the URL that the *browser* can reach, so it uses the host's
# mapped port (localhost:8000) rather than the internal container name.
CMD ["npm", "run", "dev"]

# ---------------------------------------------------------------------------
# Optional production stage (not used by docker-compose.dev.yml)
# Build: docker build --target prod -t mythic-frontend-prod .
# ---------------------------------------------------------------------------
FROM node:22-alpine AS prod-build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine AS prod
COPY --from=prod-build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
