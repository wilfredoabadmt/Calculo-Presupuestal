#!/bin/sh
set -e

echo "=== Calculo Presupuestal - Starting ==="
echo "Node: $(node -v)"
echo "npm: $(npm -v)"

# Diagnostic check for database connectivity
node -e "
const dns = require('dns');
const net = require('net');
const url = process.env.DATABASE_URL;
if (!url) {
  console.error('ERROR: DATABASE_URL is not set.');
  process.exit(1);
}
try {
  const parsed = new URL(url);
  console.log('Database URL parsed successfully. Host:', parsed.hostname, 'Port:', parsed.port || 5432);
  dns.lookup(parsed.hostname, (err, address) => {
    if (err) {
      console.error('  → DNS Lookup failed for ' + parsed.hostname + ':', err.message);
      process.exit(1);
    } else {
      console.log('  → DNS resolved ' + parsed.hostname + ' to ' + address);
      const socket = new net.Socket();
      socket.setTimeout(2000); // 2 seconds timeout
      socket.on('connect', () => {
        console.log('  → TCP connection to ' + parsed.hostname + ':' + (parsed.port || 5432) + ' was SUCCESSFUL!');
        socket.destroy();
      }).on('timeout', () => {
        console.error('  → TCP connection to ' + parsed.hostname + ':' + (parsed.port || 5432) + ' TIMED OUT.');
        socket.destroy();
        process.exit(1);
      }).on('error', (e) => {
        console.error('  → TCP connection to ' + parsed.hostname + ':' + (parsed.port || 5432) + ' FAILED:', e.message);
        process.exit(1);
      }).connect(parsed.port || 5432, address);
    }
  });
} catch (e) {
  console.error('  → Failed to parse DATABASE_URL:', e.message);
  process.exit(1);
}
"

# Run Prisma db push (creates tables if they don't exist)
echo "[1/3] Running Prisma db push..."
if npx prisma db push --skip-generate --accept-data-loss 2>&1; then
  echo "  → DB push OK"
else
  echo "  → WARNING: db push failed on first try, retrying in 5s..."
  sleep 5
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
