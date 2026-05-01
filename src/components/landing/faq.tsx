import { ReactNode } from "react";
import { Reveal } from "./animate";

const questions: { question: string; answer: ReactNode }[] = [
  {
    question: "What does getting started actually look like?",
    answer:
      "We start by mapping your existing international supplier payments — volumes, currencies, which ones get blocked most. From there, our team contacts your suppliers directly and handles the migration from traditional rails to stablecoin wallets. Once they're set up, you're on the platform: rules configured, payments automated. Most operators are live within a week.",
  },
  {
    question: "How does the payment actually work?",
    answer: (
      <>
        When a restock signal comes in, Seneschal checks it against your spend
        policy and initiates a stablecoin transfer over{" "}
        <a
          href="https://tempo.xyz/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/70 underline underline-offset-2 decoration-white/30 hover:decoration-white/60 transition-colors"
        >
          Tempo
        </a>{" "}
        — Stripe&apos;s settlement blockchain. The supplier receives funds
        directly to their verified wallet, typically within two minutes. You
        never interact with the underlying mechanism unless an exception
        surfaces.
      </>
    ),
  },
  {
    question: "Do my suppliers need to hold crypto?",
    answer:
      "No. Suppliers receive funds to a verified wallet address, but most convert to local fiat immediately through standard on/off ramps. Our team handles supplier verification and wallet setup as part of onboarding — it typically takes less than a day.",
  },
  {
    question: "What happens if a payment fails or something looks wrong?",
    answer:
      "If a transfer fails, Seneschal holds the payment and routes it to your exceptions queue — the same flow as a policy breach. You get a notification with the details and a single decision to make. Nothing settles without your approval once it's flagged. Every action is written to an append-only audit log.",
  },
  {
    question: "How do I set my spending rules?",
    answer:
      "Rules are defined in a simple config: approved supplier list, per-transaction limits, daily caps, and approval thresholds. Anything inside policy executes automatically. Anything outside comes to you as an exception. You can update rules at any time — changes take effect on the next transaction.",
  },
  {
    question: "Is this regulated?",
    answer:
      "Yes. We operate as a registered Money Services Business (MSB) under FinCEN, with AML and KYC controls applied at onboarding for both operators and suppliers. We're happy to provide compliance documentation during due diligence.",
  },
];

export function Faq() {
  return (
    <section className="px-6 md:px-10 py-20 border-t border-white/[0.06]">
      <div className="mx-auto max-w-6xl">
        <div className="grid md:grid-cols-[1fr_2fr] gap-10">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
            FAQ
          </p>

          <Reveal stagger>
            <div className="divide-y divide-white/[0.06]">
              {questions.map((q) => (
                <details key={q.question} className="group">
                  <summary className="flex cursor-pointer items-center justify-between py-5 text-base font-medium text-white/80 hover:text-white transition-colors [&::-webkit-details-marker]:hidden list-none">
                    {q.question}
                    <span className="ml-6 flex-shrink-0 font-mono text-base text-white/25 group-open:rotate-45 transition-transform duration-200">
                      +
                    </span>
                  </summary>
                  <p className="pb-5 text-[15px] leading-relaxed text-white/50 max-w-lg">
                    {q.answer}
                  </p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
