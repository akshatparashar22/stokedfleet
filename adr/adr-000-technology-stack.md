# ADR 000: Core Technology Stack Selection

**Status:** Accepted  
**Date:** 2026-08-22  
**Context:** Full-Stack (StokedFleet)

## Context and Problem Statement
StokedFleet requires a modern, scalable, and highly performant architecture capable of handling persistent real-time data streaming (fleet telemetry) while maintaining a robust, type-safe development environment. We needed to select a core technology stack that balances rapid iteration, ecosystem maturity, and real-time networking capabilities.

## Decision
We selected the following full-stack architecture, united by **TypeScript** across both environments to guarantee end-to-end type safety:

### Frontend
- **React 19:** Chosen for its declarative UI paradigm and massive ecosystem. React's component-based architecture is ideal for building modular dashboard widgets.
- **Vite:** Selected over Create React App or Webpack for its near-instant Hot Module Replacement (HMR) and significantly faster build times leveraging ES modules.
- **Tailwind CSS v4:** Chosen for utility-first styling. The v4 release eliminates `tailwind.config.js` overhead, offering native CSS `@theme` variables which perfectly accommodate our custom retro/pixel-art brand identity without bloated configuration files.
- **React Router:** The industry standard for client-side routing, enabling us to implement code-splitting/lazy-loading for heavy telemetry dashboard components.

### Backend
- **Node.js runtime with Express.js (v5):** Node's event-driven, non-blocking I/O model is uniquely suited for maintaining thousands of concurrent WebSocket connections. Express 5 provides native Promise/async-await support without requiring external wrapper libraries.
- **`ws` (WebSockets):** Chosen over Socket.io for its raw performance, minimal overhead, and standard compliance. Since we only need one-way/two-way telemetry streaming, the overhead of Socket.io's polling fallbacks was deemed unnecessary.
- **Prisma ORM (v5):** Selected for its industry-leading TypeScript integration. Prisma's auto-generated client ensures database queries are strictly typed, preventing runtime SQL errors.
- **PostgreSQL:** A highly robust, ACID-compliant relational database. It provides excellent support for time-series data and JSONB, which are critical for storing complex fleet telemetry payloads.

## Consequences

**Positive:**
- **Language Unification:** Using TypeScript on both ends allows developers to context-switch effortlessly and potentially share interface definitions (`/shared`) between the API and the client.
- **High Concurrency:** Node.js paired with raw WebSockets provides excellent throughput for live data streaming without choking the server.
- **Developer Velocity:** Vite, Tailwind v4, and Prisma ORM offer some of the best developer experiences in the modern web ecosystem, drastically reducing boilerplate and setup time.

**Negative:**
- **Node.js Single Threading:** While great for I/O, if we need to perform heavy CPU-bound computations on the telemetry data (e.g., complex ML predictions on the fly), Node.js's main thread may block. We will need to offload such tasks to Worker Threads or a separate microservice in the future.
