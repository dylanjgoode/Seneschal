# Project Brief: Stablecoin Purchasing Agent
**v0 Prototype — Internal Working Document**
*Last updated: April 2026*

---

## The Problem

E-commerce operators running $2M–$10M/year businesses with cross-border supply chains face a specific, expensive problem: their card payments get blocked.

When an AI agent or automation script attempts to purchase inventory from an international supplier, the transaction routinely triggers fraud detection systems. From the card network's perspective, the pattern looks suspicious:

- Unusual merchant category codes
- Cross-border transactions to flagged regions
- Programmatic purchase patterns — consistent timing, round amounts
- No human behavioural signals — no mouse movement, no typing cadence

The result: 40%+ of legitimate automated cross-border purchases get declined or held for manual review. This is not a flaw in fraud detection — it is working exactly as designed. Card networks optimise for consumer protection, not B2B automation.

The operator's options are all bad:

- Call the bank every time to unblock (hours of delay, unpredictable outcomes)
- Pre-notify the bank about expected purchases (still fails unpredictably)
- Rotate across multiple cards (increases complexity, often still fails)
- Abandon automation and do it manually (defeats the purpose of the agent)

> **⚠ Validate:** The 40%+ decline rate is a working assumption. Before proceeding to v1, this must be confirmed with data from 10–15 real operators. If the true rate is closer to 15%, the urgency of the problem changes materially.

---

## The Thesis

An AI purchasing agent funded with stablecoins can complete cross-border supplier purchases faster and more reliably than the same agent using traditional card rails.

The mechanism is straightforward: stablecoin transfers on Tempo do not route through card fraud models. There is no decline decision point. If the wallet has sufficient balance and the transaction is valid, it settles.

This creates a measurable delta between two payment paths:

- **Card rail:** Initiate purchase → fraud model evaluation → possible decline → possible manual unblock → settlement (if approved)
- **Tempo rail:** Initiate purchase → policy check (local, deterministic) → transfer → settlement

Policy enforcement moves from the payment network layer to the agent layer. The operator defines spending rules upfront. The agent enforces them deterministically. No ML model second-guessing whether this particular purchase looks legitimate.

---

## Success Criteria

If the thesis is correct, we should see a dramatic — not incremental — improvement across four metrics. Anything less than dramatic fails to justify building a platform.

| Metric | Card Rail (baseline) | Tempo Rail (target) |
|---|---|---|
| Transaction success rate | ~60% | >98% |
| Avg. time to settlement | 2–48 hours | <5 minutes |
| Manual intervention rate | ~30% | <2% |
| Blocked recovery time | 4–24 hours | N/A |

These are the numbers we need to hit with real suppliers and real money. If we hit them, we have a product. If we don't, we learned something valuable before building a platform nobody needs.

---

## Who We Are Building For

One person. Running a Shopify or Amazon store doing $2M–$10M/year. Just-in-time or drop-ship model. Already has some automation — even if it is janky Zapier chains. Currently losing time or money to:

- Card freezes on international purchases
- Failed transactions requiring manual intervention
- Compliance delays that break fulfilment SLAs

We are building for this one person's workflow. If it does not solve their specific problem dramatically better than their current approach, nothing else matters.

---

## What This Prototype Is — And Is Not

### What it is

A single, heavily instrumented pipeline designed to produce one thing: data showing the delta between card and Tempo rails.

- One agent, one operator, a handful of pre-vetted suppliers
- A Tempo-backed wallet with spending policies defined in static config
- Every step logged, every transaction timed

### What it is not

- A platform or multi-tenant system
- A product with a polished UI
- A self-serve onboarding flow
- A Shopify App Store listing

All of that comes later — if and only if the delta is real.

---

## The Four Assumptions We Are Testing

### 1. The delta is real and measurable

Agent purchases via Tempo must complete faster and with a higher success rate than card purchases. Not 10% better — dramatically better. "Never gets blocked" vs "blocked 40% of the time." If this delta is not dramatic, the product does not have a reason to exist.

