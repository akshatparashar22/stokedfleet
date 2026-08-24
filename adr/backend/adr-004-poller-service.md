# ADR 004: Poller Service for Settings

**Status:** Accepted
**Date:** 2026-08-25
**Context:** Backend (`/backend`)

## Context and Problem Statement
Certain features, such as user settings updates and aggregated data syncs, require background synchronization. Establishing and managing persistent WebSocket connections for low-frequency updates can be overkill and resource-intensive.

## Decision
We implemented a dedicated **Poller Service** for handling intermittent, settings-based polling. This service manages aggregated data fetching separately from the high-frequency real-time telemetry WebSocket.

## Consequences
**Positive:**
- **Resource Efficiency:** Reduces overhead compared to maintaining persistent connections for low-frequency tasks.
- **Separation of Concerns:** Decouples background sync logic from the core telemetry WebSocket engine.

**Negative:**
- **Latency:** Inherent delay compared to instant WebSocket pushes.
