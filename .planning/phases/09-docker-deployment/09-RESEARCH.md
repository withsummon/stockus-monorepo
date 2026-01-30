# Phase 9: Docker & Deployment - Research

**Researched:** 2026-01-30
**Domain:** Docker containerization, Docker Compose orchestration
**Confidence:** HIGH

## Summary

Docker containerization for production-ready Node.js applications follows well-established patterns in 2026, centered around multi-stage builds, Alpine Linux base images, and standalone output modes for Next.js. The standard approach uses three-stage Dockerfiles (dependencies, builder, runner) that separate build-time from runtime dependencies, reducing production images from ~1.2GB to 300-450MB.

For this stack (Hono backend, Next.js frontend, PostgreSQL), Docker Compose orchestrates all services with proper health checks, startup ordering via `depends_on` with `service_healthy` conditions, and secrets management through environment files or Docker secrets. The pnpm package manager requires specific optimizations using BuildKit cache mounts and the `pnpm fetch` command to maximize build performance.

Critical production considerations include running containers as non-root users, implementing comprehensive health checks that verify dependencies (not just process existence), configuring resource limits to prevent resource exhaustion, and using named volumes for PostgreSQL data persistence with regular backup strategies.

**Primary recommendation:** Use multi-stage Docker builds with Alpine images, Next.js standalone output mode, pnpm cache mounts, health check-based startup ordering in Docker Compose, and non-root users for all services.

## Standard Stack

The established tools for Docker-based Node.js deployments:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Docker | 24.0+ | Container runtime | Industry standard for containerization |
| Docker Compose | v2.20+ | Multi-container orchestration | Declarative service management, built-in networking |
| Node.js Alpine | 20-alpine | Base image | 70%+ smaller than standard Node images, security-focused |
| PostgreSQL Official | 16-alpine | Database image | Official image with health check support, Alpine variant available |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| nginx | alpine | Reverse proxy | Static routing, SSL termination, simple deployments |
| traefik | v3.0+ | Dynamic reverse proxy | Auto-discovery, label-based config, multiple backends |
| BuildKit | (built-in) | Advanced build engine | Cache mounts, multi-platform builds (enabled by default) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Alpine images | Debian/Ubuntu images | Alpine = smaller (5MB vs 100MB+), Debian = more compatible with native binaries |
| nginx | traefik | nginx = simpler config files, traefik = auto-discovery and dynamic updates |
| Docker Compose | Kubernetes | Compose = simpler for single-server, K8s = complex but handles multi-node orchestration |

**Installation:**
```bash
# Docker Desktop includes Docker Compose v2
# Verify installation
docker --version
docker compose version

# For production servers (Linux):
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

## Architecture Patterns

### Recommended Project Structure
```
project-root/
├── backend/
│   ├── Dockerfile              # Hono API Dockerfile
│   ├── .dockerignore           # Exclude node_modules, .env, etc.
│   ├── package.json
│   └── src/
├── frontend/
│   ├── Dockerfile              # Next.js Dockerfile
│   ├── .dockerignore
│   ├── next.config.js          # Must include output: 'standalone'
│   └── app/
├── docker-compose.yml          # Orchestration file
├── docker-compose.prod.yml     # Production overrides
├── .env.example                # Template for environment variables
└── .env                        # Actual secrets (gitignored)
```

### Pattern 1: Multi-Stage Dockerfile for Node.js Backend (Hono)
**What:** Three-stage build separating dependencies, build, and runtime
**When to use:** All Node.js backend services requiring production optimization
**Example:**
```dockerfile
# Source: https://pnpm.io/docker, https://docs.docker.com/build/building/multi-stage/
FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Stage 1: Install production dependencies only
FROM base AS prod-deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --prod --frozen-lockfile

# Stage 2: Build application (includes devDependencies)
FROM base AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

# Stage 3: Production runtime
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 hono

# Copy only necessary files
COPY --from=prod-deps --chown=hono:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=hono:nodejs /app/dist ./dist
COPY --from=build --chown=hono:nodejs /app/package.json ./

USER hono
EXPOSE 3000