### 2. Suppliers will accept this

Even with concierge onboarding, international suppliers must accept stablecoin payment — directly or via off-ramp — without requiring lengthy KYC on their end. If every supplier demands three weeks of onboarding, the speed advantage evaporates.

> **⚠ Risk:** Supplier adoption is the single most critical execution risk in this prototype — not a footnote. Many suppliers in China, Vietnam, and India face real friction converting USDC to local fiat, have compliance anxiety, or have no crypto infrastructure at all. This deserves disproportionate attention in the concierge onboarding phase.

### 3. Operators will trust agent-held wallets

The spending policy engine must be sufficient for operators to fund wallets with meaningful amounts. If they will not put more than $500 in an agent-controlled wallet, the product cannot serve real purchase volumes. We are starting small and instrumenting everything to earn that trust incrementally.

### 4. Regulatory viability

Stablecoin B2B purchasing must not create compliance problems equally painful to the card fraud problem we are solving. We are not just sidestepping fraud models — we need to confirm we are not trading one headache for another.

> **⚠ Action required:** The operator profile we are targeting — cross-border purchasing, agent-held wallets, $2M–$10M volumes — sits squarely in the zone that triggers money transmission and sanctions screening concerns in the US, EU, and UK. A compliance opinion should be obtained before the prototype runs at meaningful transaction volumes, not after.

---

## Architecture Decisions

Each decision below trades sophistication for speed-to-signal. The reasoning is explicit and intentional.

**Single wallet per operator, not per-agent**
Multi-agent wallet isolation is a v2 concern. For v0, we are proving the core payment flow works.

**Static policy config (YAML), no admin UI**
We are proving the concept, not building an admin panel. The operator can edit a config file.

**Manual supplier onboarding**
We call suppliers, set up receiving wallets, confirm settlement works. This is deliberately concierge-level — we are building the supplier relationship dataset that becomes the moat. Note: supplier relationships in e-commerce are historically non-exclusive. The moat here is more likely to be the policy engine design and agent behavioural data than the supplier list itself. Worth testing this assumption explicitly.

**Pre-mapped catalog, no autonomous sourcing**
The agent works from "SKU X → Supplier Y at price Z." Autonomous supplier discovery and negotiation is v3+.

**Append-only audit log, no dashboard**
Query it directly. A Retool dashboard is a week-3 nice-to-have.

**Tempo as the initial rail — not the only possible rail**
The thesis is that stablecoin rails solve the problem. Tempo is the first implementation of that thesis. If Tempo has reliability issues, changes pricing, or restricts access, the architecture should allow substitution. Avoid building the product in a way that treats Tempo specifically as the value proposition.

---

## Risks We Are Explicitly Accepting

- **Supplier off-ramp friction:** If suppliers cannot easily convert USDC to local fiat, adoption stalls. This is the highest-priority risk to test first in the concierge phase.
- **Tempo network reliability:** If Tempo has downtime or slow finality during critical purchase windows, the value prop weakens. We are logging all timing data.
- **Regulatory uncertainty:** Stablecoin B2B payments exist in a grey area in many jurisdictions. We will not build for scale until we have a compliance opinion in hand.
- **Operator trust:** Putting meaningful capital in an agent-controlled wallet requires trust in the policy engine and agent behaviour. We are starting small and instrumenting everything.

---

## If the Thesis Validates: What Comes Next

- **v1:** Shopify App Store integration, self-serve supplier directory, basic operator dashboard
- **v2:** Multi-agent support, dynamic policy adjustment, automated supplier onboarding
- **v3:** Autonomous sourcing, price negotiation, ZK-attested agent identity

None of that matters until we prove the delta is real. The prototype exists to answer one question: does moving payment policy enforcement from the network layer to the agent layer eliminate a meaningful class of failures for cross-border e-commerce operators?

Everything else is downstream of the answer.