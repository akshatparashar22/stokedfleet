# ADR 005: Live Feed Generator & Simultaneous DB Tick Saving

**Status:** Accepted
**Date:** 2026-08-25
**Context:** Backend (`/backend`)

## Context and Problem Statement
The application requires simulating real-time vehicle telemetry for the live feed, while also persisting this telemetry history to the database. We needed a robust mechanism to generate these ticks, broadcast them over WebSockets for instant UI updates, and save them to the database without causing foreign key violations (e.g., ensuring vehicles exist before their telemetry is logged).

## Decision
We implemented a centralized `LiveFeedGenerator` utility.
1. The generator is responsible for creating per-vehicle telemetry data points (ticks).
2. Ticks are simultaneously broadcast to the frontend via WebSockets and persisted to the database.
3. We explicitly perform a vehicle `upsert` prior to the telemetry `upsert` within the generation flow to prevent database relational violations.

## Consequences
**Positive:**
- **Data Consistency:** Ensuring vehicles exist before telemetry prevents orphaned records and database crashes.
- **Unified Pipeline:** A single source of truth handles both real-time broadcasting and historical data storage.
- **Real-Time Accuracy:** The frontend displays the exact data points that are being logged to the database simultaneously.

**Negative:**
- **Database Load:** High-frequency tick generation causes a heavy write load on the database due to simultaneous upserts on every tick. This may require future optimization (e.g., batching) as the vehicle count scales.
