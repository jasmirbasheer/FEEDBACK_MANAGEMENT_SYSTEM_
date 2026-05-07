## Futuristic Feedback Intelligence System

Cyber-noir / deep-space feedback platform with JWT auth, MongoDB persistence, and a glassmorphism HUD-style UI.

### Tech Stack

- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT, Bcrypt
- **Frontend**: Vanilla HTML, CSS, JS (Fetch API)

### Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

3. Set your env vars in `.env`:

- `MONGO_URI` – MongoDB connection string
- `JWT_SECRET` – secret used to sign JWTs
- `PORT` – port for the Express server (defaults to 4000)

4. Run in dev mode:

```bash
npm run dev
```

5. Production start:

```bash
npm start
```

### Auth & Roles

- **Register**: `POST /api/auth/register` – returns `{ token, user }`
- **Login**: `POST /api/auth/login` – returns `{ token, user }`
- User roles: `user` (default) and `admin` (configure manually in DB for now).

### Feedback API

- **Create**: `POST /api/feedback` – authenticated user submits feedback.
- **Get mine**: `GET /api/feedback` – list of the current user’s feedback.
- **Update**: `PUT /api/feedback/:id`
  - Strict 15-minute rule enforced server-side using `createdAt` vs `Date.now()`.
  - After 15 minutes, server responds with **403** and a lock message.

### Admin "God-View"

- **All feedback**: `GET /api/admin/feedback` (requires `admin` role and valid JWT).
- **Stats**: `GET /api/admin/stats` (optional helper).

### Frontend Behavior

- Glassmorphism HUD-style console with cyber-noir theme (`#0a0a0b` background and neon cyan `#00f2ff` accents).
- JWT stored in `localStorage` and used via `Authorization: Bearer <token>` headers.
- Each personal feedback card shows a **live countdown** for the 15-minute edit window:
  - When active, shows `EDIT WINDOW: mm:ss`.
  - When expired, changes to `EDIT WINDOW: LOCKED` and the edit button is replaced by a lock indicator.
- Admin users see an additional **God-View grid** at `/` (same SPA) powered by `/api/admin/feedback`.

