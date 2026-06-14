"use client";

import { useState } from "react";
import { ArrowRight, ArrowLeft, Check, Loader2, Lock, Mail, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Profile, EMPTY_PROFILE, saveProfile } from "@/lib/memory";
import { Logo } from "@/components/logo";
import { signIn, signUp, signInWithGoogle } from "@/lib/auth";

const STYLES: { id: Profile["style"]; label: string; desc: string }[] = [
  { id: "direct", label: "Direct", desc: "Blunt. No softening." },
  { id: "gentle", label: "Steady", desc: "Calm, but never vague." },
  { id: "challenging", label: "Challenging", desc: "Push back on me." },
];

type PlanId = "free" | "plus" | "pro";
const PLANS: { id: PlanId; name: string; price: string; tagline: string; features: string[]; highlight?: boolean }[] = [
  { id: "free", name: "Free", price: "$0", tagline: "Get oriented.", features: ["Unlimited conversations", "All 6 modes", "Basic memory"] },
  { id: "plus", name: "Plus", price: "$12", tagline: "Navigate seriously.", features: ["Long-term memory", "Proactive check-ins", "Saved plans & history"], highlight: true },
  { id: "pro", name: "Pro", price: "$29", tagline: "Full strategist.", features: ["Weekly life reviews", "Multiple life tracks", "Early access"] },
];

