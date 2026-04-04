# Tempo Purchasing Agent — Product Spec
**Internal Working Document**
---

## Overview

This document covers the combined v0 and v1 product. v0 is a single instrumented pipeline proving the core thesis — stablecoin rails outperform card rails for automated cross-border supplier payments. v1 is the first real product: multi-operator, self-serve, with exception handling and a basic operator interface.

The line between v0 and v1 is not a rewrite. v1 is v0 with the concierge parts replaced by software.

---

## v0 — Reliable Execution

### What it is

A single pipeline. One operator, a handful of pre-vetted suppliers, a Tempo-backed wallet with spending policies defined in a YAML config file. Every step logged. Every transaction timed. The entire point is to produce data showing the delta between card rails and Tempo rails.

### What it does

1. Receives a restock signal (manually triggered or via webhook from Shopify/a spreadsheet)
2. Looks up the SKU in the pre-mapped catalog — Supplier Y, Price Z
3. Checks the spend policy — is this supplier approved, is the amount within limits?
4. Initiates the Tempo transfer
5. Logs the outcome — timestamp, amount, supplier, settlement time, status

That's the entire loop. No UI. No dashboard. No edge case handling. If something unexpected happens, it fails and logs the failure.

### What it is not

- A platform
- A multi-tenant system
- A product with a UI
- Self-serve in any way

Everything in v0 is concierge. The operator is onboarded manually. Suppliers are pre-vetted by the team. The config file is edited by the team. The audit log is queried directly.

### User stories

**As an operator**, I want my restock signal to trigger a supplier payment automatically, so I don't have to initiate it manually and risk it being blocked by my card provider.

**As an operator**, I want every payment logged with a timestamp and outcome, so I can show my accountant what was paid, when, and to whom.

**As the team**, we want every transaction timed end-to-end — from signal to settlement — so we can measure the delta against card rail benchmarks.

### Spend policy (YAML config)

```yaml
operator: acme-store
wallet: 0xABC123...
suppliers:
  - id: supplier-shenzhen-a
    name: Shenzhen Textiles Co.
    wallet: 0xDEF456...
    max_per_transaction: 5000
    max_per_month: 25000
    approved: true
  - id: supplier-guangzhou-b
    name: Guangzhou Electronics Ltd.
    wallet: 0xGHI789...
    max_per_transaction: 3000
    max_per_month: 15000
    approved: true
global:
  require_approval_above: 10000
  alert_email: operator@acme.com
```

### Audit log (append-only)

Every event written to an append-only log. No deletes. No edits. Fields:

```
timestamp | event_type | operator_id | supplier_id | amount | currency | status | settlement_time_ms | notes
```

Event types: `signal_received`, `policy_check_passed`, `policy_check_failed`, `transfer_initiated`, `transfer_settled`, `transfer_failed`, `manual_review_required`

### Success criteria

| Metric | Card Rail (baseline) | Tempo Rail (target) |
|---|---|---|
| Transaction success rate | ~60% | >98% |
| Avg. time to settlement | 2–48 hours | <5 minutes |
| Manual intervention rate | ~30% | <2% |
| Blocked recovery time | 4–24 hours | N/A |

If these numbers hold across real transactions with real money, v0 is done and v1 begins.

### What we are explicitly not building in v0

- Admin UI of any kind
- Self-serve supplier onboarding
- Exception handling logic
- Multi-operator support
- Automated restock triggers (manual trigger only for first transactions)
- A Retool dashboard (week 3 nice-to-have at earliest)

---

## v0 → v1 Transition Trigger

v1 begins when all of the following are true:

- At least 3 operators have run real transactions through v0
- Transaction success rate is >95% across those operators
- At least one operator has said unprompted they want to add a new supplier or adjust their limits
- The team has enough exception data to know what the most common failure modes are

The last point matters. v1's core feature — managed exceptions — should be built from real failure data, not anticipated failure modes.

---

## v1 — Managed Exceptions

### What changes

v1 replaces the concierge layer with software. The operator can onboard themselves, configure their own suppliers and spending limits, and manage their own wallet. The agent gains the ability to reason about edge cases rather than failing silently.

The payment loop is identical to v0. What changes is what happens at the edges.

### New capabilities in v1

#### 1. Operator onboarding (self-serve)

Operator signs up, connects their Shopify store or provides a webhook endpoint, funds their Tempo wallet, and configures their first supplier. Target onboarding time: under 30 minutes.

Onboarding steps:
1. Create account
2. Fund Tempo wallet (USDC via on-ramp or direct transfer)
3. Add first supplier — name, wallet address, spending limits
4. Map first SKU to supplier
5. Run a test transaction (small amount, operator-selected supplier)
6. Confirm settlement, review log entry
7. Enable live triggers

Suppliers are still verified by the team in v1 before being marked active. Self-serve supplier verification is v2.

#### 2. Exception handling — the managed middle

This is the core of v1. Instead of failing silently when something unexpected happens, the agent:

1. Identifies the exception
2. Decides whether it can resolve it autonomously (within policy) or needs operator input
3. If operator input needed — sends a notification with context and a clear decision request
4. Waits for operator response
5. Executes based on response
6. Logs the exception, the decision, and the outcome

**Exception types and handling:**

