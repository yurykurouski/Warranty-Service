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

# Generate Swagger docs and types
RUN npm run generate-docs
RUN npm run generate-types

# Build TypeScript code
# Ensure tsconfig.json outDir is set to ./dist, which we saw in previous turns
RUN npm run build 2>/dev/null || npx tsc

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

# Copy built artifacts from builder stage (use explicit path to be safe)
COPY --from=builder /app/dist ./dist
# Copy generated Swagger output if it's not strictly inside dist (it seems it is in src/generated, which might not be in dist depending on tsconfig include/exclude)
# Let's check tsconfig content again mentally: "include": ["src/**/*"]. So generated files in src/generated SHOULD be compiled to dist/generated or just be available.
# Actually, swagger-output.json is a JSON file and usually tsc doesn't copy JSON unless resolveJsonModule is true (it is) AND we import it (we do).
# But if it's imported in code, it will be bundled or treated as a module.
# To be safe, let's copy the src/generated folder too if needed, but since we import it in index.ts: import swaggerDocs from './generated/swagger-output.json';
# tsc will likely handle it or we might need to copy it if it's treated as an external resource. 
# However, the safest bet for Express serving swagger-ui from a file is to have that file.
# Since we import it, tsc might inline it or require it. 
# Let's ensure non-ts files are handled. TSConfig has resolveJsonModule: true.
# Let's assuming tsc handles it. If not, we might need a step to copy assets.
# Wait, tsc usually only output .js and .d.ts files. It doesn't always copy .json files to dist unless configured or specific plugins used.
# Let's add a COPY instruction for generated assets just in case.
COPY --from=builder /app/src/generated ./dist/generated

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]
