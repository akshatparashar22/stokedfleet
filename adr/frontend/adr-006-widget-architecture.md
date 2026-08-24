# ADR 006: Widget-Based Architecture

**Status:** Accepted
**Date:** 2026-08-25
**Context:** Frontend (`/frontend`)

## Context and Problem Statement
The dashboard became monolithic as new features (analytics, charts, maps) were added. To ensure maintainability and allow for potential customization in the future, the UI needed to be broken down into modular, reusable pieces.

## Decision
We transitioned the dashboard to a **Widget-based Architecture**, encapsulating distinct functionalities (e.g., Maps, Analytics Charts) into self-contained widgets.

## Consequences
**Positive:**
- **Modularity:** Highly decoupled components that are easy to test and maintain.
- **Extensibility:** Simple to add new widget types without impacting existing ones.
- **Customization:** Lays the groundwork for user-customizable dashboard layouts.

**Negative:**
- **State Management:** Requires careful orchestration of state between widgets and the global store.
