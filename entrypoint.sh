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

# Seeds (idempotentes): se auto-omiten si la data ya existe.
# Fuerza el re-sembrado con SEED_FORCE=true en las variables de entorno.
echo "[2/3] Seeding database (condicional)..."
if npx tsx prisma/seed.ts 2>&1; then
  echo "  → Seed OK"
else
  echo "  → WARNING: Seed failed (may already exist)"
fi

# Seed banco de precios (import de Excel; se omite si ya está importado)
echo "[2.5/3] Importing Banco de Precios from Excel (condicional)..."
if npx tsx prisma/seed-banco-precios.ts 2>&1; then
  echo "  → Banco de Precios OK"
else
  echo "  → WARNING: Banco de Precios import failed"
fi

# Migrate Workspaces (se omite si no hay usuarios sin espacio de trabajo)
echo "[2.7/3] Migrating User Workspaces (condicional)..."
if npx tsx prisma/migrate-workspaces.ts 2>&1; then
  echo "  → Workspace migration OK"
else
  echo "  → WARNING: Workspace migration failed"
fi

echo "[3/3] Starting Next.js server..."
exec node server.js
