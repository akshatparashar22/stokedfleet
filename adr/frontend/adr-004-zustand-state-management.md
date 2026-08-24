# ADR 004: Zustand for State Management

**Status:** Accepted
**Date:** 2026-08-25
**Context:** Frontend (`/frontend`)

## Context and Problem Statement
As the frontend complexity grew, specifically with the introduction of user settings, managing state solely via React Context or Prop Drilling became cumbersome and negatively impacted performance due to unnecessary re-renders. We required a lightweight, scalable state management solution.

## Decision
We adopted **Zustand** for global state management. It provides a simplistic, hook-based API without the boilerplate associated with Redux or the context-hell of React Context.

## Consequences
**Positive:**
- **Simplicity:** Minimal boilerplate and straightforward API.
- **Performance:** Components only re-render on changes to the specific state they select.
- **Flexibility:** Easy to integrate outside of React components if necessary.

**Negative:**
- **Ecosystem:** Smaller ecosystem and fewer middleware tools compared to established libraries like Redux.
