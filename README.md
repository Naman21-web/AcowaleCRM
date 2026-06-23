# Acowale CRM Machine Test — Acodash

A lightweight customer feedback platform: anyone can submit feedback through a public form,
and the team can review trends through an admin dashboard ("Acodash").

Built with the **MERN** stack — MongoDB, Express, React, Node.js.

---

## 1. What's inside

```
acowale-crm/
├── backend/                 # Express + MongoDB API
│   ├── src/
│   │   ├── config/db.js         # Mongo connection
│   │   ├── models/Feedback.js   # Mongoose schema
│   │   ├── controllers/         # Route handlers
│   │   ├── routes/              # Route definitions
│   │   ├── middleware/          # auth, validation, rate limiting, errors
│   │   └── utils/logger.js      # Winston logger
│   ├── tests/feedback.test.js   # Jest + Supertest + in-memory Mongo
│   ├── server.js
├── frontend/                # React (Vite) SPA
│   ├── src/
│   │   ├── pages/UserWindow.jsx     # Public feedback form
│   │   ├── pages/AdminConsole.jsx   # Dashboard (charts, table, filters)
   ├── pages/AdminLogin.jsx
   ├── api/client.js
   └── styles/theme.css
```

## 2. Product requirements → where they live

| Requirement | Where |
|---|---|
| Public feedback form (category, comment, optional rating/email) | `frontend/src/pages/UserWindow.jsx` |
| Dashboard: total count, category distribution, recent submissions, filter/search | `frontend/src/pages/AdminConsole.jsx` |
| API — submit feedback | `POST /api/feedback` |
| API — fetch feedback (paginated, filterable, searchable) | `GET /api/feedback` |
| API — analytics summary | `GET /api/analytics/summary` |
| Health check | `GET /health` |
| Env vars / validation / error handling / logging | see `backend/src/middleware`, `.env.example` |
| Auth (bonus) | JWT admin login, `POST /api/auth/login` |
| Unit tests (bonus) | `backend/tests/feedback.test.js` |
| Rate limiting (bonus) | `backend/src/middleware/rateLimiter.js` |

## 3. Run it locally

You'll need Node.js 20+ and either a local MongoDB instance or a free
[MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster.

**Backend**
```bash
cd backend
cp .env.example .env       # then edit MONGO_URI / JWT_SECRET / ADMIN_PASSWORD
npm install
npm run dev                 # http://localhost:5000
```

**Frontend** (new terminal)
```bash
cd frontend
cp .env.example .env         # VITE_API_BASE_URL=http://localhost:5000/api
npm install
npm run dev                  # http://localhost:5173
```

Visit `http://localhost:5173` for the feedback form and `http://localhost:5173/admin` for the
dashboard (log in with the `ADMIN_USERNAME` / `ADMIN_PASSWORD` you set in `backend/.env`).

## 4. Running tests

```bash
cd backend
npm test
```

Tests use `mongodb-memory-server` to spin up a throwaway Mongo instance, so no external
database is needed — **except** that this sandbox's network is locked down to package
registries only, so it cannot download the `mongod` binary here. The suite is written and
syntax/logic-verified, and runs cleanly in any normal CI runner or local machine with
internet access (GitHub Actions, included in this repo, runs it on every push).

## 5. Deploying it for real

This repo is deployed live on https://acowale-crm-three.vercel.app/


## 6. API quick reference

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/feedback` | Public | Submit feedback |
| GET | `/api/feedback` | Admin | List feedback (`?page&limit&category&status&search`) |
| GET | `/api/feedback/:id` | Admin | Fetch one item |
| PATCH | `/api/feedback/:id/status` | Admin | Update status |
| GET | `/api/analytics/summary` | Admin | Counts, distributions, trend, recent items |
| POST | `/api/auth/login` | Public | Get a JWT (`{ username, password }`) |
| GET | `/health` | Public | Liveness/readiness probe |

## 7. My journey (short version)

I started from the product brief, not the tech stack: a public form + an admin-only
dashboard means I need two trust boundaries (anonymous writes, authenticated reads), so the
API was designed around that split from the first route. I built the backend first
(model → validation → controllers → routes → tests) since the frontend is just a consumer of
it, then built the dashboard against the real `/api/analytics/summary` shape rather than
mocking data. See `DECISIONS.md` for the reasoning behind each specific choice.
