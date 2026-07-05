# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Build arguments from Coolify
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL
ARG NEXT_PUBLIC_APP_URL
ARG DATABASE_URL

# Environment variables for build
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV DATABASE_URL=${DATABASE_URL}
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Install OpenSSL for Prisma postinstall
RUN apk add --no-cache openssl

# Copy package files FIRST for layer caching
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (cached unless package.json changes)
# Use --ignore-scripts to skip prisma postinstall (downloads engine binary)
# Engine binary is downloaded separately below for better reliability
RUN for i in 1 2 3 4 5; do \
  echo "npm ci attempt $i of 5..." && \
  npm ci --ignore-scripts --network-timeout 300000 --maxsockets 3 && break || \
  echo "npm ci attempt $i failed, retrying in 30s..." && sleep 30; \
  done

# Copy source code
COPY . .

# Generate Prisma client and download engine binary (separate step with retry)
# This separates the heavy download from npm ci for reliability on slow networks
RUN for i in 1 2 3 4 5; do \
  echo "prisma generate attempt $i of 5..." && \
  npx prisma generate && break || \
  echo "prisma generate attempt $i failed, retrying in 30s..." && sleep 30; \
  done

# Build application (skip lint for speed)
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install OpenSSL for Prisma and curl for healthcheck
RUN apk add --no-cache openssl curl

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy prisma files and seed
COPY --from=builder /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Copy runtime deps: prisma CLI, tsx, bcryptjs, zod
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/.bin ./node_modules/.bin
COPY --from=builder /app/node_modules/tsx ./node_modules/tsx
COPY --from=builder /app/node_modules/esbuild ./node_modules/esbuild
COPY --from=builder /app/node_modules/@esbuild ./node_modules/@esbuild
COPY --from=builder /app/node_modules/typescript ./node_modules/typescript
COPY --from=builder /app/node_modules/bcryptjs ./node_modules/bcryptjs
COPY --from=builder /app/node_modules/@types ./node_modules/@types
COPY --from=builder /app/node_modules/zod ./node_modules/zod

# Copy entrypoint
COPY --from=builder /app/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=5 \
  CMD curl -f http://localhost:3000/api/health || exit 1

ENTRYPOINT ["/bin/sh", "/app/entrypoint.sh"]
