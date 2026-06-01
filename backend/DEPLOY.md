# Deploy Karakchaa on Hostinger (Node.js)

Single Node app serves:

| URL | App |
|-----|-----|
| `https://karakcha.in/` | Digital menu |
| `https://karakcha.in/admin` | Admin / CRM (`my-app`) |
| `https://karakcha.in/api/*` | Backend API |

## 1. Build locally (recommended)

```bash
cd backend
npm install
npm run build
```

This installs frontend deps and outputs:

- `backend/public/menu/` — DigitalMenu
- `backend/public/admin/` — my-app

## 2. Upload to Hostinger

Upload the **`backend`** folder (include `public/menu`, `public/admin`, `src`, `config`, `package.json`, `server.js`).

Do **not** upload `.env` over insecure channels; set variables in Hostinger’s panel.

## 3. Hostinger Node.js settings

| Setting | Value |
|---------|--------|
| Application root | `backend` (or your upload path) |
| Start command | `npm start` |
| Node version | 18+ or 20 LTS |

## 4. Environment variables (Hostinger panel)

Copy from `backend/.env.example`. Minimum:

- `MONGO_URI`
- `JWT_SECRET`
- `CLOUDINARY_*`
- `NODE_ENV=production`
- `APP_URL=https://karakcha.in`
- `ALLOWED_ORIGINS=https://karakcha.in,https://www.karakcha.in`

`PORT` is usually set by Hostinger automatically.

## 5. MongoDB Atlas

Network Access → allow Hostinger server IP (or `0.0.0.0/0` temporarily).

## 6. After deploy

- Menu: https://karakcha.in/
- Admin login: https://karakcha.in/admin/login
- Health: https://karakcha.in/api/health

## Local development (unchanged)

Run three terminals:

```bash
cd backend && npm run dev
cd my-app && npm run dev
cd DigitalMenu && npm run dev
```

Use `.env` with `localhost` URLs (see `.env.example` files).
