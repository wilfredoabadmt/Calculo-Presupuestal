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
ENV NODE_OPTIONS="--max-old-space-size=1024"

# Install OpenSSL and CA Certificates for Prisma/node SSL requests
RUN apk add --no-cache openssl ca-certificates

# Copy package files FIRST for layer caching
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (cached unless package.json changes)
RUN npm ci --ignore-scripts --network-timeout 600000

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Prepare runtime dependencies (avoid '@' in COPY paths for Coolify parser)
RUN mkdir -p /app/rt-deps && \
  cp -r /app/node_modules/.prisma /app/rt-deps/dot-prisma && \
  cp -r /app/node_modules/@prisma /app/rt-deps/at-prisma && \
  cp -r /app/node_modules/prisma /app/rt-deps/prisma && \
  cp -r /app/node_modules/.bin /app/rt-deps/bin && \
  cp -r /app/node_modules/tsx /app/rt-deps/tsx && \
  cp -r /app/node_modules/esbuild /app/rt-deps/esbuild && \
  cp -r /app/node_modules/@esbuild /app/rt-deps/at-esbuild && \
  cp -r /app/node_modules/typescript /app/rt-deps/typescript && \
  cp -r /app/node_modules/bcryptjs /app/rt-deps/bcryptjs && \
  cp -r /app/node_modules/@types /app/rt-deps/at-types && \
  cp -r /app/node_modules/zod /app/rt-deps/zod && \
  cp -r /app/node_modules/get-tsconfig /app/rt-deps/get-tsconfig && \
  cp -r /app/node_modules/resolve-pkg-maps /app/rt-deps/resolve-pkg-maps && \
  (cp -r /app/node_modules/@prisma/engines /app/rt-deps/prisma-engines 2>/dev/null || true)

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install OpenSSL for Prisma and curl for healthcheck
RUN apk add --no-cache openssl curl && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy prisma files
COPY --from=builder /app/prisma ./prisma

# Copy prepared runtime dependencies
COPY --from=builder --chown=nextjs:nodejs /app/rt-deps /app/rt-deps

# Restore runtime dependencies to node_modules
RUN mkdir -p /app/node_modules && \
  rm -rf /app/node_modules/.prisma /app/node_modules/@prisma /app/node_modules/prisma /app/node_modules/.bin /app/node_modules/tsx /app/node_modules/esbuild /app/node_modules/@esbuild /app/node_modules/typescript /app/node_modules/bcryptjs /app/node_modules/@types /app/node_modules/zod /app/node_modules/get-tsconfig /app/node_modules/resolve-pkg-maps && \
  mv /app/rt-deps/dot-prisma /app/node_modules/.prisma && \
  mv /app/rt-deps/at-prisma /app/node_modules/@prisma && \
  mv /app/rt-deps/prisma /app/node_modules/prisma && \
  mv /app/rt-deps/bin /app/node_modules/.bin && \
  mv /app/rt-deps/tsx /app/node_modules/tsx && \
  mv /app/rt-deps/esbuild /app/node_modules/esbuild && \
  mv /app/rt-deps/at-esbuild /app/node_modules/@esbuild && \
  mv /app/rt-deps/typescript /app/node_modules/typescript && \
  mv /app/rt-deps/bcryptjs /app/node_modules/bcryptjs && \
  mv /app/rt-deps/at-types /app/node_modules/@types && \
  mv /app/rt-deps/zod /app/node_modules/zod && \
  mv /app/rt-deps/get-tsconfig /app/node_modules/get-tsconfig && \
  mv /app/rt-deps/resolve-pkg-maps /app/node_modules/resolve-pkg-maps && \
  (test -d /app/rt-deps/prisma-engines && mkdir -p /app/node_modules/@prisma/engines && cp -r /app/rt-deps/prisma-engines/* /app/node_modules/@prisma/engines/ || true) && \
  rm -rf /app/rt-deps

# Copy entrypoint
COPY --from=builder /app/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

ENTRYPOINT ["/bin/sh", "/app/entrypoint.sh"]
