#!/usr/bin/env bash
# ============================================================
# StokedFleet — Local Database Setup (Linux / macOS)
# ============================================================
# Prerequisites: PostgreSQL installed and `psql` available on PATH.
#
# Usage:
#   chmod +x scripts/setup-db.sh
#   ./scripts/setup-db.sh
#
# This script will:
#   1. Create the PostgreSQL user (if it doesn't exist)
#   2. Create the database (if it doesn't exist)
#   3. Grant privileges
# ============================================================

set -euo pipefail

# ---------- Configuration ----------
DB_USER="${DB_USER:-stokedfleet_user}"
DB_PASSWORD="${DB_PASSWORD:-stokedfleet_pass}"
DB_NAME="${DB_NAME:-stokedfleet}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

echo ""
echo "🚀 StokedFleet — Database Setup"
echo "================================"
echo "  Host:     $DB_HOST:$DB_PORT"
echo "  Database: $DB_NAME"
echo "  User:     $DB_USER"
echo ""

# ---------- Create user ----------
echo "→ Creating PostgreSQL user '$DB_USER' (if not exists)..."
psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -tc \
  "SELECT 1 FROM pg_roles WHERE rolname = '$DB_USER'" \
  | grep -q 1 \
  || psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -c \
    "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD' CREATEDB;"

echo "  ✔ User ready"

# ---------- Create database ----------
echo "→ Creating database '$DB_NAME' (if not exists)..."
psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -tc \
  "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" \
  | grep -q 1 \
  || psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -c \
    "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

echo "  ✔ Database ready"

# ---------- Grant privileges ----------
echo "→ Granting privileges..."
psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -c \
  "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
echo "  ✔ Privileges granted"

echo ""
echo "✅ Database created! Next steps:"
echo "   1. Add DATABASE_URL to your backend/.env (see README)"
echo "   2. Run 'npx prisma db push' to sync the schema"
echo "   3. Run 'npm run dev' to start the backend"
echo ""
