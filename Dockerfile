# Stage 1: Builder
# Use a specific node version for reproducibility
FROM node:20-slim AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for building)
RUN npm install

# Copy source code and config files
COPY . .

# Generate Swagger docs and types (using TSOA)
RUN npm run tsoa:gen
# generate-types uses the generated swagger.json, so run it after
RUN npm run generate-types

# Build TypeScript code
RUN npx tsc

# Copy swagger.json to dist because tsc doesn't copy non-ts files by default
# We need to preserve the directory structure
RUN mkdir -p dist/generated && cp src/generated/swagger.json dist/generated/swagger.json

# Stage 2: Production
FROM node:20-slim

# Set working directory
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built artifacts from builder stage
COPY --from=builder /app/dist ./dist

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]
