import { Reveal } from "./animate";

const stats = [
  { value: "12", label: "operators in pilot" },
  { value: "$240K", label: "processed in testing" },
  { value: "1.2s", label: "avg settlement time" },
];

function AvatarPlaceholder() {
  return (
    <div className="w-full aspect-[3/4] rounded-sm bg-[oklch(0.18_0_0)] border border-white/[0.06] flex items-end justify-center overflow-hidden">
      {/* Shoulder/bust silhouette */}
      <svg
        viewBox="0 0 200 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full"
        aria-hidden
      >
        {/* Head */}
        <circle cx="100" cy="80" r="38" fill="oklch(0.22 0 0)" />
        {/* Body/shoulders */}
        <path
          d="M20 240 C20 170 50 145 100 140 C150 145 180 170 180 240Z"
          fill="oklch(0.22 0 0)"
        />
      </svg>
    </div>
  );
}

export function SocialProof() {
  return (
    <section className="px-6 md:px-10 py-20 border-t border-white/[0.06]">
      <div className="mx-auto max-w-6xl">

        {/* Stats row */}
        <Reveal stagger>
          <div className="flex flex-wrap gap-px mb-16 border border-white/[0.06] rounded-sm overflow-hidden bg-white/[0.06]">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex-1 min-w-[120px] bg-[oklch(0.15_0_0)] px-8 py-6"
              >
                <p className="font-mono text-[clamp(1.5rem,3vw,2.25rem)] font-bold text-white tabular-nums">
                  {s.value}
                </p>
                <p className="font-mono text-xs text-white/40 mt-1 uppercase tracking-[0.15em]">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Testimonial */}
        <div className="grid md:grid-cols-[1fr_2fr] gap-10 md:gap-16 items-start">
          {/* Left: photo + attribution */}
          <Reveal>
            <div className="max-w-[220px]">
              <AvatarPlaceholder />
              <div className="mt-4">
                <p className="text-sm font-medium text-white/80">Anonymous</p>
                <p className="font-mono text-xs text-white/40 mt-0.5">
                  Apparel brand owner, Chicago
                </p>
              </div>
            </div>
          </Reveal>

          {/* Right: case story */}
          <Reveal stagger>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40 mb-8">
              From the pilot
            </p>

            <blockquote className="text-[clamp(1.1rem,2vw,1.4rem)] leading-relaxed text-white/80 font-medium mb-8 border-l-2 border-white/20 pl-6">
              &ldquo;It used to take a day of back-and-forth to get a payment
              through. Now I don&apos;t think about it.&rdquo;
            </blockquote>

            <div className="space-y-4 text-[15px] leading-relaxed text-white/50 max-w-xl">
              <p>
                She&apos;d been sourcing from the same Guangdong manufacturer
                for three years. Payments would go through — eventually — but
                nearly every quarter something got flagged. A day on the phone,
                a workaround, a delayed shipment.
              </p>
              <p>
                She onboarded Seneschal in January. Since then, 14 supplier
                payments have settled automatically. None have been blocked. She
                reviews exceptions twice a week, from her phone.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
