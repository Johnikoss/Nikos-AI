"use client";

import { useState } from "react";
import { ArrowRight, ArrowLeft, Check, Loader2, Lock, Mail, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Profile, EMPTY_PROFILE, saveProfile } from "@/lib/memory";
import { Logo } from "@/components/logo";
import { signIn, signUp, signInWithGoogle } from "@/lib/auth";

type Choice<T extends string> = { id: T; label: string; desc: string };

const AREAS: Choice<Exclude<Profile["area"], "">>[] = [
  { id: "career", label: "Career & work", desc: "A job, a business, or a big professional call." },
  { id: "relationships", label: "Relationships", desc: "Partner, family, friends — the people around me." },
  { id: "health", label: "Health & habits", desc: "Energy, fitness, sleep, the way I live day to day." },
  { id: "growth", label: "Direction & meaning", desc: "Who I'm becoming and where I'm headed." },
];

const STYLES: Choice<Profile["style"]>[] = [
  { id: "direct", label: "Direct", desc: "Blunt and economical. No softening, ever." },
  { id: "gentle", label: "Steady", desc: "Calm and grounding, but never vague." },
  { id: "challenging", label: "Challenging", desc: "Push back hard and question my framing." },
  { id: "analytical", label: "Analytical", desc: "Lay out the trade-offs and the logic." },
];

const DECISIONS: Choice<Exclude<Profile["decision"], "">>[] = [
  { id: "head", label: "My head", desc: "Logic, evidence, the spreadsheet." },
  { id: "gut", label: "My gut", desc: "Instinct and how the option actually feels." },
  { id: "people", label: "My people", desc: "Talking it through with the ones I trust." },
];

const CADENCES: Choice<Exclude<Profile["cadence"], "">>[] = [
  { id: "often", label: "Most days", desc: "Keep me accountable with frequent nudges." },
  { id: "weekly", label: "A weekly rhythm", desc: "A steady check-in, not a constant buzz." },
  { id: "onlyask", label: "Only when I ask", desc: "Stay quiet until I come to you." },
];

type PlanId = "free" | "plus" | "pro";
const PLANS: { id: PlanId; name: string; price: string; tagline: string; features: string[]; highlight?: boolean }[] = [
  { id: "free", name: "Free", price: "$0", tagline: "Get oriented.", features: ["Unlimited conversations", "All 6 modes", "Basic memory"] },
  { id: "plus", name: "Plus", price: "$4.99", tagline: "Navigate seriously.", features: ["Long-term memory", "Proactive check-ins", "Saved plans & history"], highlight: true },
  { id: "pro", name: "Pro", price: "$19.99", tagline: "Full strategist.", features: ["Weekly life reviews", "Multiple life tracks", "Early access"] },
];

// The profile-building questions, in order. Account + membership steps follow
// these for first-time users only.
const PROFILE_STEPS = 6; // 0..5: name, focus, area, style, decision, cadence

