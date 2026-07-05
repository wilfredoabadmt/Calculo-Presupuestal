#!/bin/sh
set -e

echo "=== Calculo Presupuestal - Starting ==="

# Run Prisma db push (creates tables if they don't exist)
echo "[1/3] Running Prisma db push..."
if npx prisma db push --skip-generate --accept-data-loss 2>&1; then
  echo "  → DB push OK"
else
  echo "  → WARNING: db push failed on first try, retrying in 3s..."
  sleep 3
  if npx prisma db push --skip-generate --accept-data-loss 2>&1; then
    echo "  → DB push OK (retry)"
  else
    echo "  → ERROR: DB push failed twice. App may not work."
  fi
fi

# Seed database (users, materials, dosificaciones)
echo "[2/3] Seeding database..."
if npx tsx prisma/seed.ts 2>&1; then
  echo "  → Seed OK"
else
  echo "  → WARNING: Seed failed (may already exist)"
fi

echo "[3/3] Starting Next.js server..."
exec node server.js
