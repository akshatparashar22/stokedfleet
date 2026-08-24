# ADR 001: Implement Route-Level Lazy Loading (Code Splitting)

**Status:** Accepted  
**Date:** 2026-08-22  
**Context:** Frontend (`/frontend`)

## Context and Problem Statement
StokedFleet is a real-time fleet telemetry application. Over time, the dashboard is expected to grow significantly in size, incorporating complex data visualization tools, charting libraries (like Recharts or Chart.js), and potentially map rendering components. If we bundle the entire application into a single JavaScript payload during the Vite build process, users will be forced to download all of these heavy dependencies just to view the initial `Login` screen. This results in a slow initial page load and degraded User Experience (UX), especially on mobile or slower networks.

## Decision
We will implement Route-Level Lazy Loading (Code Splitting) using React's native `lazy()` and `<Suspense>` boundary features in combination with `react-router-dom`. 

1. The routing logic has been decoupled into a dedicated `AppRouter` component.
2. Route definitions (like `/dashboard` and `/`) dynamically import their respective Page components (`import('./pages/Dashboard')`).
3. A global `<Suspense>` fallback (a branded loading spinner) wraps the route tree to provide immediate feedback while the specific chunk for the requested page is being downloaded.

## Consequences

**Positive:**
- **Drastically Reduced Initial Bundle Size:** The initial payload sent to the browser only contains the core layout, routing logic, and the `Login` page chunks. Heavy dashboard logic is deferred.
- **Improved Performance Metrics:** Time-to-Interactive (TTI) and First Contentful Paint (FCP) on the entry point are minimized.
- **Efficient Caching:** As updates are made to the `Dashboard` code, the `Login` chunk remains cached by the browser unless it specifically changes, saving bandwidth on subsequent visits.

**Negative:**
- **Minor Navigational Delay:** Navigating to a lazy-loaded route for the very first time requires a network request to fetch the component chunk, introducing a brief loading state. 
- **Tooling Overhead:** Requires ensuring all lazy-loaded pages are exported correctly (usually requiring default exports, or explicitly mapping named exports in the `lazy()` call).
