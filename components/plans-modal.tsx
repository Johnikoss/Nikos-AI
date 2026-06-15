"use client";

import { useState } from "react";
import { Check, Loader2, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type Plan = {
  id: string;
  name: string;
  price: string;
  period: string;
  tagline: string;
  features: string[];
  cta: string;
  highlight?: boolean;
  current?: boolean;
};

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "/month",
    tagline: "Get oriented.",
    features: [
      "Unlimited conversations",
      "All 6 navigation modes",
      "Basic memory (name & focus)",
      "Stored privately on your device",
    ],
    cta: "Your current plan",
    current: true,
  },
  {
    id: "plus",
    name: "Plus",
    price: "$12",
    period: "/month",
    tagline: "Navigate seriously.",
    features: [
      "Everything in Free",
      "Long-term memory across sessions",
      "Proactive check-ins on your goals",
      "Saved plans & decision history",
      "Priority response speed",
    ],
    cta: "Upgrade to Plus",
    highlight: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    period: "/month",
    tagline: "Your full strategist.",
    features: [
      "Everything in Plus",
      "Deep weekly life reviews",
      "Connect calendar & notes (soon)",
      "Multiple life tracks",
      "Early access to new modes",
    ],
    cta: "Upgrade to Pro",
  },
];

export function PlansModal({ onClose }: { onClose: () => void }) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout(planId: string) {
    setError(null);
    setLoadingPlan(planId);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Could not start checkout.");
      }

      // Hand off to Stripe's hosted checkout page.
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout.");
      setLoadingPlan(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="glass-strong relative z-10 max-h-full w-full max-w-3xl overflow-y-auto scroll-thin rounded-3xl p-7 fade-up">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-5" />
        </button>

        <div className="mb-7 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#4F7CFF]/30 bg-[#4F7CFF]/10 px-3 py-1 text-[11px] font-medium text-[#9DB4FF]">
            <Zap className="size-3" /> Membership
          </span>
          <h2 className="mt-3 font-serif text-2xl font-medium sm:text-3xl">Upgrade your navigation</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Free gets you thinking clearly. Paid plans let Nikos remember more and stay one step ahead.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.id}
              className={cn(
                "relative flex flex-col rounded-2xl border p-5",
                p.highlight
                  ? "border-[#4F7CFF]/50 bg-[#4F7CFF]/[0.08]"
                  : "border-white/10 bg-white/[0.02]"
              )}
            >
              {p.highlight && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-[#4F7CFF] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                  Most popular
                </span>
              )}
              <div className="mb-1 text-sm font-semibold">{p.name}</div>
              <div className="mb-1 flex items-end gap-1">
                <span className="text-3xl font-semibold">{p.price}</span>
                <span className="pb-1 text-xs text-muted-foreground">{p.period}</span>
              </div>
              <p className="mb-4 text-[13px] text-muted-foreground">{p.tagline}</p>

              <ul className="mb-5 flex-1 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px] text-foreground/85">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-[#6D8EFF]" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                disabled={p.current || loadingPlan !== null}
                onClick={() => (p.current ? onClose() : startCheckout(p.id))}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-60",
                  p.current
                    ? "cursor-default border border-white/10 text-muted-foreground"
                    : p.highlight
                    ? "btn-primary"
                    : "border border-white/15 text-foreground hover:bg-white/5"
                )}
              >
                {loadingPlan === p.id && <Loader2 className="size-4 animate-spin" />}
                {loadingPlan === p.id ? "Redirecting…" : p.cta}
              </button>
            </div>
          ))}
        </div>

        {error && (
          <p className="mt-4 text-center text-[12px] text-red-300">{error}</p>
        )}
        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          Secure checkout powered by Stripe. Cancel anytime.
        </p>
      </div>
    </div>
  );
}
