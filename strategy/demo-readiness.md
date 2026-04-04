# Demo Readiness — Alan

**Last updated:** April 4, 2026
**Goal:** End-to-end demo showing the core loop works and the operator dashboard is useful.

---

## What's Built

| Area | Status | Notes |
|---|---|---|
| Landing page | ✅ Done | All sections from plan (nav, hero, problem, why-now, how-it-works, FAQ, footer, bottom CTA). Waitlist API route exists. Some uncommitted tweaks to hero, problem, how-it-works, nav, bottom-cta. |
| Auth | ✅ Done | JWT sessions, login/signup pages. |
| Dashboard | ✅ Done | Overview (wallet balance, stats, recent txns), transactions, exceptions (approve/reject), suppliers, settings. |
| Backend API routes | ✅ Done | webhook, transfer, transactions, exceptions, health. |
| Core pipeline | ✅ Verified | Full loop tested on Tempo moderato testnet. Settles in ~5s. |
| Database schema | ✅ Done | Drizzle schema: operators, suppliers, SKUs, transactions, exceptions, audit_logs, waitlist. |
| Seed script | ✅ Done | `npm run seed` — 1 operator, 3 suppliers, 6 SKUs, 14 txns, 5 exceptions, 12 audit entries. |

---

## Completed — P0 Items

### 1. End-to-end pipeline on testnet ✅

Pipeline verified end-to-end on Tempo moderato testnet (chain ID 42431). Three live transactions executed:

| Webhook | Supplier | Amount | Result | Settlement |
|---|---|---|---|---|
| PKG-001 x 3 | Mumbai Packaging Corp. | $45.00 | Settled | 4.9s |
| ELEC-001 x 20 | Guangzhou Electronics Ltd. | $2,400.00 | Held (exceeds supplier threshold) | — |
| TEX-001 x 5 | Shenzhen Textiles Co. | $225.00 | Settled | 4.9s |

- [x] Tempo testnet RPC reachable, wallet funded via `tempo_fundAddress` faucet RPC
- [x] Full pipeline completes: webhook → SKU lookup → policy check → PathUSD transfer → audit log
- [x] Audit log captures all event types
- [x] Settlement time recorded (~4.9s)

**Testnet details:**
- Stablecoin: PathUSD (`0x20c0000000000000000000000000000000000000`), 6 decimals
- Sender wallet: `0x24a0b6e70623e8B9bf5ddFae9D9F210cbe83eD03`
- Faucet: `cast rpc tempo_fundAddress <ADDRESS> --rpc-url https://rpc.moderato.tempo.xyz`
- Gas is paid in native USD stablecoins (no separate gas token needed)

### 2. Dashboard wired to real data ✅

- [x] Overview page: wallet balance, total transactions, settled volume, avg settlement time, pending approvals, recent transactions table
- [x] Transactions page: full list with status, amounts, settlement times, tx hash, exception type
- [x] Suppliers page: list with active/inactive status, spending limits, verification status
- [x] Exceptions page: pending exceptions with inline Approve/Reject buttons, resolved exceptions table

### 3. Exception handling UX ✅

- [x] Triggering a webhook that exceeds supplier approval threshold creates a held transaction
- [x] Exception appears in `/dashboard/exceptions` with supplier name, amount, reason, and detection time
- [x] Operator can approve or reject inline with one click
- [x] Resolution is logged to audit trail via `POST /api/exceptions`

### 4. Seed / demo data ✅

- [x] Seed script (`npm run seed`): 1 operator, 3 suppliers, 6 SKUs
- [x] 14 historical transactions (10 settled, 1 failed, 2 held, 1 rejected)
- [x] 5 exceptions (1 auto-resolved, 2 pending, 1 failed, 1 operator-rejected)
- [x] 12 audit log entries
- [x] Demo login: `demo@acme.com` / `demo1234`

---

## Remaining — P1 Polish

#### 5. Monthly summary view
Even a static version of the summary notification on the dashboard overview:
> *14 payments processed — $61,400 settled*
> *Avg. settlement time: 3.2 minutes*
> *Exceptions flagged: 2 (both approved by you)*
> *0 payments blocked*

#### 6. Commit and deploy landing page changes
Uncommitted modifications to hero, problem, how-it-works, nav, bottom-cta, login, signup. Get these committed and deployed so the live URL is current.

#### 7. Auto-execute on approval
When an operator approves a held transaction, automatically trigger the Tempo transfer instead of just setting status to "pending". Currently requires a manual follow-up.

---

## P2 — Nice-to-have

#### 8. Demo script
A written walkthrough of exactly what to show Alan and in what order:
1. Landing page (30 seconds — show the positioning)
2. Dashboard overview (show seeded data, wallet balance, recent transactions)
3. Live trigger (fire a webhook, watch it settle in the dashboard)
4. Exception trigger (fire a webhook that hits a policy edge, show the hold → approve flow)
5. Audit log (show the full trace of both transactions)

---

## Resolved Blockers

| Blocker | Resolution |
|---|---|
| Testnet stablecoin in wallet | Funded via `tempo_fundAddress` RPC faucet. PathUSD, AlphaUSD, BetaUSD, ThetaUSD — $1,000 each. |
| Database provisioned | Neon Postgres up, schema pushed, seed data loaded. |
| USDC contract address | Tempo moderato uses PathUSD (`0x20c0...0000`), not USDC.e. Updated `TEMPO_USDC_ADDRESS` in env. |
| Private key format | `.env.development.local` values must not have quotes — Next.js includes them literally. |
| Deploy target | TBD — Vercel or local for demo? |

---

## Env Setup Notes

All values in `.env.development.local` must be **unquoted** (Next.js includes quotes literally):
```
TEMPO_PRIVATE_KEY=0x...
TEMPO_RPC_URL=https://rpc.moderato.tempo.xyz
TEMPO_CHAIN_ID=42431
TEMPO_USDC_ADDRESS=0x20c0000000000000000000000000000000000000
POSTGRES_URL=postgresql://...
```

---

## Reference

- Product spec: `strategy/product-spec.md`
- Landing page plan: `strategy/plan.md`
- ICP: `strategy/icp.md`
- Spend policy config: `src/config/spend-policy.yaml`
- Seed script: `scripts/seed.ts` (`npm run seed`)
- Supplier wallet updater: `scripts/update-supplier-wallets.ts`
