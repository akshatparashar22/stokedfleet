# ADR 001: Enforce Prisma Migrate over DB Push (v5.x Architecture)

**Status:** Accepted  
**Date:** 2026-08-22  
**Context:** Backend (`/backend`)

## Context and Problem Statement
When setting up the database for new developers on the StokedFleet backend, there was ambiguity regarding whether to use `prisma db push` or `prisma migrate dev`. Additionally, executing `npx prisma` without ensuring local dependencies are installed can cause npm to fetch the latest major version (e.g., Prisma v7), which introduces breaking schema changes (such as deprecating the `url` string inside the `datasource` block).

## Decision
1. **Enforce `prisma migrate dev`:** All schema changes must be processed through `prisma migrate dev`. We explicitly prohibit the use of `prisma db push` for standard workflow. 
2. **Version Pinning:** We remain on Prisma v5.x (`^5.22.0`) to avoid the immediate breaking architectural changes introduced in Prisma v7 (which requires moving connection strings to `prisma.config.ts`).
3. **Setup Scripts:** We maintain a dedicated shell script (`scripts/setup-db.sh`) that dynamically resolves the local macOS `$USER` to handle Homebrew PostgreSQL quirks, ensuring consistent local database bootstrapping across different developer machines without manual role creation.

## Consequences

**Positive:**
- **Migration History:** Using `migrate dev` generates SQL files in the `prisma/migrations` folder, creating a reliable, version-controlled history of all database schema changes. This is critical for safely deploying to production environments.
- **Stability:** By pinning to v5 and running local binaries (via `npm run db:setup` which uses the local `node_modules`), we prevent accidental execution of v7 binaries that break the `schema.prisma` configuration.
- **Developer Experience:** The `setup-db.sh` script eliminates the "role postgres does not exist" error commonly encountered on macOS.

**Negative:**
- Developers must remember to run `npm install` before executing Prisma commands to ensure the correct v5 binary is used.
- `prisma migrate dev` is slightly slower and stricter than `prisma db push`, requiring developers to resolve migration drift if they manually edit the database outside of Prisma.
