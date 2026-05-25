# PharmaSys API Documentation

Base URL: `http://localhost:5000/api`

All protected routes require header: `Authorization: Bearer <token>`

## Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login `{ email, password }` |
| POST | `/auth/register` | Register user |
| POST | `/auth/forgot-password` | Request reset `{ email }` |
| GET | `/auth/me` | Current user (protected) |
| GET | `/auth/roles` | List roles (protected) |

## Medicines

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/medicines` | List (`search`, `page`, `limit`, `category_id`) |
| GET | `/medicines/categories` | List categories |
| GET | `/medicines/barcode/:barcode` | Lookup by barcode |
| GET | `/medicines/:id` | Get one |
| POST | `/medicines` | Create (multipart optional `image`) |
| PUT | `/medicines/:id` | Update |
| PATCH | `/medicines/:id/archive` | Archive |
| DELETE | `/medicines/:id` | Delete (super_admin) |
| GET | `/medicines/:id/barcode-image` | PNG barcode |
| GET | `/medicines/:id/qr` | QR data URL |

## Inventory

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/inventory/summary` | Stock summary |
| GET | `/inventory/low-stock` | Low stock list |
| GET | `/inventory/expiring?days=90` | Expiring medicines |
| GET | `/inventory/logs` | Inventory logs |
| POST | `/inventory/adjust` | Stock adjustment body |

## Sales (POS)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/sales` | List sales |
| GET | `/sales/:id` | Sale detail + items |
| POST | `/sales` | Create sale |
| POST | `/sales/return` | Process return |
| GET | `/sales/:id/receipt` | PDF receipt |

### Create sale body

```json
{
  "customer_id": null,
  "items": [{ "medicine_id": 1, "quantity": 2 }],
  "payment_method": "cash",
  "amount_paid": 100,
  "discount_type": "senior",
  "notes": ""
}
```

## Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/stats` | Full dashboard payload |

## Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports/sales?from=&to=` | Sales by day |
| GET | `/reports/inventory` | Inventory report |
| GET | `/reports/financial?from=&to=` | Financial summary |
| GET | `/reports/sales/pdf` | PDF download |
| GET | `/reports/sales/excel` | Excel download |

## Suppliers & Customers

CRUD at `/suppliers` and `/customers`

## Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications?unread=true` | List |
| PATCH | `/notifications/:id/read` | Mark read |
| PATCH | `/notifications/read-all` | Mark all read |

## Health

`GET /api/health` — no auth required
