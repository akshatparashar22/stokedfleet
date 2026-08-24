# ADR 005: Leaflet for Map Rendering

**Status:** Accepted
**Date:** 2026-08-25
**Context:** Frontend (`/frontend`)

## Context and Problem Statement
The application requires a robust map rendering solution to display live vehicle telemetry, routes, and geographic data. We needed a library that is performant, open-source, and easy to integrate with React.

## Decision
We chose **Leaflet** (via React-Leaflet or standard integration) to handle map rendering and predictable route mapping.

## Consequences
**Positive:**
- **Performance:** Lightweight and optimized for smooth interactions.
- **Open Source:** No vendor lock-in compared to proprietary solutions like Google Maps.
- **Ecosystem:** Rich ecosystem of plugins and community support.

**Negative:**
- **Complex UI:** Integrating complex React state with Leaflet's imperative API can sometimes require bridging abstractions.
