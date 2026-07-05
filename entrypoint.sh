#!/bin/sh
set -e

echo "=== Cálculo Presupuestal - Starting ==="

# Run Prisma db push (creates tables if they don't exist)
echo "[1/3] Running Prisma db push..."
npx prisma db push --skip-generate --accept-data-loss 2>&1 || {
  echo "WARNING: prisma db push failed, trying again in 5s..."
  sleep 5
  npx prisma db push --skip-generate --accept-data-loss 2>&1 || true
}

# Seed database (users, materials, dosificaciones)
echo "[2/3] Seeding database..."
npx tsx prisma/seed.ts 2>&1 || {
  echo "WARNING: Seed failed (may already exist)"
}

echo "[3/3] Starting Next.js server..."
exec node server.js
