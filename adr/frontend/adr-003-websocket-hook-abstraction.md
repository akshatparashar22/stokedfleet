# ADR 003: WebSocket Hook Abstraction (`useWebSocket`)

**Status:** Accepted  
**Date:** 2026-08-22  
**Context:** Frontend (`/frontend`)

## Context and Problem Statement
StokedFleet relies heavily on real-time telemetry data streamed from the backend. Integrating native browser `WebSocket` APIs directly into UI components (like the Dashboard) leads to bloated components. It mixes side-effect management (connection establishment, teardown, exponential backoff/reconnection logic) with UI rendering logic, violating the Single Responsibility Principle.

## Decision
We abstract all WebSocket lifecycle management into a custom React Hook (`hooks/useWebSocket.ts`). 

1. Components that require real-time data simply invoke `const { lastMessage, isConnected } = useWebSocket()`.
2. The hook internally handles the `useEffect` required to instantiate the `WebSocket` object.
3. The hook attaches event listeners for `onmessage`, `onopen`, and `onclose`, and cleans them up when the component unmounts to prevent memory leaks.

## Consequences

**Positive:**
- **Separation of Concerns:** UI components remain pure and focused solely on rendering data.
- **Reusability:** Any component in the application can subscribe to real-time updates simply by calling the hook.
- **Maintainability:** Advanced features (like JWT authentication over WS, or auto-reconnection logic) can be implemented in a single place without touching the UI components.

**Negative:**
- **Multiple Connections:** If multiple distinct components mount and call `useWebSocket()` simultaneously, it may open multiple independent WebSocket connections to the server. If this becomes a bottleneck, the hook will need to be refactored to utilize a Singleton pattern or a React Context provider to share a single connection across the app.
