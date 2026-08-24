# Fleet Telemetry Dashboard

A real-time fleet and vehicle telemetry dashboard built to monitor, analyze, and alert on vehicle health and operational status.

The application ingests live telemetry streams, provides aggregated historical data polling, and offers a fully responsive, themed interface for fleet managers and drivers to oversee their vehicles.

## Overview

This repository contains a full-stack monorepo structured into three main packages:

- `frontend/`: A React Single-Page Application (SPA) built with TypeScript, Vite, Tailwind CSS, and Zustand. It handles live WebSocket data and periodic polling to render real-time charts, metrics, and alerts.
- `backend/`: A Node.js and Express API built with TypeScript. It manages authentication, serves historical metrics, and pushes live vehicle telemetry to connected clients via WebSockets.

## Features

- **Live Telemetry Stream**: Real-time vehicle tracking, speed, fuel, and engine temperature updates via WebSockets.
- **Aggregated Analytics**: Historical trends and summary metrics fetched periodically from the REST API.
- **Alerting System**: Automated threshold-based alerts (e.g., critical engine temperatures, low fuel) generated and synced to the dashboard.
- **Multi-tenant Auth**: Secure session management supporting different roles (Driver, Fleet Manager).
- **Theming & Preferences**: Full dark/light mode support and configurable dashboard widgets saved to user preferences.
- **Interactive UI**: Rich charts, filtering, and micro-animations driven by Framer Motion and Recharts.

## Getting Started

To get the project running locally, refer to the [Setup Guide](docs/setup.md) which includes instructions for both Docker (recommended) and manual local setups.

## Tech Stack

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Zustand, Framer Motion, Recharts, React Leaflet  
**Backend:** Node.js, Express, TypeScript, Prisma ORM, WebSocket (`ws`), JWT  
**Database:** PostgreSQL 15+

## License

This project is licensed under the MIT License.
