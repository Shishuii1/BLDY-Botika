# PharmaSys

Production-ready **Pharmacy POS, Inventory & Management System** — React + Node.js + MySQL.

## Features

- JWT authentication with role-based access (Super Admin, Pharmacist, Cashier, Inventory Staff)
- Dashboard analytics with Recharts
- Medicine CRUD, barcode/QR, archive
- Inventory stock in/out, logs, low-stock & expiry alerts
- Full POS (cash, GCash, card, senior/PWD discounts, PDF receipts)
- Suppliers & customers with loyalty
- Sales reports (PDF & Excel export)
- Real-time notifications (Socket.io)
- AI sales forecasting
- Dark mode

## Quick Start

### 1. Database

**Option A — automatic (recommended):** On first `npm run dev`, the API creates any missing tables (`suppliers`, `medicines`, etc.) and seeds sample data if tables are empty.

**Option B — manual SQL:**

```bash
mysql -u root -p < database/schema/pharma_sys.sql
mysql -u root -p pharmasys < database/seeders/seed_all.sql
```

**Option C — Node setup script:**

```bash
cd backend
npm run db:setup
```

If you see errors like `Table 'pharmasys.suppliers' doesn't exist`, restart the backend after pulling the latest code, or run `npm run db:setup`.

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit DB_PASSWORD and JWT_SECRET
npm install
npm run dev
```

API: http://localhost:5000/api/health

**Default login** (created on first start): `admin@pharmasys.com` / `Admin@123`

### 3. Web

```bash
cd web
cp .env.example .env
npm install
npm run dev
```

App: http://localhost:5173

## Project Structure

```
├── backend/     Express REST API + Socket.io
├── web/         React + Vite admin dashboard & POS
├── database/    MySQL schema & seeders
└── docs/        Documentation
```

## API Modules

| Prefix | Module |
|--------|--------|
| `/api/auth` | Login, register, forgot password |
| `/api/medicines` | Medicine CRUD, barcode, categories |
| `/api/inventory` | Stock adjustments, logs, alerts |
| `/api/sales` | POS checkout, returns, receipts |
| `/api/dashboard` | Analytics & forecast |
| `/api/reports` | Sales, inventory, financial exports |
| `/api/suppliers` | Supplier management |
| `/api/customers` | Customer & loyalty |
| `/api/notifications` | Alerts |

See [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) and [docs/INSTALLATION_GUIDE.md](docs/INSTALLATION_GUIDE.md).

## Tech Stack

- **Frontend:** React, Vite, Tailwind, Framer Motion, React Query, Zustand, Recharts
- **Backend:** Node.js, Express, JWT, Socket.io, MySQL, Zod, PDFKit, ExcelJS
