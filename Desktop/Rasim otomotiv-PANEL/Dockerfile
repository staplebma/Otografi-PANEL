# Backend için Dockerfile
FROM node:22-alpine

WORKDIR /app

# Backend dependencies
COPY backend/package*.json ./
RUN npm ci --legacy-peer-deps

# Backend source
COPY backend/ .

# Build
RUN npm run build

# Verify build output
RUN ls -la dist

# Start
EXPOSE 3007
CMD ["node", "dist/src/main"]