# Health check
HEALTHCHECK --interval=12s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/index.js"]
```

**Key optimizations:**
- `--mount=type=cache` persists pnpm store across builds (BuildKit feature)
- Separate prod-deps stage eliminates devDependencies from final image
- Layer ordering: least-to-most frequently changed (package.json → source code)
- Alpine-based node:20-slim reduces base image size

### Pattern 2: Next.js Standalone Dockerfile
**What:** Multi-stage build leveraging Next.js standalone output mode
**When to use:** All Next.js frontend deployments
**Example:**
```dockerfile
# Source: https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile
FROM node:20-alpine AS base

# Stage 1: Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Stage 2: Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# IMPORTANT: next.config.js must have output: 'standalone'
RUN corepack enable pnpm && pnpm run build

# Stage 3: Production runtime
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output (much smaller than full node_modules)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check for Next.js
HEALTHCHECK --interval=12s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]
```

**Critical configuration in `next.config.js`:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // REQUIRED for Docker optimization
}

module.exports = nextConfig
```

**Impact:** Reduces image size from ~1.2GB to 300-450MB by excluding full node_modules.

### Pattern 3: Docker Compose Orchestration with Health Checks
**What:** Service orchestration with health-based startup ordering
**When to use:** All multi-container deployments
**Example:**
```yaml
# Source: https://docs.docker.com/compose/how-tos/startup-order/
version: '3.9'

services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
      NODE_ENV: production
    depends_on:
      db:
        condition: service_healthy
        restart: true
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 12s
      timeout: 5s
      start_period: 30s
      retries: 3
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '1.5'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      NEXT_PUBLIC_API_URL: http://backend:3000
    depends_on:
      backend:
        condition: service_healthy
        restart: true
    ports:
      - "3001:3000"
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M

volumes:
  pgdata:
    driver: local
```

**Key features:**
- `condition: service_healthy` ensures db is ready before backend starts
- `restart: true` in depends_on restarts dependent when dependency restarts
- Resource limits prevent one service from exhausting system resources
- Named volume `pgdata` persists database data across container restarts

### Pattern 4: Comprehensive .dockerignore
**What:** Exclude unnecessary files from build context
**When to use:** Every Dockerfile in the project
**Example:**
```dockerignore
# Source: https://github.com/vercel/next.js/tree/canary/examples/with-docker
# Dependencies
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# Build outputs
.next
out
dist
build

# Environment files
.env
.env*.local
.env.production

# Git
.git
.gitignore

# Docker
Dockerfile*
docker-compose*
.dockerignore

# IDE
.vscode
.idea
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Testing
coverage
.nyc_output

# Misc
*.log
README.md
LICENSE
```

**Impact:** Reduces build context size by 70-90%, speeding up builds significantly.

### Pattern 5: Environment Variable Management with Docker Secrets
**What:** Secure credential management using Docker secrets or _FILE variants
**When to use:** Production deployments with sensitive credentials
**Example:**
```yaml
# Using environment file (simpler, for single-server deployments)
services:
  db:
    image: postgres:16-alpine
    env_file:
      - .env.db
    volumes:
      - pgdata:/var/lib/postgresql/data

# Using Docker secrets (more secure, for Swarm deployments)
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_password
    volumes:
      - pgdata:/var/lib/postgresql/data

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

**Security note:** PostgreSQL image supports `POSTGRES_PASSWORD_FILE`, `POSTGRES_USER_FILE`, and `POSTGRES_DB_FILE` for reading from secret files.

### Pattern 6: nginx Reverse Proxy (Optional)
**What:** Simple reverse proxy for routing and SSL termination
**When to use:** Static routing needs, single backend
**Example:**
```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      frontend:
        condition: service_healthy
      backend:
        condition: service_healthy
    restart: unless-stopped
```

**nginx.conf example:**
```nginx
upstream frontend {
    server frontend:3000;
}

upstream backend {
    server backend:3000;
}

