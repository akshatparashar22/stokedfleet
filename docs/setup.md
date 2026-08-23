# Setup Guide

This guide walks you through setting up the Fleet Telemetry Dashboard on your local machine.

## Prerequisites
- **Docker** and **Docker Compose** (Recommended)
- **Node.js** (v18+) (For local development)
- **PostgreSQL** (v15+) (For local development)

---

## 🐳 Option 1: Docker Setup (Recommended)

The easiest way to get the application running is using Docker. This will spin up the database, backend, and frontend containers automatically.

1. **Clone the repository and navigate to the project root.**

2. **Run Docker Compose:**
   ```bash
   docker compose up --build
   ```
   *This command builds the images and starts the containers in the foreground. If you prefer to run them in the background, use `docker compose up -d --build`.*

3. **Access the application:**
   - Frontend: [http://localhost:8080](http://localhost:8080)
   - Backend API: [http://localhost:3000](http://localhost:3000)

The backend will automatically apply database migrations on startup. 

---

## 💻 Option 2: Local Setup (Manual)

If you prefer to run the application locally without Docker, follow these steps.

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
Create a `.env` file in the `backend` directory (if it doesn't exist) with the following:

```env
PORT=3000
CORS_ORIGIN=http://localhost:5173
DATABASE_URL="postgresql://stokedfleet_user:stokedfleet_pass@localhost:5432/stokedfleet?schema=public"
JWT_SECRET="your_secure_jwt_secret"
```
> Adjust the `DATABASE_URL` if you used custom values during database setup.

### 3. Start the Backend
Open a terminal and run:
```bash
cd backend
npm install
npx prisma migrate dev    # create and apply migrations
npm run dev
```
The backend will run on `http://localhost:3000`.

### 4. Start the Frontend
Open a new terminal window and run:
```bash
cd frontend
npm install
npm run dev
```
The frontend will run on `http://localhost:5173`.

### 5. Verify Setup
Once both servers are running, navigate to the frontend URL and you can test the backend connection using the UI.