/**
 * Full-screen onboarding flow that builds the persistent memory profile, then
 * (first-time only) offers account creation and a membership choice.
 * Steps when first-time:  name · focus · area · style · decision · cadence · account · membership
 * Steps when editing:     name · focus · area · style · decision · cadence    (account/plan skipped)
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
  const totalSteps = editing ? PROFILE_STEPS : PROFILE_STEPS + 2; // +account, +membership
  const accountStep = PROFILE_STEPS; // 6
  const planStep = PROFILE_STEPS + 1; // 7
  const [step, setStep] = useState(0);
  const [processing, setProcessing] = useState(false);

  // profile fields
  const [name, setName] = useState(initial?.name ?? "");
  const [focus, setFocus] = useState(initial?.focus ?? "");
  const [area, setArea] = useState<Profile["area"]>(initial?.area ?? "");
  const [style, setStyle] = useState<Profile["style"]>(initial?.style ?? "direct");
  const [decision, setDecision] = useState<Profile["decision"]>(initial?.decision ?? "");
  const [cadence, setCadence] = useState<Profile["cadence"]>(initial?.cadence ?? "");

  // account step state
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
      area,
      style,
      decision,
      cadence,
      onboarded: true,
      updatedAt: Date.now(),
    };
  }

  // Brief "setting up" animation before handing control back to the app.
  function finish() {
    setProcessing(true);
    window.setTimeout(() => onDone(buildProfile()), 1200);
  }

  function next() {
    if (step < PROFILE_STEPS - 1) return setStep((s) => s + 1);
    if (editing) return finish(); // editing ends on the last profile step
    setStep((s) => s + 1); // → account
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
    finish();
  }

  const wide = step === planStep;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* animated ambient background — a fully OPAQUE base (white in light mode,
          near-black in dark) so the app behind never shows through, with soft
          drifting orbs on top. We set the colour via the CSS var directly
          because the `bg-background` utility resolves to transparent here. */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ background: "var(--background)" }}
      >
        <div className="onb-orb onb-orb-1" />
        <div className="onb-orb onb-orb-2" />
      </div>

      {/* close (only when editing — first-time users use Skip) */}
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 z-20 rounded-full p-2 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
        >
          <X className="size-5" />
        </button>
      )}

      <div
        className={cn(
          "relative z-10 mx-auto flex min-h-dvh w-full flex-col px-6 py-8 transition-[max-width] duration-300",
          wide ? "max-w-3xl" : "max-w-xl"
        )}
      >
        {/* top bar: logo + progress */}
        <div className="flex items-center gap-4">
          <Logo className="h-9 w-9 glow-blue rounded-xl p-1.5" />
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/10">
            <div
              className="h-full rounded-full bg-[#4F7CFF] transition-all duration-500 ease-out"
              style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
            />
          </div>
          <span className="text-[12px] font-medium tabular-nums text-muted-foreground">
            {step + 1} / {totalSteps}
          </span>
        </div>

        {/* centered content */}
        <div className="flex flex-1 flex-col justify-center py-10">
          <div key={step} className="onb-step">
            {/* header */}
            <div className="mb-7">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{HEADERS[step]?.title}</h2>
              <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
                {HEADERS[step]?.sub}
              </p>
            </div>

            {/* body */}
            {step === 0 && (
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && canNext && next()}
                placeholder="Your name or a nickname"
                className="w-full rounded-2xl glass px-5 py-4 text-base outline-none transition-colors focus:border-[#4F7CFF]/60"
              />
            )}

            {step === 1 && (
              <textarea
                autoFocus
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                rows={4}
                placeholder="e.g. Deciding whether to leave my stable job and go full-time on my side project before I lose my nerve."
                className="w-full resize-none rounded-2xl glass px-5 py-4 text-base leading-relaxed outline-none transition-colors focus:border-[#4F7CFF]/60"
              />
            )}

            {step === 2 && (
              <div className="onb-stagger grid gap-3 sm:grid-cols-2">
                {AREAS.map((o) => (
                  <Option key={o.id} {...o} selected={area === o.id} onClick={() => setArea(o.id)} />
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="onb-stagger flex flex-col gap-3">
                {STYLES.map((o) => (
                  <Option key={o.id} {...o} selected={style === o.id} onClick={() => setStyle(o.id)} />
                ))}
              </div>
            )}

            {step === 4 && (
              <div className="onb-stagger flex flex-col gap-3">
                {DECISIONS.map((o) => (
                  <Option key={o.id} {...o} selected={decision === o.id} onClick={() => setDecision(o.id)} />
                ))}
              </div>
            )}

            {step === 5 && (
              <div className="onb-stagger flex flex-col gap-3">
                {CADENCES.map((o) => (
                  <Option key={o.id} {...o} selected={cadence === o.id} onClick={() => setCadence(o.id)} />
                ))}
              </div>
            )}

            {step === accountStep && !editing && (
              <div className="onb-stagger mx-auto flex w-full max-w-md flex-col gap-3">
                {/* Google */}
                <button
                  onClick={handleGoogle}
                  disabled={authLoading}
                  className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-foreground/15 bg-foreground px-4 py-3.5 text-sm font-medium text-background transition-all hover:scale-[1.01] hover:bg-foreground/90 active:scale-95 disabled:opacity-60"
                >
                  <GoogleIcon /> Continue with Google
                </button>

                <div className="flex items-center gap-3 py-1 text-[11px] uppercase tracking-widest text-muted-foreground">
                  <span className="h-px flex-1 bg-border" /> or email <span className="h-px flex-1 bg-border" />
                </div>

                <label className="relative block">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full rounded-2xl glass py-3.5 pl-11 pr-4 text-sm outline-none transition-colors focus:border-[#4F7CFF]/60"
                  />
                </label>
                <label className="relative block">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    autoComplete={authMode === "signup" ? "new-password" : "current-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleEmailAuth()}
                    placeholder="Password (min 6 characters)"
                    className="w-full rounded-2xl glass py-3.5 pl-11 pr-4 text-sm outline-none transition-colors focus:border-[#4F7CFF]/60"
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
                  className="btn-primary flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-medium transition-transform hover:scale-[1.01] active:scale-95 disabled:opacity-60"
                >
                  {authLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>{authMode === "signup" ? "Create account" : "Sign in"} <ArrowRight className="size-3.5" /></>
                  )}
                </button>

                <p className="text-center text-[12px] text-muted-foreground">
                  {authMode === "signup" ? "Already have an account?" : "New to Niko?"}{" "}
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

            {step === planStep && !editing && (
              <div className="onb-stagger grid gap-3 sm:grid-cols-3">
                {PLANS.map((p) => (
                  <div
                    key={p.id}
                    className={cn(
                      "relative flex flex-col rounded-2xl border p-5 transition-transform hover:-translate-y-1",
                      p.highlight ? "border-[#4F7CFF]/50 bg-[#4F7CFF]/[0.08]" : "border-foreground/10 bg-foreground/[0.02]"
                    )}
                  >
                    {p.highlight && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-[#4F7CFF] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#fff]">
                        Popular
                      </span>
                    )}
                    <div className="text-sm font-semibold">{p.name}</div>
                    <div className="mb-1 mt-0.5 flex items-end gap-1">
                      <span className="text-3xl font-semibold">{p.price}</span>
                      <span className="pb-1.5 text-[11px] text-muted-foreground">/mo</span>
                    </div>
                    <p className="mb-4 text-[12px] text-muted-foreground">{p.tagline}</p>
                    <ul className="mb-5 flex-1 space-y-2">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-start gap-1.5 text-[12px] text-foreground/85">
                          <Check className="mt-0.5 size-3 shrink-0 text-[#6D8EFF]" /> {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => pickPlan(p.id)}
                      className={cn(
                        "w-full rounded-xl px-3 py-2.5 text-[13px] font-medium transition-transform hover:scale-[1.02] active:scale-95",
                        p.id === "free"
                          ? "border border-foreground/15 text-foreground hover:bg-foreground/5"
                          : p.highlight
                          ? "btn-primary"
                          : "border border-foreground/15 text-foreground hover:bg-foreground/5"
                      )}
                    >
                      {p.id === "free" ? "Start free" : `Choose ${p.name}`}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* footer nav */}
        <div className="flex items-center justify-between">
          {step > 0 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" /> Back
            </button>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-2">
            {/* Account and membership steps carry their own actions. */}
            {step < accountStep && (
              <button
                disabled={!canNext}
                onClick={next}
                className="btn-primary inline-flex items-center gap-1.5 rounded-2xl px-6 py-3 text-sm font-medium transition-transform hover:scale-[1.02] active:scale-95 disabled:scale-100 disabled:opacity-40"
              >
                {editing && last ? "Save" : "Continue"} <ArrowRight className="size-3.5" />
              </button>
            )}
            {step === accountStep && !editing && (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="inline-flex items-center gap-1.5 rounded-2xl px-5 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
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
            className="mt-5 w-full text-center text-[12px] text-muted-foreground transition-colors hover:text-foreground"
          >
            Skip for now
          </button>
        )}
      </div>

      {/* processing overlay */}
      {processing && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-6 bg-background/75 backdrop-blur-xl onb-step">
          <div className="relative size-16">
            <span className="absolute inset-0 rounded-full border-2 border-[#4F7CFF]/20" />
            <span className="onb-ring absolute inset-0 rounded-full border-2 border-transparent border-t-[#4F7CFF]" />
            <Logo className="absolute inset-[12px]" />
          </div>
          <div className="text-center">
            <p className="text-base font-medium">Setting up your space…</p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Saving everything{name ? `, ${name.trim()}` : ""}.
            </p>
          </div>
          <div className="onb-bar h-1 w-48 rounded-full bg-foreground/10" />
        </div>
      )}
    </div>
  );
}

const HEADERS: { title: string; sub: string }[] = [
  {
    title: "First — what should I call you?",
    sub: "I'll hold onto this so we never start from a blank page again. Use your real name or whatever feels like you.",
  },
  {
    title: "What are you navigating right now?",
    sub: "One honest sentence — the headline you'd lead with, not the whole backstory. This is the thing I'll keep in view every time we talk.",
  },
  {
    title: "Which part of life is this living in?",
    sub: "It helps me frame everything around what actually matters to you. Pick the one that fits best — you can always shift later.",
  },
  {
    title: "How do you want me to talk to you?",
    sub: "There's no wrong answer here, and you can change it any time. Choose the voice that'll actually get through to you.",
  },
  {
    title: "When a decision gets hard, what do you trust most?",
    sub: "I'll lean into the way you already make your best calls instead of fighting your instincts.",
  },
  {
    title: "How often should I reach out?",
    sub: "From near-daily accountability to complete quiet — you set the pace, and we can retune it whenever.",
  },
  {
    title: "Save your progress",
    sub: "Create an account so your memory and plans sync across every device. Takes a few seconds.",
  },
  {
    title: "Choose your membership",
    sub: "Free gets you going right now. Upgrade anytime — billing connects next.",
  },
];

function Option<T extends string>({
  label,
  desc,
  selected,
  onClick,
}: {
  id: T;
  label: string;
  desc: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "onb-opt group flex items-center justify-between gap-3 rounded-2xl border px-5 py-4 text-left",
        selected
          ? "border-[#4F7CFF]/70 bg-[#4F7CFF]/10 shadow-[0_10px_34px_-14px_rgba(79,124,255,0.7)]"
          : "border-border glass-hover"
      )}
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        <span className="mt-0.5 block text-[12.5px] leading-snug text-muted-foreground">{desc}</span>
      </span>
      <span
        className={cn(
          "grid size-5 shrink-0 place-items-center rounded-full border transition-colors",
          selected ? "border-[#4F7CFF] bg-[#4F7CFF] text-white" : "border-muted-foreground/40 text-transparent"
        )}
      >
        <Check className="size-3" />
      </span>
    </button>
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
