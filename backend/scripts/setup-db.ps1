# ============================================================
# StokedFleet — Local Database Setup (Windows PowerShell)
# ============================================================
# Prerequisites: PostgreSQL installed and `psql` available on PATH.
#
# Usage (run from the backend directory):
#   .\scripts\setup-db.ps1
#
# This script will:
#   1. Create the PostgreSQL user (if it doesn't exist)
#   2. Create the database (if it doesn't exist)
#   3. Grant privileges
# ============================================================

param(
    [string]$DbUser     = "stokedfleet_user",
    [string]$DbPassword = "stokedfleet_pass",
    [string]$DbName     = "stokedfleet",
    [string]$DbHost     = "localhost",
    [string]$DbPort     = "5432",
    [string]$PgUser     = "postgres"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "StokedFleet - Database Setup" -ForegroundColor Cyan
Write-Host "================================"
Write-Host "  Host:     ${DbHost}:${DbPort}"
Write-Host "  Database: $DbName"
Write-Host "  User:     $DbUser"
Write-Host ""

# ---------- Locate psql ----------
$psqlCmd = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlCmd) {
    Write-Host "ERROR: psql not found on PATH." -ForegroundColor Red
    Write-Host "Install PostgreSQL and ensure psql is in your PATH." -ForegroundColor Red
    Write-Host "  Download: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

# ---------- Create user ----------
Write-Host "-> Creating PostgreSQL user '$DbUser' (if not exists)..." -ForegroundColor Yellow
$userExists = & psql -h $DbHost -p $DbPort -U $PgUser -tAc "SELECT 1 FROM pg_roles WHERE rolname = '$DbUser'" 2>$null
if ($userExists -ne "1") {
    & psql -h $DbHost -p $DbPort -U $PgUser -c "CREATE USER $DbUser WITH PASSWORD '$DbPassword' CREATEDB;"
    Write-Host "  + User created" -ForegroundColor Green
} else {
    Write-Host "  + User already exists" -ForegroundColor Green
}

# ---------- Create database ----------
Write-Host "-> Creating database '$DbName' (if not exists)..." -ForegroundColor Yellow
$dbExists = & psql -h $DbHost -p $DbPort -U $PgUser -tAc "SELECT 1 FROM pg_database WHERE datname = '$DbName'" 2>$null
if ($dbExists -ne "1") {
    & psql -h $DbHost -p $DbPort -U $PgUser -c "CREATE DATABASE $DbName OWNER $DbUser;"
    Write-Host "  + Database created" -ForegroundColor Green
} else {
    Write-Host "  + Database already exists" -ForegroundColor Green
}

# ---------- Grant privileges ----------
Write-Host "-> Granting privileges..." -ForegroundColor Yellow
& psql -h $DbHost -p $DbPort -U $PgUser -c "GRANT ALL PRIVILEGES ON DATABASE $DbName TO $DbUser;"
Write-Host "  + Privileges granted" -ForegroundColor Green

Write-Host ""
Write-Host "Database created! Next steps:" -ForegroundColor Cyan
Write-Host "  1. Add DATABASE_URL to your backend/.env (see README)"
Write-Host "  2. Run 'npx prisma migrate dev' to sync the schema"
Write-Host "  3. Run 'npm run dev' to start the backend"
Write-Host ""
