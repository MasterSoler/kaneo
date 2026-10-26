# OWeb Kaneo satellite (Vercel + Fly)

The OWeb deployment serves the Kaneo web UI from Vercel and proxies API traffic to a separate backend.

| Surface | URL / name |
| --- | --- |
| Web (Vercel) | `https://kaneo-oweb.vercel.app` |
| API (Fly) | `https://kaneo-api-oweb.fly.dev` |
| Vercel proxy | `/api/*` → Fly (see root `vercel.json`) |

Until the Fly app exists, sign-in shows **API backend unreachable** because Vercel returns `DNS_HOSTNAME_NOT_FOUND` for the proxy target.

## One-time Fly setup

Requires [flyctl](https://fly.io/docs/hands-on/install-flyctl/) and a Fly account.

```bash
# 1. Create Postgres (managed)
fly postgres create --name kaneo-api-oweb-db --region iad --initial-cluster-size 1

# 2. Create the API app (name must match fly.toml)
fly apps create kaneo-api-oweb

# 3. Attach Postgres (sets DATABASE_URL on the app)
fly postgres attach kaneo-api-oweb-db --app kaneo-api-oweb

# 4. Secrets
fly secrets set \
  AUTH_SECRET="$(openssl rand -hex 32)" \
  KANEO_CLIENT_URL="https://kaneo-oweb.vercel.app" \
  --app kaneo-api-oweb

# 5. Deploy from repo root
fly deploy --app kaneo-api-oweb
```

Verify:

```bash
curl -sS https://kaneo-oweb.vercel.app/api/instance/status
# {"hasUsers":false,"hasAdmin":false} on a fresh instance
```

## GitHub Actions

Add repository secret `FLY_API_TOKEN` (from `fly tokens create deploy -a kaneo-api-oweb`), then run **Deploy OWeb API to Fly.io** or push changes to `fly.toml`.

Postgres is **not** created by the workflow; run the steps above once before the first deploy.

## Vercel environment

On project `kaneo-oweb` (team `oweb`):

- `VITE_CLIENT_URL` = `https://kaneo-oweb.vercel.app`
- `VITE_API_URL` = `https://kaneo-oweb.vercel.app` (same-origin; `/api` is proxied)

If the API hostname changes, update `vercel.json` and redeploy the web project.
