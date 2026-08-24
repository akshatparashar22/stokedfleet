# ADR 001: Dockerization

**Status:** Accepted
**Date:** 2026-08-25
**Context:** Global

## Context and Problem Statement
To ensure consistent execution environments across development, testing, and production, and to simplify the onboarding process for new developers, we needed a standardized deployment artifact. Previously, the application was dependent on the host machine's specific Node.js and database configurations.

## Decision
We decided to Dockerize the application. This encompasses both the frontend and backend services, as well as necessary dependencies like the Prisma client (which requires OpenSSL in the Docker image).

## Consequences
**Positive:**
- **Consistency:** Guaranteed parity between environments.
- **Portability:** Simplifies deployment to any cloud provider supporting Docker containers.
- **Onboarding:** Reduces setup time for new developers.

**Negative:**
- **Complexity:** Adds Docker as a dependency and introduces container lifecycle management overhead.
