# PharmaSys Installation Guide

## Prerequisites

- Node.js 18+
- MySQL 8+
- npm or yarn
- Expo CLI (for mobile)

## 1. Clone & install

```bash
cd PharmaSys
```

### Backend

```bash
cd backend
npm install
cp .env.example .env   # or edit .env with DB credentials
```

### Web

```bash
cd web
npm install
```

### Mobile

```bash
cd mobile
npm install
```

## 2. Database

```bash
mysql -u root -p < database/schema/pharma_sys.sql
mysql -u root -p pharmasys < database/schema/relationships.sql
```

Run seeders after schema is complete (Step 3+).

## 3. Run development

| App | Command | URL |
|-----|---------|-----|
| API | `cd backend && npm run dev` | http://localhost:5000 |
| Web | `cd web && npm run dev` | http://localhost:5173 |
| Mobile | `cd mobile && npx expo start` | Expo DevTools |

## Environment

Configure `.env` files in `backend/`, `web/`, and `mobile/` per project README.
