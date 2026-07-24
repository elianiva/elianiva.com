# Alchemy Migration Plan

## Goal
Migrate from `wrangler.jsonc` + `@cloudflare/vite-plugin` to [Alchemy.run](https://alchemy.run/) for infra management.

## Why
- Declarative infra as code (TypeScript + Effect)
- R2 bucket provisioning without dashboard/CLI
- Typed Worker bindings via `Cloudflare.InferEnv`
- Single `alchemy deploy` command replaces `wrangler deploy`

## Current infra (from wrangler.jsonc)

| Resource | Value |
|----------|-------|
| Worker name | `elianiva-com` |
| Compatibility flags | `nodejs_compat` |
| KV namespace | `CACHE` (id: `c5df4649d19e47578b2c399aab2b76e5`) |
| Observability | Logs + traces enabled |
| Domain | TBD (not yet configured) |

## Migration steps

1. **Bump Effect** — Alchemy requires `effect@>=4.0.0-beta.100`. Current: `4.0.0-beta.68`.
2. **Install Alchemy** — `bun add "alchemy@next" "effect@>=4.0.0-beta.100" "@effect/platform-bun@>=4.0.0-beta.100" "@effect/platform-node@>=4.0.0-beta.100"`
3. **Create `alchemy.run.ts`** — Declare:
   - `Cloudflare.Website.Vite<Website>()` for TanStack Start app
   - `Cloudflare.KVNamespace` for `CACHE` (adopt existing)
   - `Cloudflare.R2.Bucket("Photography")` for photo storage
   - Secrets via `Config.redacted` for `GH_TOKEN`, `LASTFM_API_KEY`
   - Domain via `Cloudflare.Zone.Zone` + `domain` on Worker
4. **Remove `@cloudflare/vite-plugin`** from `vite.config.ts` — Alchemy provides its own Vite plugin
5. **Remove `wrangler.jsonc`** — Config lives in `alchemy.run.ts`
6. **Update `package.json` scripts**:
   - `"dev": "alchemy dev"` (was `vite dev`)
   - `"deploy": "alchemy deploy"` (was `build && wrangler deploy`)
   - `"cf-types": "alchemy types"` (was `wrangler types`)
7. **Add env binding helper** — Create `~/lib/cf-env.ts` for typed `cloudflare:workers` proxy
8. **Update CI/deploy scripts** — Replace wrangler commands with alchemy

## Post-migration benefits
- R2 bucket auto-provisioned and bound to Worker
- Typed `env.PHOTOGRAPHY_BUCKET` in server routes
- Upload script can use S3-compatible R2 credentials from stack outputs
- Domain + DNS managed alongside the app
