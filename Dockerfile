# Multi-stage production and dev Dockerfile for PLM AI Platform
FROM node:20-alpine

WORKDIR /app

# Install build dependencies
COPY package.json package-lock.json* bun.lock* ./

# Install npm dependencies
RUN npm install

# Copy application source code
COPY . .

# Set default environment variables
ENV NODE_ENV=development
ENV PORT=3000

# Expose server port
EXPOSE 3000

# Start development full-stack server (tsx server.ts)
CMD ["npm", "run", "dev"]
