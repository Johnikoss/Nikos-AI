"use client";

import { useState } from "react";
import { ArrowRight, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Profile, EMPTY_PROFILE } from "@/lib/memory";
import { Logo } from "@/components/logo";

const STYLES: { id: Profile["style"]; label: string; desc: string }[] = [
  { id: "direct", label: "Direct", desc: "Blunt. No softening." },
  { id: "gentle", label: "Steady", desc: "Calm, but never vague." },
  { id: "challenging", label: "Challenging", desc: "Push back on me." },
];

/**
 * 3-step onboarding that builds the persistent memory profile.
 * Shown on first visit, or reopened to EDIT memory — in which case it is
 * pre-filled with the existing profile and can be dismissed without overwriting.
 */
export function Onboarding({
  onDone,
  onClose,
  initial,
}: {
  onDone: (p: Profile) => void;
  onClose?: () => void;
  initial?: Profile;
}) {
  const editing = !!initial?.onboarded;
  const [step, setStep] = useState(0);
  const [name, setName] = useState(initial?.name ?? "");
  const [focus, setFocus] = useState(initial?.focus ?? "");
  const [style, setStyle] = useState<Profile["style"]>(initial?.style ?? "direct");

  const last = step === 2;
  const canNext = step === 0 ? name.trim().length > 0 : step === 1 ? focus.trim().length > 0 : true;

  function next() {
    if (!last) return setStep((s) => s + 1);
    onDone({
      ...EMPTY_PROFILE,
      ...(initial ?? {}),     // preserve notes & anything else when editing
      name: name.trim(),
      focus: focus.trim(),
      style,
      onboarded: true,
      updatedAt: Date.now(),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="glass-strong ring-glow relative z-10 w-full max-w-md overflow-hidden rounded-3xl p-7 fade-up">
        {/* Close (only when editing — first-time users use Skip) */}
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}

        {/* header */}
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo className="mb-4 h-14 w-14 glow-blue rounded-2xl p-2" />
          <h2 className="text-lg font-semibold tracking-tight">
            {step === 0 && (editing ? "What should I call you?" : "First — what should I call you?")}
            {step === 1 && "What are you navigating right now?"}
            {step === 2 && "How should I talk to you?"}
          </h2>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            {step === 0 && "I'll remember this so we never start from zero."}
            {step === 1 && "One honest sentence. The headline, not the whole story."}
            {step === 2 && "You can change this anytime."}
          </p>
        </div>

        {/* step body */}
        <div className="min-h-24">
          {step === 0 && (
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && canNext && next()}
              placeholder="Your name or a nickname"
              className="w-full rounded-xl glass px-4 py-3 text-sm outline-none focus:border-[#4F7CFF]/60"
            />
          )}
          {step === 1 && (
            <textarea
              autoFocus
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              rows={3}
              placeholder="e.g. Deciding whether to leave my job and go full-time on my side project."
              className="w-full resize-none rounded-xl glass px-4 py-3 text-sm outline-none focus:border-[#4F7CFF]/60"
            />
          )}
          {step === 2 && (
            <div className="flex flex-col gap-2.5">
              {STYLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  className={cn(
                    "flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors cursor-pointer",
                    style === s.id
                      ? "border-[#4F7CFF]/60 bg-[#4F7CFF]/10"
                      : "border-border glass-hover"
                  )}
                >
                  <span>
                    <span className="text-sm font-medium">{s.label}</span>
                    <span className="ml-2 text-[12px] text-muted-foreground">{s.desc}</span>
                  </span>
                  <span
                    className={cn(
                      "size-4 rounded-full border",
                      style === s.id ? "border-[#4F7CFF] bg-[#4F7CFF]" : "border-muted-foreground/40"
                    )}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* footer */}
        <div className="mt-7 flex items-center justify-between">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === step ? "w-6 bg-[#4F7CFF]" : "w-1.5 bg-muted-foreground/30"
                )}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setStep((s) => s - 1)}>
                <ArrowLeft className="size-3.5" /> Back
              </Button>
            )}
            <button
              disabled={!canNext}
              onClick={next}
              className="btn-primary inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-40"
            >
              {last ? (editing ? "Save" : "Start") : "Next"} <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>

        {/* skip — first-time only, never overwrites an existing profile */}
        {step === 0 && !editing && (
          <button
            onClick={() => onDone({ ...EMPTY_PROFILE, onboarded: true, updatedAt: Date.now() })}
            className="mt-4 w-full text-center text-[12px] text-muted-foreground transition-colors hover:text-foreground"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}
