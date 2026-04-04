import { Reveal } from "./animate";

const questions = [
  {
    question: "How does the payment actually work?",
    answer:
      "Payments settle over stablecoin (USDC) rails rather than card networks. The supplier receives funds directly to a verified wallet. Settlement typically takes under two minutes. You never need to touch the underlying mechanism.",
  },
  {
    question: "Do my suppliers need to do anything?",
    answer:
      "Yes \u2014 they need a compatible wallet address. Our team handles supplier verification and setup as part of onboarding. In practice, this takes less than a day for most suppliers.",
  },
  {
    question: "Is this regulated?",
    answer:
      "Yes, we operate within applicable money transmission frameworks. Longer answer available on request.",
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
