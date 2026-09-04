# Hostinger environment variables (after rotating Cloudinary keys)

**Do not commit real keys to Git.** Set these in **hPanel → Websites → your site → Environment variables** (or Node.js app settings), then **Redeploy** with build.

| Variable | Value |
|----------|--------|
| `CLOUDINARY_CLOUD_NAME` | `djctmnkky` |
| `CLOUDINARY_API_KEY` | Your **new** API key from Cloudinary |
| `CLOUDINARY_API_SECRET` | Your **new** API secret from Cloudinary |
| `MONGO_URI` | Your MongoDB connection string |
| `JWT_SECRET` | Your JWT secret |
| `NODE_ENV` | `production` |
| `APP_URL` | `https://karakcha.in` |
| `ALLOWED_ORIGINS` | `https://karakcha.in,https://www.karakcha.in` |

## Cloudinary dashboard

1. [Cloudinary Console](https://console.cloudinary.com) → **djctmnkky**
2. **Settings → API Keys** → create or select key → status must be **Enabled** (not Disabled)
3. Copy **API Key** and **API Secret** into Hostinger (not into any file you commit)

## Redeploy on Hostinger

Vite 7 needs **Node.js 20.19+ or 22.12+**. Hostinger is currently using **18.20.8**, which will fail the build.

In hPanel, set **Node.js version** to **20.x** or **22.x** (not 18.x), then Redeploy. Hostinger reads this from `engines.node` in `package.json` (`>=20.19.0`); you can also pick it on the deploy settings screen.

| Setting | Value |
|---------|--------|
| Node.js version | `20.x` or `22.x` (required) |
| Root directory | `DigitalMenu` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Entry file | `server.cjs` |
| Start command | `npm start` |

After deploy, verify:

- `GET https://karakcha.in/api/health` → `"database": "connected"` and HTTP **200** (not 503)
- If `"database": "disconnected"`, read `"mongoError"` in the JSON — fix that, then **Redeploy**

### 503 on `/api/settings` or `/api/digital-menu/products`

The site HTML loads, but API returns 503 when **MongoDB is not connected**.

1. **MONGO_URI** in hPanel must be the full Atlas string with a **real password** (not `<db_password>` or other placeholders).
2. Format example (replace user, password, cluster, db name):

   `mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/karakchaa?retryWrites=true&w=majority`

3. **MongoDB Atlas → Network Access** → allow `0.0.0.0/0` (or Hostinger’s IP) while testing.
4. **Atlas → Database Access** → user password matches the URI (reset password if unsure; URL-encode `@`, `#`, `%` in password).
5. Save env vars → **Deployments → Redeploy** (with build).

After deploy, verify:

- `GET https://karakcha.in/api/health` → `"cloudinary": "ok"`
- Upload one product image in Admin
- Sync DB from Cloudinary library: `POST https://karakcha.in/api/products/sync-images-from-cloudinary`
- Or repair broken refs: `POST https://karakcha.in/api/products/repair-images`