/**
 * Onboarding flow that builds the persistent memory profile, then (first-time
 * only) offers account creation and a membership choice.
 * Steps when first-time:  name · focus · style · account · membership
 * Steps when editing:      name · focus · style          (account/plan skipped)
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
  const totalSteps = editing ? 3 : 5; // 0..2 always; +account, +membership for new users
  const [step, setStep] = useState(0);

  // profile fields
  const [name, setName] = useState(initial?.name ?? "");
  const [focus, setFocus] = useState(initial?.focus ?? "");
  const [style, setStyle] = useState<Profile["style"]>(initial?.style ?? "direct");

  // account (step 3) state
  const [authMode, setAuthMode] = useState<"signup" | "signin">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  const last = step === totalSteps - 1;
  const canNext =
    step === 0 ? name.trim().length > 0 : step === 1 ? focus.trim().length > 0 : true;

  function buildProfile(): Profile {
    return {
      ...EMPTY_PROFILE,
      ...(initial ?? {}), // preserve notes etc. when editing
      name: name.trim(),
      focus: focus.trim(),
      style,
      onboarded: true,
      updatedAt: Date.now(),
    };
  }

  function next() {
    if (!last) return setStep((s) => s + 1);
    onDone(buildProfile());
  }

  // ── Account step actions ────────────────────────────────────────────────
  async function handleGoogle() {
    setAuthError(null);
    // Persist the profile first — Google OAuth navigates away, and we want the
    // app to recognise the user as onboarded when they return via /auth/callback.
    saveProfile(buildProfile());
    setAuthLoading(true);
    const err = await signInWithGoogle();
    if (err) {
      setAuthError(err);
      setAuthLoading(false);
    }
    // On success the browser redirects to Google; nothing else to do here.
  }

  async function handleEmailAuth() {
    if (!email.trim() || password.length < 6) {
      setAuthError("Enter an email and a password of at least 6 characters.");
      return;
    }
    setAuthError(null);
    setAuthNotice(null);
    setAuthLoading(true);
    const err =
      authMode === "signup"
        ? await signUp(email.trim(), password)
        : await signIn(email.trim(), password);
    setAuthLoading(false);
    if (err) {
      setAuthError(err);
      return;
    }
    if (authMode === "signup") {
      setAuthNotice("Account created. (Confirm your email if prompted.) Choose a plan to finish.");
    }
    setStep((s) => s + 1); // → membership
  }

  // ── Membership step action ──────────────────────────────────────────────
  function pickPlan(_id: PlanId) {
    // Stripe checkout will be wired here next. For now, finish onboarding;
    // the chosen plan can be upgraded anytime from the sidebar.
    onDone(buildProfile());
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        className={cn(
          "glass-strong ring-glow relative z-10 w-full overflow-hidden rounded-3xl p-7 fade-up",
          step === 4 ? "max-w-2xl" : "max-w-md"
        )}
      >
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
            {step === 3 && "Save your progress"}
            {step === 4 && "Choose your membership"}
          </h2>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            {step === 0 && "I'll remember this so we never start from zero."}
            {step === 1 && "One honest sentence. The headline, not the whole story."}
            {step === 2 && "You can change this anytime."}
            {step === 3 && "Create an account so your memory syncs across devices."}
            {step === 4 && "Free gets you going. Upgrade anytime — billing connects next."}
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
                    style === s.id ? "border-[#4F7CFF]/60 bg-[#4F7CFF]/10" : "border-border glass-hover"
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

          {step === 3 && (
            <div className="flex flex-col gap-3">
              {/* Google */}
              <button
                onClick={handleGoogle}
                disabled={authLoading}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/15 bg-white px-4 py-3 text-sm font-medium text-black transition-colors hover:bg-white/90 disabled:opacity-60"
              >
                <GoogleIcon /> Continue with Google
              </button>

              <div className="flex items-center gap-3 py-1 text-[11px] uppercase tracking-widest text-muted-foreground">
                <span className="h-px flex-1 bg-border" /> or email <span className="h-px flex-1 bg-border" />
              </div>

              <label className="relative block">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full rounded-xl glass py-3 pl-10 pr-4 text-sm outline-none focus:border-[#4F7CFF]/60"
                />
              </label>
              <label className="relative block">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  autoComplete={authMode === "signup" ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleEmailAuth()}
                  placeholder="Password (min 6 characters)"
                  className="w-full rounded-xl glass py-3 pl-10 pr-4 text-sm outline-none focus:border-[#4F7CFF]/60"
                />
              </label>

              {authError && (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-300">
                  {authError}
                </p>
              )}
              {authNotice && (
                <p className="rounded-lg border border-[#4F7CFF]/30 bg-[#4F7CFF]/10 px-3 py-2 text-[12px] text-[#9DB4FF]">
                  {authNotice}
                </p>
              )}

              <button
                onClick={handleEmailAuth}
                disabled={authLoading}
                className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium disabled:opacity-60"
              >
                {authLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>{authMode === "signup" ? "Create account" : "Sign in"} <ArrowRight className="size-3.5" /></>
                )}
              </button>

              <p className="text-center text-[12px] text-muted-foreground">
                {authMode === "signup" ? "Already have an account?" : "New to Nikos?"}{" "}
                <button
                  onClick={() => {
                    setAuthMode(authMode === "signup" ? "signin" : "signup");
                    setAuthError(null);
                    setAuthNotice(null);
                  }}
                  className="font-medium text-[#9DB4FF] hover:text-foreground"
                >
                  {authMode === "signup" ? "Sign in" : "Create one"}
                </button>
              </p>
            </div>
          )}

          {step === 4 && (
            <div className="grid gap-3 sm:grid-cols-3">
              {PLANS.map((p) => (
                <div
                  key={p.id}
                  className={cn(
                    "relative flex flex-col rounded-2xl border p-4",
                    p.highlight ? "border-[#4F7CFF]/50 bg-[#4F7CFF]/[0.08]" : "border-white/10 bg-white/[0.02]"
                  )}
                >
                  {p.highlight && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-[#4F7CFF] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                      Popular
                    </span>
                  )}
                  <div className="text-sm font-semibold">{p.name}</div>
                  <div className="mb-1 mt-0.5 flex items-end gap-1">
                    <span className="text-2xl font-semibold">{p.price}</span>
                    <span className="pb-1 text-[11px] text-muted-foreground">/mo</span>
                  </div>
                  <p className="mb-3 text-[12px] text-muted-foreground">{p.tagline}</p>
                  <ul className="mb-4 flex-1 space-y-1.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-1.5 text-[12px] text-foreground/85">
                        <Check className="mt-0.5 size-3 shrink-0 text-[#6D8EFF]" /> {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => pickPlan(p.id)}
                    className={cn(
                      "w-full rounded-xl px-3 py-2 text-[13px] font-medium transition-colors",
                      p.id === "free"
                        ? "border border-white/15 text-foreground hover:bg-white/5"
                        : p.highlight
                        ? "btn-primary"
                        : "border border-white/15 text-foreground hover:bg-white/5"
                    )}
                  >
                    {p.id === "free" ? "Start free" : `Choose ${p.name}`}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* footer */}
        <div className="mt-7 flex items-center justify-between">
          <div className="flex gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
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
            {/* Steps 3 (account) and 4 (membership) have their own actions.
                Show the generic Next/Save only on profile steps and the editing finish. */}
            {step < 3 && (
              <button
                disabled={!canNext}
                onClick={next}
                className="btn-primary inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-40"
              >
                {editing && last ? "Save" : "Next"} <ArrowRight className="size-3.5" />
              </button>
            )}
            {step === 3 && (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Maybe later <ArrowRight className="size-3.5" />
              </button>
            )}
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

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
    </svg>
  );
}
