"use client";

import { useState } from "react";

export function BottomCta() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      businessType: formData.get("businessType"),
      hadPaymentBlocked: formData.get("hadPaymentBlocked"),
    };

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setStatus("success");
      } else {
        const result = await response.json();
        setStatus("error");
        setErrorMessage(result.error || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <section className="px-6 md:px-10 py-20 border-t border-white/[0.06]">
      <div className="mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-start">
          {/* Left: copy */}
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40 mb-5">
              Get Started
            </p>
            <h2 className="text-[clamp(1.4rem,2.5vw,1.75rem)] font-medium leading-snug text-white/90 mb-3">
              Stop babysitting your international payments.
            </h2>
            <p className="text-base leading-relaxed text-white/50 mb-6">
              We&apos;re running a small pilot with operators who source internationally and are tired of babysitting payments.
            </p>
            <p className="text-base leading-relaxed text-white/50">
              Request early access below.
            </p>
          </div>

          {/* Right: CTA Form */}
          <div className="flex flex-col items-start md:items-end w-full">
            {status === "success" ? (
              <div className="w-full max-w-md p-6 border border-white/10 bg-white/[0.02] rounded-xl text-center">
                <h3 className="text-lg font-medium text-white/90 mb-2">You&apos;re on the list</h3>
                <p className="text-sm text-white/50">
                  We&apos;ll be in touch soon with next steps for the pilot.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
                <div>
                  <label htmlFor="name" className="block text-xs font-mono text-white/50 mb-1.5 uppercase tracking-wide">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white/90 text-sm focus:outline-none focus:border-white/30 focus:bg-white/[0.05] transition-colors"
                    placeholder="Jane Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-mono text-white/50 mb-1.5 uppercase tracking-wide">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white/90 text-sm focus:outline-none focus:border-white/30 focus:bg-white/[0.05] transition-colors"
                    placeholder="jane@company.com"
                  />
                </div>

                <div>
                  <label htmlFor="businessType" className="block text-xs font-mono text-white/50 mb-1.5 uppercase tracking-wide">Business Type / What you sell</label>
                  <input
                    type="text"
                    id="businessType"
                    name="businessType"
                    required
                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white/90 text-sm focus:outline-none focus:border-white/30 focus:bg-white/[0.05] transition-colors"
                    placeholder="e.g. Apparel brand, Hardware"
                  />
                </div>

                <div>
                  <label htmlFor="hadPaymentBlocked" className="block text-xs font-mono text-white/50 mb-1.5 uppercase tracking-wide">Have you had a cross-border supplier payment blocked or delayed in the last 12 months?</label>
                  <select
                    id="hadPaymentBlocked"
                    name="hadPaymentBlocked"
                    required
                    defaultValue=""
                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white/90 text-sm focus:outline-none focus:border-white/30 focus:bg-white/[0.05] transition-colors appearance-none"
                  >
                    <option value="" disabled>Select an option</option>
                    <option value="yes" className="bg-[#0a0a0a] text-white">Yes</option>
                    <option value="no" className="bg-[#0a0a0a] text-white">No</option>
                    <option value="its_complicated" className="bg-[#0a0a0a] text-white">It&apos;s complicated</option>
                  </select>
                </div>

                {status === "error" && (
                  <p className="text-red-400 text-sm mt-2">{errorMessage}</p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full mt-2 group inline-flex justify-center items-center gap-3 font-mono text-sm tracking-wide text-white/80 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="flex w-full h-12 items-center justify-center border border-white/15 rounded-lg px-8 group-hover:border-white/30 group-hover:bg-white/[0.04] transition-all">
                    {status === "loading" ? "Submitting..." : "Request early access"}
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
