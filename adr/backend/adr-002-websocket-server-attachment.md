# ADR 002: Shared HTTP/WebSocket Server Architecture

**Status:** Accepted  
**Date:** 2026-08-22  
**Context:** Backend (`/backend`)

## Context and Problem Statement
StokedFleet requires a traditional REST API for authentication and static data (managed by Express) alongside a persistent, real-time bidirectional communication channel for live telemetry data (managed by `ws`). 
We needed to decide whether to run the WebSocket server on a distinct, separate port from the Express REST API, or to attach both protocols to the same underlying Node.js HTTP server.

## Decision
We decided to attach the WebSocket server directly to the same underlying Node.js `http.Server` instance that serves the Express application.

1. In `src/index.ts`, we explicitly construct the server using `createServer(app)` instead of relying on `app.listen()`.
2. The `initWebSocket(server)` function then binds the `ws` instance to that exact same server instance, allowing it to hook into the `upgrade` events on the same port.

## Consequences

**Positive:**
- **Simplified Deployment:** We only need to expose a single port (e.g., 3000) for the backend service. We do not have to configure reverse proxies or firewalls to allow traffic on multiple ports.
- **Unified Domain/CORS:** Both standard API requests (`http://`) and WebSocket connections (`ws://`) share the exact same domain and port, heavily simplifying frontend CORS and environment variables (e.g. `VITE_API_URL` acts as a single source of truth).
- **Reduced Overhead:** Running a single HTTP server consumes marginally less memory and OS resources than instantiating two separate listeners.

**Negative:**
- **Scaling Complexity:** If real-time telemetry throughput becomes massive, we cannot vertically scale the WebSocket server independently of the REST API. If this occurs, we will need to rewrite the architecture to isolate the WebSocket processes.
