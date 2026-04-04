# Seneschal — Purchasing Agent

Automated cross-border supplier payments on stablecoin (USDC) rails using the Tempo blockchain (Stripe's L1). Product name is **Seneschal** (shown in dashboard nav).

## Tech Stack

- **Framework:** Next.js 15 (App Router, `src/` directory)
- **Language:** TypeScript
- **Database:** Neon Postgres via `@neondatabase/serverless` + Drizzle ORM
- **On-chain:** viem targeting Tempo chain (chain ID 42431, EVM-compatible). Stablecoin is PathUSD on moderato testnet. Gas paid in native USD stablecoins.
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Config:** YAML spend policies validated with Zod
- **Auth:** Custom JWT sessions (`src/lib/auth/`)

## Project Structure

- `src/app/page.tsx` — Landing page (marketing, uses components from `src/components/landing/`)
- `src/app/api/webhook/` — POST restock signal intake (triggers pipeline)
- `src/app/api/transfer/` — POST manual USDC transfer
- `src/app/api/transactions/` — GET transaction list
- `src/app/api/exceptions/` — GET/POST exception list and resolution
- `src/app/api/health/` — GET health check + stats
- `src/app/dashboard/` — Operator dashboard (overview, transactions, exceptions, suppliers, settings) with logout
- `src/components/landing/` — Landing page sections (nav, hero, problem, why-now, how-it-works, faq, footer, bottom-cta)
- `src/lib/auth/` — Auth system (JWT, password hashing, session management)
- `src/lib/db/` — Drizzle client (`index.ts`) and schema (`schema.ts`)
- `src/lib/tempo/` — viem client, USDC transfer logic, TIP-20/ERC-20 ABI
- `src/lib/pipeline/` — Core pipeline orchestrator, spend policy checker, exception handler
- `src/lib/audit.ts` — Append-only audit log writer
- `src/lib/config.ts` — YAML spend policy loader
- `src/config/spend-policy.yaml` — Spend policy config file
- `strategy/` — Product spec, positioning, outreach docs, demo readiness tracker (not code)
- `scripts/seed.ts` — Database seed script for demo data (`npm run seed`)
- `scripts/update-supplier-wallets.ts` — Update supplier wallet addresses

## Key Commands

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run seed             # Seed database with demo data (login: demo@acme.com / demo1234)
npx tsc --noEmit         # Type check
npx drizzle-kit push     # Push schema to database (needs POSTGRES_URL env var)
npx drizzle-kit generate # Generate migration files
```

Note: `drizzle-kit` does not auto-load `.env.development.local`. Either export `POSTGRES_URL` or pass it inline:
```bash
POSTGRES_URL='...' npx drizzle-kit push
```

## Environment Variables

Defined in `.env.development.local` (**values must be unquoted** — Next.js includes quotes literally):
- `TEMPO_PRIVATE_KEY` — Wallet private key for signing transfers
- `TEMPO_RPC_URL` — Tempo chain RPC (default: moderato testnet)
- `TEMPO_CHAIN_ID` — Chain ID (42431)
- `TEMPO_USDC_ADDRESS` — Stablecoin contract address on Tempo (PathUSD `0x20c0...0000` on moderato testnet)
- `POSTGRES_URL` — Neon Postgres connection string

## Data Model

All monetary amounts stored in **cents** (integer). Tables: `operators`, `suppliers`, `skus`, `transactions`, `exceptions`, `audit_logs`, `waitlist`. Schema defined in `src/lib/db/schema.ts`. The `operators` table includes a `password_hash` field for auth.

## Architecture Notes

- The DB client (`src/lib/db/index.ts`) uses a lazy proxy so it doesn't crash at import time without `POSTGRES_URL` (needed for static page generation during build).
- Dashboard pages use `export const dynamic = "force-dynamic"` to avoid pre-rendering DB queries at build time.
- The core pipeline (`src/lib/pipeline/index.ts`) is: webhook → SKU lookup → policy check → Tempo USDC transfer → audit log.
- Spend policy is loaded from YAML and cached in memory. Call `reloadSpendPolicy()` to refresh.
- Product spec lives at `strategy/product-spec.md` — v0 is the instrumented pipeline, v1 adds operator dashboard + exception handling.
- Tempo moderato testnet faucet: `cast rpc tempo_fundAddress <ADDRESS> --rpc-url https://rpc.moderato.tempo.xyz` (distributes PathUSD, AlphaUSD, BetaUSD, ThetaUSD).
- Demo readiness tracker: `strategy/demo-readiness.md`.

## Available Skills (Slash Commands)

- `/simplify` — Review changed code for reuse, quality, and efficiency, then fix any issues found.
- `/commit` — Create a git commit with a well-formatted message.
- `/schedule` — Create, update, list, or run scheduled remote agents (triggers) on a cron schedule.
- `/loop` — Run a prompt or slash command on a recurring interval (e.g., `/loop 5m /foo`, defaults to 10m).
- `/claude-api` — Help building apps with the Claude API or Anthropic SDK. Triggers when code imports `anthropic`/`@anthropic-ai/sdk`.
- `/update-config` — Configure the Claude Code harness via `settings.json` (hooks, automated behaviors).
- `/keybindings-help` — Customize keyboard shortcuts and keybindings.
