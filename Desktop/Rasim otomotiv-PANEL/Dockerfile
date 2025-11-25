# Backend için Dockerfile
FROM node:22-alpine

WORKDIR /app

# Backend dependencies
COPY Desktop/Rasim\ otomotiv-PANEL/backend/package*.json ./
RUN npm ci --legacy-peer-deps

# Backend source
COPY Desktop/Rasim\ otomotiv-PANEL/backend/ ./

# Build
RUN npm run build

# Start
EXPOSE 3007
CMD ["node", "dist/main"]
