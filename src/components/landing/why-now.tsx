import { ReactNode } from "react";
import { Reveal } from "./animate";

const forces: { label: string; title: string; description: ReactNode }[] = [
  {
    label: "01",
    title: "Settlement infrastructure matured",
    description: (
      <>
        Stablecoin rails now settle in seconds, not days. Seneschal runs on{" "}
        <a
          href="https://tempo.xyz/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/90 underline underline-offset-2 decoration-white/30 hover:decoration-white/60 transition-colors"
        >
          Tempo
        </a>{" "}
        — Stripe&apos;s settlement blockchain — the same infrastructure major
        platforms are already plugged into.
      </>
    ),
  },
  {
    label: "02",
    title: "AI agents can execute workflows",
    description:
      "Agents are now for the first time capable enough to handle structured purchasing workflows end-to-end.",
  },
  {
    label: "03",
    title: "Fraud models are getting tighter",
    description:
      "Card network fraud detection is blocking more legitimate cross-border transactions, not fewer. The problem is accelerating.",
  },
];

export function WhyNow() {
  return (
    <section className="px-6 md:px-10 py-24 border-t border-white/[0.06]">
      <div className="mx-auto max-w-6xl">

        {/* The Problem */}
        <div className="mb-24 max-w-3xl">
          <Reveal stagger>
            <p className="border-l-2 border-white/10 pl-6 md:pl-8 text-[clamp(1.25rem,2vw,1.75rem)] leading-relaxed text-white/70 mb-8">
              You initiate a payment to a supplier you&apos;ve paid for two
              years. A fraud algorithm somewhere decides the pattern looks
              suspicious. <span className="text-white">Your card is blocked.</span>
            </p>
            <p className="border-l-2 border-white/10 pl-6 md:pl-8 text-[clamp(1.25rem,2vw,1.75rem)] leading-relaxed text-white/70 mb-8">
              You spend a day on the phone. You eventually get it through. Your
              supplier almost gave your production slot to someone else.
            </p>
            <p className="border-l-2 border-white/40 pl-6 md:pl-8 text-[clamp(1.25rem,2vw,1.75rem)] leading-relaxed text-white font-medium">
              You know it&apos;s going to happen again.
            </p>
          </Reveal>
        </div>

        {/* Why Now */}
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40 mb-10">
          Why now
        </p>
        <Reveal stagger>
          <div className="grid gap-px md:grid-cols-3 bg-white/[0.06] border border-white/[0.06] rounded-sm overflow-hidden">
            {forces.map((force) => (
              <div
                key={force.label}
                className="bg-[oklch(0.15_0_0)] p-8 md:p-10"
              >
                <p className="font-mono text-sm text-white/40 mb-5">
                  {force.label}
                </p>
                <h3 className="text-xl font-medium text-white/90 mb-3">
                  {force.title}
                </h3>
                <p className="text-base leading-relaxed text-white/70">
                  {force.description}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
