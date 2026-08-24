# ADR 003: Centralized Express Error Handling (`AppError`)

**Status:** Accepted  
**Date:** 2026-08-22  
**Context:** Backend (`/backend`)

## Context and Problem Statement
In standard Express.js applications, handling errors inconsistently across different route controllers leads to fragmented client-side logic. If one route returns `res.status(400).send("Bad request")` and another returns `res.status(500).json({ error: "DB crash" })`, the frontend must implement highly defensive parsing logic to handle all possible error response shapes. Furthermore, unhandled exceptions can crash the Node process or leak sensitive stack traces to the client in production.

## Decision
We implemented a Centralized Error Handling architecture using a custom `AppError` class and a global Express error-handling middleware (`src/middleware/errorHandler.ts`).

1. **`AppError` Class**: All expected, operational errors (e.g., validation failures, resource not found, unauthorized) must throw an `AppError` with a specific HTTP status code and message.
2. **Global Middleware**: The `errorHandler` middleware catches all errors passed to `next(err)`. 
3. **Unified Response Shape**: The middleware guarantees that the frontend will *always* receive a JSON payload in the shape of `{ status: 'error', message: string }`, regardless of where the error originated.
4. **Stack Trace Hiding**: For unexpected, non-operational errors (e.g., a TypeError or DB connection failure), the middleware logs the stack trace to the server console but sends a generic `500 Internal server error` to the client to prevent security leaks.

## Consequences

**Positive:**
- **Predictable Client Contracts:** The frontend can blindly rely on `response.data.message` existing whenever an HTTP error status is encountered.
- **Cleaner Controllers:** Route controllers no longer need to manually construct `res.status().json()` for every failure mode; they can simply `throw new AppError(404, "Vehicle not found")` and let the middleware handle the formatting.
- **Secure by Default:** Stack traces and sensitive database crash logs are inherently prevented from reaching the client.

**Negative:**
- **Async Route Catching:** Express 5 handles async errors natively, but if downgraded or writing complex Promise chains, developers must remember to pass the error to `next(err)` for the middleware to catch it.
