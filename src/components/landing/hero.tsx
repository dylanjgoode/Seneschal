import Link from "next/link";
import { Reveal } from "./animate";

export function Hero() {
  return (
    <section className="relative px-6 md:px-10 pt-36 pb-20 md:pt-44 md:pb-24">
      <div className="mx-auto max-w-6xl">
        <Reveal stagger>
          <div className="mb-12">
            <h1 className="font-mono text-[clamp(2.5rem,7vw,5.5rem)] font-bold leading-[0.95] tracking-tight text-white">
              The AI Agent for
              <br />
              your supply chain.
            </h1>
            <p className="mt-1 font-mono text-[clamp(2.5rem,7vw,5.5rem)] font-bold leading-[0.95] tracking-tight text-white/40">
              Your Seneschal.
            </p>
          </div>
          <p className="max-w-lg text-lg leading-relaxed text-white/70">
            Seneschal automates your international supplier payments over
            settlement infrastructure where card blocks don&apos;t exist.
            <span className="text-white/90"> <br /> <br /> You set the rules. <br /> The agent handles execution.</span>
          </p>
          <div className="mt-10">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-3 font-mono text-sm tracking-wide text-white/80 hover:text-white transition-colors"
            >
              <span className="flex h-11 items-center border border-white/15 rounded-full px-7 group-hover:border-white/30 group-hover:bg-white/[0.04] transition-all">
                Get started
              </span>
              <span className="text-white/30 group-hover:text-white/60 transition-colors">&rarr;</span>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
