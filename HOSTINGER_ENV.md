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

| Setting | Value |
|---------|--------|
| Root directory | `DigitalMenu` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Entry file | `server.cjs` |
| Start command | `npm start` |

After deploy, verify:

- `GET https://karakcha.in/api/health` → `"cloudinary": "ok"`
- Upload one product image in Admin
- Sync DB from Cloudinary library: `POST https://karakcha.in/api/products/sync-images-from-cloudinary`
- Or repair broken refs: `POST https://karakcha.in/api/products/repair-images`
