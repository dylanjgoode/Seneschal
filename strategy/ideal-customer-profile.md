# Ideal Customer Profile — Tempo Purchasing Agent

**Last updated:** April 2026
**Stage:** Design partner / v0 pilot

---

## Who we're building for

Tempo's v0 customer is a founder or head of operations at a product-based business who sources physical goods from international suppliers. They have personally experienced a cross-border supplier payment being blocked, delayed, or flagged — not once, but repeatedly — and they haven't found a fix that actually removes the friction. They're not looking for a fintech product. They're looking for their supply chain to stop breaking.

---

## Firmographic profile

| Attribute | Target range |
|---|---|
| Revenue | $2M–$20M |
| Business type | Product-based: e-commerce, DTC, CPG, hardware, apparel, cosmetics |
| Sourcing | 3+ international suppliers; primary corridors include China, Turkey, India, Vietnam, South Korea |
| Payments | Currently using card rails (Visa/Mastercard business cards) or bank wire for supplier payments |
| Geography | English-speaking markets preferred for v0 (Ireland, UK, US, ANZ) |
| Team size | 5–100 employees |

---

## Psychographic profile

The ICP is a **builder-operator** — someone who is still close to the operational details of their business even as it scales. They care about reliability over complexity. They've cobbled together workarounds for payment friction (calling their bank, using a personal card as backup, keeping a second account) and they're tired of it.

They are **not** a finance-led buyer. They make decisions quickly when the pain is real, they're comfortable with imperfect tools, and they'll give honest feedback. They're likely already using AI tools elsewhere in the business.

---

## The pain we're solving

The ICP has felt this specific sequence of events:

1. They initiate a recurring payment to a supplier they've used for months or years
2. The card is blocked — a fraud model flagged the transaction pattern
3. They spend hours (sometimes a full day) on the phone with their bank, re-submitting, escalating
4. Meanwhile, their supplier may give away their production slot, delay fulfilment, or demand a different payment method
5. The payment eventually clears, but the business damage is done — late inventory, delayed launch, strained supplier relationship

This isn't a once-a-year inconvenience. For operators sourcing internationally at $2M+ revenue, this happens every few months, sometimes monthly. The cumulative cost is significant and the stress is disproportionate to the transaction size.

**The pain is acute when:**
- The business launches products on a schedule and a delayed component or ingredient breaks the timeline
- Supplier relationships are competitive and losing a production slot to a payment hold has a real cost
- The operator is automating other parts of their workflow (Shopify, AI tools) and the payment step is the last manual bottleneck

---

## Qualifying signals

These are observable signals that suggest the ICP is a strong fit. Look for at least three.

**Business signals:**
- Product-based business with physical inventory
- Sources from 3+ international suppliers in at least one high-friction corridor (China, Turkey, India, Vietnam)
- Revenue between $2M–$20M — large enough to feel friction meaningfully, small enough that the founder is still close to it
- Recurring supplier payments (not one-off imports)
- Using Shopify or another e-commerce platform (suggests compatibility with v0 webhook trigger)

**Behavioural signals:**
- Founder or head of ops places or approves supplier payments personally
- Has a specific story about a payment block or delay — not "I've heard this is a problem" but "it happened to us last quarter"
- Comfortable using early-stage tools (has used beta products, gives direct feedback)
- Responds to direct, problem-first outreach rather than product-first pitches

**Context signals:**
- Has spoken publicly about supply chain, sourcing, or operational challenges (podcast, conference, LinkedIn)
- Is in a network where early-stage product testing is normalised (ecommerce communities, founder Slack groups)
- Has expressed frustration with banks or card networks in any public context

---

## Disqualifying signals

Move on quickly if you see these.

| Signal | Why it disqualifies |
|---|---|
| Finance-led buying process | Will require compliance, audit, and legal review before engaging — too slow for v0 |
| Domestic-only sourcing | The core pain doesn't exist for them |
| "Our bank wire system works fine" | No urgency; wrong moment |
| Revenue $50M+ | Procurement process will be too structured for a v0 pilot |
| Asks for a contract or SLA before seeing the product | Wrong stage; move on |
| Purely service-based business | No physical supplier payments; product doesn't apply |
| Sourcing from low-friction corridors only (Western Europe, US) | Payment friction is minimal; value proposition doesn't land |

---

## The decision-maker

The person we need to reach is **the operator** — the founder, co-founder, or head of operations who actually experiences the payment friction and has authority to try something new. This is almost never the CFO or Head of Finance at the $2M–$20M stage; it's the person who built the supplier relationships and still oversees the ordering cycle.

**Signs you're talking to the right person:**
- They can recall a specific payment incident without prompting
- They are the one who calls the bank when things go wrong
- They have visibility into the supplier approval and purchase order process
- They can say yes to a pilot without a procurement committee

**Signs you're talking to the wrong person:**
- They say "I'll need to check with our finance team"
- They ask about compliance documentation before hearing the product
- They have no visibility into how supplier payments are actually processed

---

## Jobs to be done

The ICP isn't hiring Tempo to "use stablecoins." They're hiring it to:

1. **Stop babysitting payments** — remove the manual intervention loop when a card gets blocked
2. **Protect supplier relationships** — ensure payments arrive on time even when card rails fail
3. **Reduce operational anxiety** — know that a restock signal will result in a settled payment without their involvement
4. **Have a clean audit trail** — be able to show their accountant what was paid, when, and to whom

The stablecoin mechanism is an implementation detail. The job is reliable, automated cross-border supplier payments.

---

## Profile in practice — the design partner archetype

The ideal design partner for v0 is a founder running a $3M–$12M product business, sourcing from China or Turkey or India, who placed an international supplier payment in the last 90 days that either got blocked or required manual intervention. They're on Shopify. They're the one who calls the bank. They have a war story they'll tell unprompted if you ask. And they're curious enough to try something early if the demo is credible.

They're not asking for a contract. They're asking: "Does this actually work?"

---

## What this ICP is not

- A large enterprise with a procurement function
- A pure services business
- A business that only sources domestically
- A crypto-native business looking to use stablecoins for ideological reasons
- A business where the founder is no longer close to operations

---

## Version notes

This ICP is written for the v0 pilot (1–3 design partners) and v1 launch (self-serve, up to ~20 operators). The profile will evolve as transaction data accumulates. Specifically:

- **v2 and beyond:** The ICP may expand to include operators with more complex multi-supplier routing needs, or businesses in adjacent verticals (raw materials, components) where similar payment friction exists
- **Geographic expansion:** v0 targets English-speaking markets. v2+ will likely extend to non-English markets where cross-border payment friction is even higher
- **Revenue ceiling:** The $20M upper bound is a v0 constraint driven by procurement process speed, not a fundamental product limitation