server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Pattern 7: Traefik Reverse Proxy (Optional, Advanced)
**What:** Dynamic reverse proxy with auto-discovery
**When to use:** Multiple backends, automatic service discovery, dynamic scaling
**Example:**
```yaml
services:
  traefik:
    image: traefik:v3.0
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
    ports:
      - "80:80"
      - "8080:8080"  # Traefik dashboard
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    restart: unless-stopped

  frontend:
    build: ./frontend
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`example.com`)"
      - "traefik.http.routers.frontend.entrypoints=web"
      - "traefik.http.services.frontend.loadbalancer.server.port=3000"
    depends_on:
      backend:
        condition: service_healthy

  backend:
    build: ./backend
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.backend.rule=Host(`example.com`) && PathPrefix(`/api`)"
      - "traefik.http.routers.backend.entrypoints=web"
      - "traefik.http.services.backend.loadbalancer.server.port=3000"
    depends_on:
      db:
        condition: service_healthy
```

**Advantage:** No config file edits needed when adding services; labels auto-configure routing.

### Anti-Patterns to Avoid

- **Running as root in production:** Always use non-root users (node, nextjs, custom users with UID 1001)
- **Using `npm` or `yarn` as CMD:** Use `node` directly (e.g., `CMD ["node", "server.js"]`) to properly handle SIGTERM signals
- **Hardcoding secrets in Dockerfile:** Use environment variables or Docker secrets
- **Missing health checks:** Without health checks, `depends_on` only checks if container started, not if service is ready
- **No resource limits:** One misbehaving service can crash entire system
- **Using `latest` tags in production:** Pin specific versions (e.g., `postgres:16-alpine`, not `postgres:latest`)
- **Copying entire context:** Use .dockerignore to exclude node_modules, .git, etc.
- **Setting NODE_ENV too early:** Set in runtime stage, not build stage, to avoid cache invalidation

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Health checks | Custom HTTP ping scripts | Dockerfile HEALTHCHECK + Node.js one-liner | Built-in Docker monitoring, integrates with depends_on conditions |
| Dependency startup order | Sleep delays, retry loops | depends_on with service_healthy | Declarative, reliable, no arbitrary timeouts |
| Secrets management | .env files committed to git | Docker secrets or env_file with gitignored .env | Prevents credential leaks, proper security model |
| Reverse proxy config | Custom Node.js proxy | nginx or traefik | Battle-tested, handles edge cases (WebSockets, SSL, rate limiting) |
| Database backups | Custom backup scripts | docker run with volume mounts + pg_dump | Standard pattern, works with any tool, preserves consistency |
| Log aggregation | Writing to files in container | Docker logs + external aggregator | Containers are ephemeral, logs should be external |
| Process management | PM2/forever in container | Single process per container + Docker restart policies | Docker handles restarts, simpler debugging |
| Multi-stage caching | Manual layer optimization | BuildKit cache mounts (--mount=type=cache) | Persistent cache across builds, much faster |

**Key insight:** Docker ecosystem provides robust solutions for containerization concerns. Custom solutions miss edge cases (SIGTERM handling, health check integration, cache invalidation) that cause production issues.

## Common Pitfalls

### Pitfall 1: Race Conditions from Missing Health Checks
**What goes wrong:** Backend tries connecting to PostgreSQL before it's ready, causing startup failures that "work sometimes" but fail under load or slower hardware.

**Why it happens:** `depends_on` without `condition: service_healthy` only ensures the container process started, not that PostgreSQL initialization completed (takes 3-8 seconds).

**How to avoid:**
1. Always define HEALTHCHECK in Dockerfile or healthcheck in docker-compose.yml
2. Use `depends_on` with `condition: service_healthy` for database dependencies
3. Health check should verify actual service readiness (e.g., `pg_isready` for PostgreSQL)

**Warning signs:**
- Intermittent connection errors on startup
- Backend works locally but fails in CI/CD
- Errors like "ECONNREFUSED" or "database does not exist" that disappear on retry

### Pitfall 2: Bloated Images from Missing Multi-Stage Builds
**What goes wrong:** Production images include build tools, TypeScript compiler, test frameworks, resulting in 1GB+ images that slow deployments and waste resources.

**Why it happens:** Single-stage Dockerfile runs `npm install` (includes devDependencies) and never removes build tools.

