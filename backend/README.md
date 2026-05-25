# PharmaSys Backend

Node.js + Express REST API for PharmaSys.

## Structure

- `src/config/` — Database, env, Cloudinary, Socket.io
- `src/controllers/` — Request handlers (MVC)
- `src/models/` — Data models
- `src/routes/` — API routes
- `src/middleware/` — Auth, validation, errors
- `src/services/` — Business logic
- `src/utils/` — Helpers, PDF, barcodes
- `src/validations/` — Request schemas
- `src/sockets/` — Real-time handlers
- `src/jobs/` — Scheduled tasks

## Setup

```bash
npm install
cp .env.example .env   # or edit .env
npm run dev
```

See [../docs/INSTALLATION_GUIDE.md](../docs/INSTALLATION_GUIDE.md) for full setup.
