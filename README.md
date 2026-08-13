# Logistics Management System (LMS)

Full-stack enterprise logistics platform built from the LMS PRD.

| Layer | Stack |
|-------|--------|
| **Frontend** | Next.js 15 (App Router) · React 19 · Tailwind CSS v4 |
| **Backend** | Node.js · Express · **OOP** (classes for App, Server, Services, Controllers, Middleware) |
| **Database** | MongoDB (`mongodb://localhost:27017/lms`) via Mongoose |
| **Auth** | JWT + bcrypt + RBAC (7 roles) |

---

## Project structure

```
lms/
├── backend/
│   ├── src/
│   │   ├── config/          # Database connection
│   │   ├── models/          # Mongoose schemas
│   │   ├── services/        # Business logic (OOP)
│   │   ├── controllers/     # HTTP layer (OOP)
│   │   ├── routes/          # REST API
│   │   ├── middleware/      # Auth, validation, errors
│   │   ├── utils/           # AppError, constants, helpers
│   │   ├── seed/            # Demo data seeder
│   │   ├── app.js           # Express App class
│   │   └── server.js        # Server bootstrap class
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/      # UI + AppShell
│   │   ├── context/         # AuthContext
│   │   └── lib/             # API client + constants
│   ├── .env.local
│   └── package.json
└── README.md
```

---

## Prerequisites

- **Node.js 18+**
- **MongoDB** running locally:

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Ubuntu
sudo systemctl start mongod

# Docker
docker run -d --name lms-mongo -p 27017:27017 mongo:7
```

> If MongoDB is not reachable, the backend **automatically falls back** to an in-memory MongoDB (`mongodb-memory-server`) so you can still demo the app. Set `ALLOW_MEMORY_MONGO=false` to disable that.

---

## Quick start

```bash
# 1) Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 2) Configure env (defaults already set)
# backend/.env        → MONGO_URI=mongodb://localhost:27017/lms
# frontend/.env.local → NEXT_PUBLIC_API_URL=http://localhost:5000

# 3) Seed demo data
cd ../backend && npm run seed
# or full wipe + seed:
npm run seed:reset

# 4) Start API (port 5000)
npm run dev

# 5) Start frontend (port 3000) — new terminal
cd ../frontend && npm run dev
```

Open **http://localhost:3000**

---

## Demo logins

Password for all accounts: **`Password123!`**

| Role | Email |
|------|--------|
| Super Admin | `admin@lms.io` |
| Business Manager | `manager@lms.io` |
| Dispatcher | `dispatch@lms.io` |
| Warehouse | `warehouse@lms.io` |
| Finance | `finance@lms.io` |
| Driver | `driver@lms.io` |
| Customer | `customer@lms.io` |

---

## API overview

Base URL: `http://localhost:5000/api`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/login` | Login |
| POST | `/auth/register` | Register |
| GET | `/auth/me` | Current user |
| GET | `/dashboard` | KPI dashboard |
| GET/POST | `/orders` | List / create orders |
| POST | `/orders/:id/advance` | Advance status |
| POST | `/orders/:id/assign` | Assign driver |
| POST | `/orders/:id/auto-assign` | AI assign one |
| POST | `/dispatch/auto-assign` | AI assign queue |
| GET | `/vehicles` | Fleet |
| GET | `/drivers` | Drivers |
| GET | `/tracking/live` | Live GPS points |
| GET | `/warehouses` | Warehouses |
| GET | `/inventory` | Stock |
| GET | `/invoices` | Invoices |
| GET | `/finance/summary` | Finance KPIs |
| GET | `/analytics` | Analytics |
| GET | `/ai/insights` | AI recommendations |
| GET | `/customers` | Customers |
| GET | `/notifications` | Notifications |
| GET | `/admin/users` | Users (admin) |
| GET | `/health` | Health check |

All protected routes require:

```http
Authorization: Bearer <jwt>
```

---

## Modules (from PRD)

- Authentication & RBAC  
- Orders (14-stage lifecycle)  
- Warehouse & inventory  
- Fleet & drivers  
- GPS tracking  
- Dispatcher console + AI auto-assign  
- Finance & invoices  
- Analytics & heatmaps  
- Customers & loyalty  
- AI insights  
- Notifications  
- Admin (users, integrations, security)

---

## Environment variables

### Backend (`backend/.env`)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/lms
JWT_SECRET=change_me
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
ALLOW_MEMORY_MONGO=true
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## Production notes

1. Set a strong `JWT_SECRET`
2. Run a real MongoDB replica set
3. Put API behind HTTPS / reverse proxy
4. Build frontend: `cd frontend && npm run build && npm start`
5. Process manager: PM2 / Docker / Kubernetes
6. Attach Redis for sessions/cache and Socket.IO for live GPS (extension points ready)

---

## License

Private / project use.