**How to avoid:**
1. Use separate stage for building: `FROM base AS build`
2. Install prod-only dependencies in separate stage: `pnpm install --prod`
3. Copy only necessary artifacts to final stage (dist/, node_modules from prod-deps, not source)
4. Use Alpine base images (node:20-alpine vs node:20 saves ~900MB)

**Warning signs:**
- Docker images over 500MB for Node.js apps
- `docker images` shows multiple layers with "npm install" or "yarn install"
- Deployment takes minutes to push images

### Pitfall 3: Cache Invalidation from Improper Layer Ordering
**What goes wrong:** Every code change triggers reinstalling all npm packages, making builds 10x slower.

**Why it happens:** Copying application code before running `npm install` invalidates package installation cache whenever any file changes.

**How to avoid:**
1. Copy package.json and lock file FIRST: `COPY package.json pnpm-lock.yaml ./`
2. Run install: `RUN pnpm install`
3. Copy application code LAST: `COPY . .`
4. Use BuildKit cache mounts for pnpm store: `RUN --mount=type=cache,id=pnpm,target=/pnpm/store`

**Warning signs:**
- "npm install" runs on every build even when dependencies unchanged
- Build times 5+ minutes for simple code changes
- CI/CD pipelines spending most time on dependency installation

### Pitfall 4: Security Vulnerabilities from Running as Root
**What goes wrong:** Container compromise gives attacker root access to container, enabling container escape attempts and privilege escalation.

**Why it happens:** Default Docker behavior runs as root user (UID 0) unless explicitly changed.

**How to avoid:**
1. Create non-root user in Dockerfile: `RUN adduser --system --uid 1001 appuser`
2. Change ownership of files: `COPY --chown=appuser:appuser`
3. Switch to user before CMD: `USER appuser`
4. Node.js official images provide `node` user (UID 1000) out of the box

**Warning signs:**
- `docker exec` shows you're root user
- Security scans flag "running as root"
- Container can modify system files

### Pitfall 5: Data Loss from Missing Volume Configuration
**What goes wrong:** Database data disappears when container restarts, losing all production data.

**Why it happens:** PostgreSQL writes to `/var/lib/postgresql/data` inside container. Without volume mount, data lives in container filesystem and is deleted when container is removed.

**How to avoid:**
1. Define named volume in docker-compose.yml: `volumes: - pgdata:/var/lib/postgresql/data`
2. Declare volume at top level: `volumes: pgdata:`
3. Back up volumes regularly: `docker run --rm -v pgdata:/data -v $(pwd):/backup alpine tar czf /backup/pgdata.tar.gz -C /data .`
4. Never use anonymous volumes for databases

**Warning signs:**
- Database starts empty after `docker-compose down && docker-compose up`
- Data exists until you remove containers
- `docker volume ls` shows unnamed volumes

### Pitfall 6: Resource Exhaustion from Missing Limits
**What goes wrong:** Single container memory leak crashes entire server, bringing down all services.

**Why it happens:** Docker allows containers to use unlimited host resources by default.

**How to avoid:**
1. Set memory limits in docker-compose.yml: `deploy.resources.limits.memory: 512M`
2. Set CPU limits: `deploy.resources.limits.cpus: '1.0'`
3. Set reservations (soft limits): `deploy.resources.reservations`
4. Monitor actual usage to tune limits appropriately

**Warning signs:**
- Server runs out of memory unexpectedly
- One service slows down all others
- Containers consuming 100% CPU for extended periods

### Pitfall 7: Secrets Exposure from .env Files in Images
**What goes wrong:** Secrets baked into Docker images get leaked when images are pushed to registry or shared.

**Why it happens:** `COPY .env .` in Dockerfile or ENV with hardcoded secrets.

**How to avoid:**
1. Never COPY .env files in Dockerfile
2. Add .env to .dockerignore
3. Pass secrets at runtime via `env_file` or `environment` in docker-compose.yml
4. Use Docker secrets for production: `POSTGRES_PASSWORD_FILE=/run/secrets/db_password`
5. Keep .env.example in repo with placeholder values only

**Warning signs:**
- .env file visible in `docker exec` container filesystem
- Secrets visible in `docker history` output
- .dockerignore missing or doesn't include .env

