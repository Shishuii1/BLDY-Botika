# PharmaSys System Architecture

## Overview

PharmaSys is a multi-tier pharmacy management system:

```
┌─────────────┐     ┌─────────────┐
│  Web (Vite) │     │ Mobile Expo │
└──────┬──────┘     └──────┬──────┘
       │    REST + WS      │
       └────────┬──────────┘
                ▼
       ┌─────────────────┐
       │ Express API     │
       │ (Node.js)       │
       └────────┬────────┘
                ▼
       ┌─────────────────┐
       │ MySQL           │
       └─────────────────┘
```

## Patterns

- **Clean Architecture** — Controllers → Services → Models
- **MVC** — Routes, controllers, models separated
- **REST API** — JSON over HTTP
- **Real-time** — Socket.io for inventory & notifications

## Folder Map

See root [README.md](../README.md) for the complete folder structure.