| Exception | Agent behaviour |
|---|---|
| Invoice amount > PO by ≤5% | Pay automatically, flag in log |
| Invoice amount > PO by 5–20% | Notify operator, request approval, hold payment |
| Invoice amount > PO by >20% | Hold payment, notify operator, require manual review |
| Supplier wallet address changed | Hold payment, notify operator, require explicit re-approval of new address |
| Supplier unresponsive >24hrs after payment | Notify operator, log status |
| Payment failed on Tempo network | Retry once after 10 minutes, notify operator if retry fails |
| Spend limit would be exceeded | Hold payment, notify operator |
| Unrecognised supplier in restock signal | Reject, notify operator |

**What the operator sees when an exception fires:**

A push notification (and email fallback):

> *Your agent held a payment to Shenzhen Textiles Co.*
> *Invoice: $4,200 — PO was $3,500 (20% higher than expected)*
> *Approve payment / Reject payment / Ask me later*

One tap. That's the interaction. The agent logs the decision and either proceeds or holds.

#### 3. Operator dashboard (basic)

Not a full analytics suite. The minimum needed to replace the audit log query for non-technical operators.

**Dashboard surfaces:**

- Wallet balance (current, with low-balance alert threshold)
- Recent transactions (last 30, with status)
- Pending approvals (exceptions waiting for operator decision)
- Supplier list (active, inactive, pending verification)
- Monthly summary (total volume, number of transactions, success rate)

**What is not in the v1 dashboard:**

- Charts or analytics
- Multi-currency views
- Supplier performance comparison
- Any reporting beyond the monthly summary

#### 4. Monthly summary notification

The most important product surface in v1. Sent automatically at the start of each month.

> *February summary for Acme Store*
> *14 payments processed — $61,400 settled*
> *Avg. settlement time: 3.2 minutes*
> *Exceptions flagged: 2 (both approved by you)*
> *0 payments blocked*

The counterfactual line — "based on transaction patterns, approximately 5 of these payments would likely have been flagged on card rails" — is added once there is enough data to make it credible. Not before.

#### 5. Supplier management (operator-controlled)

Operators can add, edit, and deactivate suppliers themselves. Team verification still required before a supplier goes live.

Supplier record fields:
- Name
- Tempo wallet address (verified by team)
- Default currency
- Per-transaction limit
- Monthly limit
- Approval threshold (above what amount does this supplier require manual approval)
- Active / inactive status
- Notes (free text, for operator reference)

### User stories

**As an operator**, I want to onboard myself without talking to the team, so I can get started without waiting for a call.

**As an operator**, I want to be notified when the agent holds a payment, so I can approve or reject it from my phone without logging into anything.

**As an operator**, I want to see my wallet balance and recent transactions in one place, so I know the system is working without having to ask.

**As an operator**, I want a monthly summary of what the agent did, so I can show my accountant and remember why I'm paying for this.

**As an operator**, I want to add a new supplier myself, so I'm not dependent on the team every time my supply chain changes.

**As the team**, we want exception data logged with full context — what happened, what the agent decided, what the operator decided — so we can improve the exception handling logic over time.

### What is not in v1

- Automated supplier verification (still manual/team)
- Multi-supplier routing per SKU
- Price comparison across suppliers
- Any form of autonomous sourcing
- Multi-agent support
- API access for operators
- Zapier or native integrations beyond Shopify webhook
- Mobile app (web-responsive only)

---

## Data Model (simplified)

```
Operator
  - id
  - name
  - email
  - wallet_address
  - wallet_balance
  - created_at
  - status (active / suspended)

Supplier
  - id
  - operator_id
  - name
  - wallet_address
  - verified (boolean — team-verified)
  - per_transaction_limit
  - monthly_limit
  - approval_threshold
  - status (active / inactive / pending)

SKU
  - id
  - operator_id
  - sku_code
  - supplier_id
  - unit_price
  - currency

Transaction
  - id
  - operator_id
  - supplier_id
  - sku_id
  - amount
  - currency
  - status (pending / settled / failed / held / rejected)
  - initiated_at
  - settled_at
  - settlement_time_ms
  - exception_type (nullable)
  - exception_resolved_by (agent / operator / null)
  - notes

Exception
  - id
  - transaction_id
  - type
  - detected_at
  - resolved_at
  - resolution (approved / rejected / auto-resolved)
  - resolved_by (agent / operator)
  - operator_notified_at
```

---

## Open Questions

These need answers before v1 build begins — not before v0.

1. **Supplier verification process:** What exactly does team verification involve? Wallet address confirmation, KYC, both? How long does it take? This is a concierge bottleneck in v1 that becomes a self-serve flow in v2.

2. **Wallet funding UX:** How does an operator fund their Tempo wallet? Is there a fiat on-ramp, or do they need to arrive with USDC? This is a significant adoption friction point.

3. **Notification delivery:** Push notification requires a mobile app or a PWA. Email is the fallback but is slower. What's the v1 approach?

4. **Approval timeout:** If the operator doesn't respond to an exception notification within X hours, what happens? Auto-reject? Escalate? This needs a defined default.

5. **Compliance surface:** At what transaction volume does v1 trigger money transmission concerns? Need a compliance opinion before v1 goes live at scale.

---

## What Comes After v1

v2 introduces multi-supplier routing per SKU — the agent routes based on availability and operator-defined rules, not just a fixed supplier mapping. That's a different trust conversation and a different product. It doesn't begin until operators have enough v1 history to trust the agent's execution, and the team has enough exception data to build routing logic that doesn't surprise anyone.

Everything beyond v1 is downstream of proving the delta is real.