### Pitfall 8: Broken Signals from npm/yarn as CMD
**What goes wrong:** Container doesn't stop gracefully when receiving SIGTERM, causing force-kills that corrupt data or lose in-flight requests.

**Why it happens:** Using `CMD ["npm", "start"]` puts npm as PID 1, which doesn't forward signals to Node.js process.

**How to avoid:**
1. Use `CMD ["node", "server.js"]` directly, not npm/yarn
2. For Next.js standalone: `CMD ["node", "server.js"]` (not `npm start`)
3. For development only: can use npm, but never in production Dockerfile

**Warning signs:**
- Container takes 10+ seconds to stop (waiting for force-kill timeout)
- "Graceful shutdown" handlers in code never execute
- Data corruption or incomplete requests after deployments

### Pitfall 9: Next.js Missing Standalone Output
**What goes wrong:** Next.js Docker image is 1GB+ with full node_modules, making deploys slow and expensive.

**Why it happens:** Not configuring `output: 'standalone'` in next.config.js means Next.js includes entire node_modules in production build.

**How to avoid:**
1. Add `output: 'standalone'` to next.config.js
2. In Dockerfile, copy from `.next/standalone` directory, not full node_modules
3. Separately copy `.next/static` and `public` directories
4. Use multi-stage build pattern from official Next.js example

**Warning signs:**
- Frontend image over 800MB
- node_modules copied to production stage
- Slow deployments due to large image size

### Pitfall 10: Improper pnpm Cache Usage
**What goes wrong:** Every build reinstalls all packages from network, wasting time and bandwidth.

**Why it happens:** Not using BuildKit cache mounts or pnpm fetch command, causing pnpm store to be lost between builds.

**How to avoid:**
1. Use BuildKit: `DOCKER_BUILDKIT=1` (enabled by default in Docker 23.0+)
2. Add cache mount: `RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install`
3. Use `pnpm fetch` for pre-fetching: `RUN pnpm fetch --prod`
4. Ensure different services use different cache IDs

**Warning signs:**
- pnpm downloading packages on every build
- Build times don't improve on subsequent builds
- Network traffic during build even when dependencies unchanged

## Code Examples

Verified patterns from official sources:

### Complete Backend Dockerfile (Hono with pnpm)
```dockerfile
# Source: https://pnpm.io/docker
FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Production dependencies
FROM base AS prod-deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --prod --frozen-lockfile

# Build stage
FROM base AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

# Production runtime
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 hono

COPY --from=prod-deps --chown=hono:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=hono:nodejs /app/dist ./dist
COPY --from=build --chown=hono:nodejs /app/package.json ./

USER hono
EXPOSE 3000

HEALTHCHECK --interval=12s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/index.js"]
```

### Complete Frontend Dockerfile (Next.js with pnpm)
```dockerfile
# Source: https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable pnpm && pnpm run build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=12s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]
```

### Complete docker-compose.yml
```yaml
# Source: https://docs.docker.com/compose/how-tos/startup-order/
version: '3.9'

services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB:-stockus}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB:-stockus}
      NODE_ENV: production
      PORT: 3000
      # R2 and Midtrans credentials from .env
      R2_ACCOUNT_ID: ${R2_ACCOUNT_ID}
      R2_ACCESS_KEY_ID: ${R2_ACCESS_KEY_ID}
      R2_SECRET_ACCESS_KEY: ${R2_SECRET_ACCESS_KEY}
      R2_BUCKET_NAME: ${R2_BUCKET_NAME}
      MIDTRANS_SERVER_KEY: ${MIDTRANS_SERVER_KEY}
      MIDTRANS_CLIENT_KEY: ${MIDTRANS_CLIENT_KEY}
    depends_on:
      db:
        condition: service_healthy
        restart: true
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/health/ready', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 12s
      timeout: 5s
      start_period: 30s
      retries: 3
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '1.5'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:-http://localhost:3000}
      NODE_ENV: production
    depends_on:
      backend:
        condition: service_healthy
        restart: true
    ports:
      - "3001:3000"
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 12s
      timeout: 5s
      start_period: 30s
      retries: 3
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M

volumes:
  pgdata:
    driver: local
```

