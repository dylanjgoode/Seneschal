import { Fragment } from "react";
import { Reveal } from "./animate";

const steps = [
  {
    number: "01",
    title: "You set the rules",
    description:
      "Approved suppliers, spending limits, approval thresholds. A config, not a contract.",
  },
  {
    number: "02",
    title: "The agent executes",
    description:
      "Restock signal comes in, policy is checked, payment is initiated and settled. Minutes, not days.",
  },
  {
    number: "03",
    title: "Exceptions come to you",
    description:
      "If something\u2019s outside policy, you get a notification with a single decision to make. One tap.",
  },
];

const transactions = [
  {
    time: "09:12:04",
    supplier: "Apex Textiles",
    amount: "$2,340.00",
    status: "settled" as const,
    settlement: "1.2s",
  },
  {
    time: "09:14:22",
    supplier: "Shenzhen MFG Co",
    amount: "$8,100.00",
    status: "settled" as const,
    settlement: "0.9s",
  },
  {
    time: "09:15:01",
    supplier: "Nordic Parts AB",
    amount: "$950.00",
    status: "settled" as const,
    settlement: "1.1s",
  },
  {
    time: "09:18:47",
    supplier: "Apex Textiles",
    amount: "$4,200.00",
    status: "settled" as const,
    settlement: "1.4s",
  },
  {
    time: "09:22:33",
    supplier: "Apex Textiles",
    amount: "$12,500.00",
    status: "held" as const,
    settlement: "\u2014",
    exception: "exceeds per-txn limit \u2192 awaiting operator review",
  },
];

export function HowItWorks() {
  return (
    <section className="px-6 md:px-10 py-20 border-t border-white/[0.06]">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40 mb-10">
          How it works
        </p>

        {/* Steps */}
        <Reveal stagger>
          <div className="grid gap-10 md:grid-cols-3 md:gap-12 mb-16">
            {steps.map((step) => (
              <div key={step.number}>
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="font-mono text-xs text-white/20">
                    {step.number}
                  </span>
                  <h3 className="text-base font-medium text-white/90">
                    {step.title}
                  </h3>
                </div>
                <p className="text-[16px] leading-relaxed text-white/70 md:pl-[calc(0.75rem+2ch)]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Terminal transaction log */}
        <Reveal terminal>
          <div className="border border-white/[0.08] rounded-md overflow-hidden bg-[oklch(0.12_0_0)]">
            {/* Terminal header */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06] bg-[oklch(0.14_0_0)]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/[0.08]" />
              </div>
              <p className="font-mono text-xs text-white/25 ml-3">
                seneschal &mdash; transaction log
              </p>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 animate-pulse" />
                <span className="font-mono text-[11px] text-emerald-500/50">live</span>
              </div>
            </div>

            {/* Log content */}
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-sm">
                <thead>
                  <tr className="border-b border-white/[0.05] text-xs uppercase tracking-[0.12em] text-white/30">
                    <th className="text-left px-5 py-3 font-normal">Time</th>
                    <th className="text-left px-5 py-3 font-normal">Supplier</th>
                    <th className="text-right px-5 py-3 font-normal">Amount</th>
                    <th className="text-left px-5 py-3 font-normal">Status</th>
                    <th className="text-right px-5 py-3 font-normal">Settlement</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, i) => (
                    <Fragment key={i}>
                      <tr
                        className={`terminal-row border-b border-white/[0.03] ${
                          tx.status === "held"
                            ? "bg-[oklch(0.75_0.12_75_/_0.04)]"
                            : ""
                        }`}
                      >
                        <td className="px-5 py-3 text-white/30">{tx.time}</td>
                        <td className="px-5 py-3 text-white/60">{tx.supplier}</td>
                        <td className="px-5 py-3 text-right tabular-nums text-white/70">
                          {tx.amount}
                        </td>
                        <td className="px-5 py-3">
                          {tx.status === "settled" ? (
                            <span className="inline-flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/70" />
                              <span className="text-emerald-400/70">{tx.status}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.75_0.12_75)]" />
                              <span className="text-[oklch(0.75_0.12_75_/_0.9)]">{tx.status}</span>
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right tabular-nums text-white/40">
                          {tx.settlement}
                        </td>
                      </tr>
                      {tx.exception && (
                        <tr key={`${i}-ex`} className="terminal-row">
                          <td
                            colSpan={5}
                            className="px-5 pb-3 pt-0 text-xs text-[oklch(0.75_0.12_75_/_0.5)]"
                          >
                            <span className="pl-6">
                              └ exception: {tx.exception}
                            </span>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Terminal cursor line */}
            <div className="px-5 py-3 border-t border-white/[0.04] flex items-center gap-2">
              <span className="font-mono text-xs text-white/20">$</span>
              <span
                className="w-[7px] h-[14px] bg-white/25"
                style={{ animation: "cursor-blink 1.2s step-end infinite" }}
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
