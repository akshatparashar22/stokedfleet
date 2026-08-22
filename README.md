# Fleet Telemetry Dashboard

This is the monorepo for the Fleet / Vehicle Telemetry Dashboard, built as part of the Full-Stack Recruitment Task.

## Project Structure

- `frontend/`: React + TypeScript application powered by Vite.
- `backend/`: Node.js + Express backend server.
- `shared/`: Shared TypeScript types used by both frontend and backend.

## Prerequisites

- **Node.js** (v18+)
- **PostgreSQL** (v15+) — installed locally with `psql` available on PATH

## Getting Started

### 1. Database Setup

Run the setup script to create the PostgreSQL user and database:

**Windows (PowerShell):**

```powershell
cd backend
.\scripts\setup-db.ps1
```

**Linux / macOS:**

```bash
cd backend
chmod +x scripts/setup-db.sh
./scripts/setup-db.sh
```

> The scripts accept optional parameters to override defaults. Run with `--help` or check the script header for details.

### 2. Configure Environment

Create (or update) `backend/.env` with the following:

```env
PORT=3000
CORS_ORIGIN=http://localhost:5173
DATABASE_URL="postgresql://stokedfleet_user:stokedfleet_pass@localhost:5432/stokedfleet?schema=public"
```

> Adjust the `DATABASE_URL` if you used custom values during database setup.

### 3. Backend

```bash
cd backend
npm install
npx prisma migrate dev    # create and apply migrations
npm run dev
```

The backend will run on `http://localhost:3000`

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

Once both are running, you can test the backend connection by clicking the "Test Backend Connection" button on the frontend's main page.