### .env.example Template
```bash
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=stockus

# Backend
DATABASE_URL=postgresql://postgres:your_secure_password_here@db:5432/stockus

# Cloudflare R2
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name

# Midtrans
MIDTRANS_SERVER_KEY=your_server_key
MIDTRANS_CLIENT_KEY=your_client_key
MIDTRANS_IS_PRODUCTION=false

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Database Backup Script
```bash
#!/bin/bash
# Source: https://medium.com/codex/how-to-persist-and-backup-data-of-a-postgresql-docker-container-9fe269ff4334

# Backup PostgreSQL data from Docker volume
BACKUP_NAME="pgdata_backup_$(date +%Y%m%d_%H%M%S).tar.gz"

docker run --rm \
  -v pgdata:/data:ro \
  -v $(pwd):/backup \
  alpine \
  tar czf /backup/$BACKUP_NAME -C /data .

echo "Backup created: $BACKUP_NAME"

# Restore (when needed)
# docker run --rm \
#   -v pgdata:/data \
#   -v $(pwd):/backup \
#   alpine \
#   tar xzf /backup/$BACKUP_NAME -C /data
```

### Health Check Endpoint (Backend)
```typescript
// Source: https://patrickleet.medium.com/effective-docker-healthchecks-for-node-js-b11577c3e595
// backend/src/routes/health.ts
import { Hono } from 'hono'
import { db } from '../db'

const health = new Hono()

