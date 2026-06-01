# Deploy Karakchaa on Hostinger (Node.js)

## Fix: "No output directory found after build"

Hostinger checks for a **`dist` folder at the project root** after build. This repo builds into `backend/dist`, then **copies it to `/dist`** automatically when you run `npm run build` from the **repository root**.

Use the settings below exactly.

---

## Hostinger hPanel settings

### If root directory is **DigitalMenu** (locked default)

| Setting | Value |
|---------|--------|
| **Root directory** | `DigitalMenu` |
| **Framework** | Other |
| **Build command** | `npm run build` |
| **Output directory** | `dist` |
| **Entry file** | `server.cjs` |
| **Start command** | `npm start` |

### If root directory is **repository root** (`.`)

| Setting | Value |
|---------|--------|
| **Root directory** | `.` (empty) |
| **Build command** | `npm run build` |
| **Output directory** | `DigitalMenu/dist` |
| **Entry file** | `server.cjs` (at repo root) **OR** `DigitalMenu/server.cjs` |
| **Start command** | `npm start` |

A `server.cjs` at the **repo root** forwards to `DigitalMenu/server.cjs` → `backend/server.js`.

---

## URLs after deploy

| URL | App |
|-----|-----|
| `https://karakcha.in/` | Digital menu |
| `https://karakcha.in/admin` | Admin / CRM |
| `https://karakcha.in/api/*` | API |

---

## Environment variables (Hostinger panel)

Set in hPanel (do not commit `.env`). See also **[HOSTINGER_ENV.md](../HOSTINGER_ENV.md)** when you rotate Cloudinary keys.

- `MONGO_URI`
- `JWT_SECRET`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — after changing keys in Cloudinary, update **all three** in Hostinger and **redeploy** (local `backend/.env` does not affect production)
- API key must be **Enabled** in [Cloudinary Console](https://console.cloudinary.com) — a disabled key returns `disabled api_key` and uploads fail
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

---

## Product images (Cloudinary)

If the browser shows **404** on `res.cloudinary.com/...` URLs, the file is **not in your Cloudinary account** (deleted, never uploaded, or wrong cloud name).

1. Enable the Cloudinary **API key** in the dashboard.
2. Redeploy with the env vars above.
3. Re-upload photos in **Admin → Products** (each upload saves a real `secure_url` in MongoDB).
4. Optional cleanup after deploy: `POST https://karakcha.in/api/products/repair-images` (removes broken image references from the database).
