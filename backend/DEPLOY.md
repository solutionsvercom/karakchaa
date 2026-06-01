# Deploy Karakchaa on Hostinger (Node.js)

## Fix: "No output directory found after build"

Hostinger checks for a **`dist` folder at the project root** after build. This repo builds into `backend/dist`, then **copies it to `/dist`** automatically when you run `npm run build` from the **repository root**.

Use the settings below exactly.

---

## Hostinger hPanel settings

| Setting | Value |
|---------|--------|
| **Root directory** | `.` (repository root) **OR** leave empty |
| **Framework** | **Other** (not Vite — do not pick DigitalMenu alone) |
| **Build command** | `npm run build` |
| **Output directory** | `dist` |
| **Start command** | `npm start` |
| **Node.js version** | 20.x |

**Do not** set root to `DigitalMenu` or `my-app` alone — that only builds one frontend and fails the output check.

Alternative (also works):

| Setting | Value |
|---------|--------|
| **Root directory** | `backend` |
| **Build command** | `npm install && npm run build` |
| **Output directory** | `dist` |
| **Start command** | `npm start` |

---

## URLs after deploy

| URL | App |
|-----|-----|
| `https://karakcha.in/` | Digital menu |
| `https://karakcha.in/admin` | Admin / CRM |
| `https://karakcha.in/api/*` | API |

---

## Environment variables (Hostinger panel)

Set in hPanel (do not commit `.env`):

- `MONGO_URI`
- `JWT_SECRET`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `NODE_ENV=production`
- `APP_URL=https://karakcha.in`
- `ALLOWED_ORIGINS=https://karakcha.in,https://www.karakcha.in`

---

## Build locally to test

```bash
# From repository root (same as Hostinger)
npm run build
```

You should see:

- `backend/dist/index.html`
- `dist/index.html` (copy at repo root)
- `✅ Mirrored backend/dist → dist/`

Then:

```bash
npm start
```

Open http://localhost:5000/ and http://localhost:5000/admin/login

---

## MongoDB Atlas

Allow Hostinger server IP in **Network Access** (or `0.0.0.0/0` for testing).