// Liveness probe - basic health check
health.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Readiness probe - check dependencies
health.get('/health/ready', async (c) => {
  try {
    // Check database connection
    await db.execute('SELECT 1')

    return c.json({
      status: 'ready',
      checks: {
        database: 'ok',
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return c.json(
      {
        status: 'not ready',
        checks: {
          database: 'error',
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      503
    )
  }
})

export default health
```

### Health Check Endpoint (Frontend)
```typescript
// frontend/app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single-stage Dockerfile | Multi-stage builds (3+ stages) | 2017 (Docker 17.05) | 70%+ image size reduction, standard practice |
| Alpine discouraged | Alpine preferred for Node.js | 2022-2023 | Node.js compatibility improved, now recommended |
| depends_on (basic) | depends_on with service_healthy | 2020 (Compose v3.4) | Eliminates race conditions, reliable startup |
| Manual cache layers | BuildKit cache mounts | 2019 (Docker 18.09) | Persistent cache across builds, much faster |
| Next.js full node_modules | Standalone output mode | 2021 (Next.js 12) | 60-70% smaller images, faster deploys |
| Docker Compose v2 (Python) | Docker Compose v2 (Go) | 2021 | Built into Docker CLI, faster, integrated |
| npm in Dockerfile | corepack for pnpm | 2022 (Node.js 16.9+) | No manual pnpm install, version-locked |
| .env committed | .env gitignored + .env.example | Always | Security standard, prevents credential leaks |
| Root user default | Non-root user standard | 2018+ | Security best practice, container hardening |

**Deprecated/outdated:**
- **Docker Compose v1 (docker-compose)**: Replaced by `docker compose` (v2, built into Docker CLI). Use `docker compose` not `docker-compose`.
- **links directive**: Replaced by automatic service discovery in user-defined networks. Remove links, use service names directly.
- **expose directive without ports**: Often misunderstood. Use `ports` to publish to host, `expose` is just documentation now.
- **version field in docker-compose.yml**: No longer required in Compose v2. Omit or use for documentation only.
- **node:XX (Debian/Ubuntu)**: Prefer node:XX-slim or node:XX-alpine for production (5-10x smaller).
- **HEALTHCHECK with curl/wget**: Use Node.js built-in http module to avoid extra dependencies.

## Open Questions

Things that couldn't be fully resolved:

1. **Traefik vs nginx for this specific stack**
   - What we know: Traefik offers auto-discovery, nginx is simpler and faster
   - What's unclear: Whether auto-discovery provides meaningful value for 2-3 static services
   - Recommendation: Start with nginx for simplicity unless planning dynamic scaling. Mark as optional; both are valid choices.

2. **Optimal resource limits for each service**
   - What we know: General guidance is 512M-1GB memory, 0.5-1.5 CPUs per service
   - What's unclear: Actual requirements depend on traffic patterns and data size
   - Recommendation: Start with conservative limits (512M memory, 1 CPU), monitor with `docker stats`, adjust based on actual usage. Include monitoring task in plan.

3. **PostgreSQL connection pooling in containerized environment**
   - What we know: STATE.md specifies 20 max connections, 30s idle timeout
   - What's unclear: Whether container restart affects connection pool state
   - Recommendation: Connection pool in backend, not pgBouncer container (additional complexity). Document that backend restart clears pool (expected behavior).

4. **Production vs development docker-compose files**
   - What we know: Best practice is separate docker-compose.prod.yml
   - What's unclear: Whether this project needs development containerization or just local dev (npm run dev)
   - Recommendation: Focus on production docker-compose.yml only. Local development uses `pnpm dev` directly, not Docker (faster, better DX on Mac/Windows).

## Sources

### Primary (HIGH confidence)
- [Docker Official Documentation - Multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
- [Docker Official Documentation - Startup order control](https://docs.docker.com/compose/how-tos/startup-order/)
- [Docker Official Documentation - Secrets in Compose](https://docs.docker.com/compose/how-tos/use-secrets/)
- [pnpm Official Documentation - Docker](https://pnpm.io/docker)
- [Next.js Official Example - with-docker](https://github.com/vercel/next.js/tree/canary/examples/with-docker)
- [PostgreSQL Official Image - Docker Hub](https://hub.docker.com/_/postgres/)
- [Docker Official Documentation - Resource constraints](https://docs.docker.com/engine/containers/resource_constraints/)
- [Docker Official Documentation - Build cache invalidation](https://docs.docker.com/build/cache/invalidation/)

### Secondary (MEDIUM confidence)
- [Medium - 4 Easy Docker Best Practices for Node.js (Jan 2026)](https://medium.com/@regansomi/4-easy-docker-best-practices-for-node-js-build-faster-smaller-and-more-secure-containers-151474129ac0)
- [TheLinuxCode - Next.js Docker Images (2026)](https://thelinuxcode.com/nextjs-docker-images-how-i-build-predictable-fast-deployments-in-2026/)
- [Phase Blog - Managing Secrets in Docker Compose](https://phase.dev/blog/docker-compose-secrets/)
- [Depot - Optimal Dockerfile for Node.js with pnpm](https://depot.dev/docs/container-builds/how-to-guides/optimal-dockerfiles/node-pnpm-dockerfile)
- [Medium - Effective Docker Healthchecks For Node.js](https://patrickleet.medium.com/effective-docker-healthchecks-for-node-js-b11577c3e595)
- [GitHub - Node.js Best Practices - Non-root user](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/security/non-root-user.md)
- [Dataquest - 5 Docker Compose Mistakes](https://dataquestio.medium.com/5-docker-compose-mistakes-that-will-break-your-production-pipeline-and-how-to-fix-them-5afe2ee68927)
- [Medium - How to persist and backup data of a PostgreSQL Docker container](https://medium.com/codex/how-to-persist-and-backup-data-of-a-postgresql-docker-container-9fe269ff4334)

### Tertiary (LOW confidence - for general context)
- [Medium - Why I Replaced NGINX with Traefik](https://blog.prateekjain.dev/why-i-replaced-nginx-with-traefik-in-my-docker-compose-setup-32f53b8ab2d8)
- [Various community blog posts on Docker Compose best practices](https://release.com/blog/6-docker-compose-best-practices-for-dev-and-prod)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Docker, Docker Compose, Alpine images are industry standard with official documentation
- Architecture: HIGH - Multi-stage builds, standalone output, health checks are verified from official sources
- Pitfalls: HIGH - Common mistakes documented across multiple authoritative sources with consistent recommendations

**Research date:** 2026-01-30
**Valid until:** 2026-04-30 (90 days - Docker ecosystem is mature and stable, practices change slowly)
