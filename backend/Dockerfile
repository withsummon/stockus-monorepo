# Stage 1: Install production dependencies only
FROM node:20-slim AS prod-deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --only=production

# Stage 2: Build TypeScript application
FROM node:20-slim AS build
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript to JavaScript
RUN npm run build

# Stage 3: Production runtime
FROM node:20-slim AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 hono

# Copy production dependencies from prod-deps stage
COPY --from=prod-deps --chown=hono:nodejs /app/node_modules ./node_modules

# Copy built application from build stage
COPY --from=build --chown=hono:nodejs /app/dist ./dist

# Copy drizzle migrations for runtime migration
COPY --from=build --chown=hono:nodejs /app/drizzle ./drizzle

# Copy package.json for runtime
COPY --from=build --chown=hono:nodejs /app/package.json ./

# Copy entrypoint script
COPY --chown=hono:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Switch to non-root user
USER hono

# Expose port 3000 (Docker standard, overrideable via PORT env var)
EXPOSE 3000

# Health check using Node.js http module
HEALTHCHECK --interval=12s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start with entrypoint (seeds if DB is empty, then starts app)
CMD ["./docker-entrypoint.sh"]
