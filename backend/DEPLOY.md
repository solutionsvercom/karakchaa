# Deploy Karakchaa on Hostinger (Node.js)

Single Node app serves:

| URL | App |
|-----|-----|
| `https://karakcha.in/` | Digital menu |
| `https://karakcha.in/admin` | Admin / CRM (`my-app`) |
| `https://karakcha.in/api/*` | Backend API |

## Hostinger build settings (important)

In **hPanel → Websites → Deployments → Settings**, use:

| Setting | Value |
|---------|--------|
| **Root directory** | `backend` |
| **Framework** | Other |
| **Build command** | `npm install && npm run build` |
| **Output directory** | `dist` |
| **Start / Entry command** | `npm start` |
| **Entry file** | `server.js` |
| **Node.js version** | 20.x (or 18.x) |

If you deploy from GitHub, the repo root is `Karakchaa/` — set **Root directory** to **`backend`**, not the repo root.

The build creates:

- `backend/dist/index.html` — digital menu (site home)
- `backend/dist/admin/index.html` — admin app

Hostinger checks that the **Output directory** (`dist`) exists after `npm run build`. If you see *"No output directory found after build"*, the output directory field is wrong or root directory is not `backend`.

## 1. Build locally

```bash
cd backend
npm install
npm run build
```

## 2. Environment variables (Hostinger panel)

Copy from `backend/.env.example`. Minimum:

- `MONGO_URI`
- `JWT_SECRET`
- `CLOUDINARY_*`
- `NODE_ENV=production`
- `APP_URL=https://karakcha.in`
- `ALLOWED_ORIGINS=https://karakcha.in,https://www.karakcha.in`

Do not commit `backend/.env` to Git.

## 3. MongoDB Atlas

Network Access → allow Hostinger server IP (or `0.0.0.0/0` for testing).

## 4. After deploy

- Menu: https://karakcha.in/
- Admin: https://karakcha.in/admin/login
- Health: https://karakcha.in/api/health

## Local development

Run three terminals (Vite dev servers):

```bash
cd backend && npm run dev
cd my-app && npm run dev
cd DigitalMenu && npm run dev
```
