"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUp,
  Compass,
  Layers,
  NotebookPen,
  Puzzle,
  Route,
  Scale,
  Shuffle,
  Target,
  TrendingDown,
  Workflow,
} from "lucide-react";
import { Logo, LogoLockup } from "@/components/logo";
import { LetterReveal, Reveal, FadeIn } from "@/components/landing/motion-text";
import { ContainerScroll } from "@/components/landing/container-scroll";

const CARD =
  "rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm transition-colors hover:border-white/20";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#6D8EFF]">
      {children}
    </p>
  );
}
function NavBar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed inset-x-3 top-3 z-30 mx-auto max-w-5xl"
    >
      <nav className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 backdrop-blur-xl sm:px-5">
        <LogoLockup markClass="h-6 w-6" />
        <div className="hidden items-center gap-7 text-[13px] text-white/55 sm:flex">
          <a href="#stuck" className="transition-colors hover:text-white">Why people get stuck</a>
          <a href="#how" className="transition-colors hover:text-white">How it works</a>
          <a href="#examples" className="transition-colors hover:text-white">Examples</a>
        </div>
        <Link
          href="/app"
          className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-1.5 text-[13px] font-medium text-black transition-colors hover:bg-white/90"
        >
          Open Nikos <ArrowRight className="size-3.5" />
        </Link>
      </nav>
    </motion.header>
  );
}

function Hero() {
  return (
    <section className="relative mx-auto flex max-w-3xl flex-col items-center px-5 pt-44 text-center sm:pt-52">
      <FadeIn delay={0.1}>
        <span className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 background-gradient-to-br px-3.5 py-1.5 text-[12px] text-white/60">
          <Compass className="size-3.5 text-[#6D8EFF]" />
          A navigation system for your life
        </span>
      </FadeIn>

      <h1 className="font-serif text-[2.6rem] font-medium leading-[1.05] text-white sm:text-[4.25rem]">
        <LetterReveal text="Stop drowning in options." delay={0.15} />
        <span className="mt-1 block italic text-[#A9C0FF]">
          <LetterReveal text="Find the one move that matters." delay={0.55} />
        </span>
      </h1>

      <FadeIn delay={1.25}>
        <p className="mt-7 max-w-xl text-pretty text-[16px] leading-relaxed text-white/55 sm:text-lg">
          Nikos is a personal strategist that helps you make decisions, design
          systems, and stay aligned with where you&rsquo;re actually trying to go”
          and it remembers the bigger picture between every conversation.
        </p>
      </FadeIn>

      <FadeIn delay={1.4}>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/app"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-medium text-black shadow-[0_0_40px_-8px_rgba(255,255,255,0.4)] transition-colors hover:bg-white/90"
          >
            Start navigating <ArrowRight className="size-4" />
          </Link>
          <a
            href="#how"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/5"
          >
            See how it works
          </a>
        </div>
      </FadeIn>

      <FadeIn delay={1.55}>
        <p className="mt-5 text-[13px] text-white/40">
          No download. Works in your browser. Your context stays private.
        </p>
      </FadeIn>
    </section>
  );
}
const STUCK = [
  { icon: Layers, title: "Too many options", body: "Every path looks plausible, so you keep all of them open and commit to none. Optionality becomes paralysis." },
  { icon: Shuffle, title: "Conflicting goals", body: "You want freedom and security, depth and speed. Unspoken trade-offs quietly cancel each other out." },
  { icon: TrendingDown, title: "Motivation that fades", body: "You move when you feel inspired and stall when you don't. Progress depends on a mood you can't control." },
  { icon: Puzzle, title: "Advice without context", body: "Generic tips don't know your situation, your history, or what you've already tried. So nothing quite fits." },
];

function Stuck() {
  return (
    <section id="stuck" className="mx-auto mt-40 max-w-5xl px-5">
      <Reveal className="max-w-2xl">
        <Eyebrow>The real problem</Eyebrow>
        <h2 className="font-serif text-3xl font-medium text-white sm:text-[2.75rem]">
          Why people get stuck
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-white/55">
          It&rsquo;s rarely a lack of effort or intelligence. People stall because
          the decision in front of them is unclear â€” not because they&rsquo;re lazy.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {STUCK.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.08}>
            <div className={`${CARD} h-full p-7`}>
              <div className="mb-4 inline-flex size-10 items-center justify-center rounded-xl border border-white/15 text-[#9DB4FF]">
                <s.icon className="size-5" />
              </div>
              <h3 className="text-base font-semibold text-white">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{s.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
const LOOP = [
  { icon: Compass, label: "Question", body: "Start with whatever's unclear." },
  { icon: Scale, label: "Decision", body: "Nikos finds the real trade-off." },
  { icon: Route, label: "Plan", body: "Turn the call into a sequence." },
  { icon: NotebookPen, label: "Follow-up", body: "It checks where you landed." },
];

function Solution() {
  return (
    <section className="mx-auto mt-40 max-w-5xl px-5">
      <Reveal className="max-w-2xl">
        <Eyebrow>The difference</Eyebrow>
        <h2 className="font-serif text-3xl font-medium text-white sm:text-[2.75rem]">
          Nikos remembers the bigger picture
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-white/55">
          Most AI forgets you the moment you close the tab. Nikos holds your
          direction across sessions, so every conversation builds on the last
          instead of starting from zero.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-4 sm:grid-cols-4">
        {LOOP.map((step, i) => (
          <Reveal key={step.label} delay={i * 0.1}>
            <div className={`${CARD} relative h-full p-6`}>
              <div className="mb-4 inline-flex size-10 items-center justify-center rounded-xl background-gradient-to-br from-[#4F7CFF] to-[#6D8EFF] text-white">
                <step.icon className="size-5" />
              </div>
              <p className="text-sm font-semibold text-white">{step.label}</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-white/55">{step.body}</p>
              {i < LOOP.length - 1 && (
                <ArrowRight className="absolute -right-3 top-1/2 hidden size-4 -translate-y-1/2 text-white/20 sm:block" />
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-2xl rounded-br-md background-gradient-to-br from-[#4F7CFF] to-[#5B86FF] px-4 py-2.5 text-sm text-white">
        {children}
      </div>
    </div>
  );
}
function NikosBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <Logo className="mt-0.5 size-6 shrink-0 text-white" />
      <div className="max-w-[88%] rounded-2xl rounded-tl-md border border-white/10 background-gradient-to-br px-4 py-3 text-sm leading-[1.65] text-white/90">
        {children}
      </div>
    </div>
  );
}

function Examples() {
  return (
    <section id="examples" className="mx-auto mt-40 max-w-5xl px-5">
      <Reveal className="max-w-2xl">
        <Eyebrow>See how it thinks</Eyebrow>
        <h2 className="font-serif text-3xl font-medium text-white sm:text-[2.75rem]">
          It doesn&rsquo;t hand you a list.
          <br className="hidden sm:block" /> It finds the <span className="italic text-[#A9C0FF]">deciding factor</span>.
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-white/55">
          Generic AI gives you ten options and no direction. Nikos names the one
          thing the decision actually turns on.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-5 lg:grid-cols-2">
        <Reveal>
          <div className={`${CARD} p-5 sm:p-6`}>
            <div className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-white/50">
              <Scale className="size-3.5 text-[#6D8EFF]" /> Decision
            </div>
            <div className="space-y-3.5">
              <UserBubble>Should I start a clothing brand or learn to code?</UserBubble>
              <NikosBubble>
                Neither is the real question yet. One of these you want for the
                outcome, money, freedom. The other you&rsquo;d enjoy doing even on a
                bad day. Which is which?
              </NikosBubble>
              <UserBubble>The brand is the outcome. Coding I actually like doing.</UserBubble>
              <NikosBubble>
                Then the constraint isn&rsquo;t &ldquo;which is better&rdquo;” it&rsquo;s which one
                survives 90 days without motivation. That&rsquo;s coding. Start there;
                the brand can become what you build <em>with</em> it later.
              </NikosBubble>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className={`${CARD} p-5 sm:p-6`}>
            <div className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-white/50">
              <Workflow className="size-3.5 text-[#6D8EFF]" /> System
            </div>
            <div className="space-y-3.5">
              <UserBubble>I keep saying I&rsquo;ll exercise and never do. I have no discipline.</UserBubble>
              <NikosBubble>
                It&rsquo;s not discipline” it&rsquo;s that the plan relies on you feeling like
                it. Let&rsquo;s remove that. What&rsquo;s the smallest version you could do on
                your worst day, in under two minutes?
              </NikosBubble>
              <UserBubble>Honestly? Putting my shoes on and walking to the door.</UserBubble>
              <NikosBubble>
                That&rsquo;s the system. Shoes on after your morning coffee” that&rsquo;s the
                whole commitment. The walk is optional. We&rsquo;re building the trigger,
                not the willpower.
              </NikosBubble>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
const FEATURES = [
  { icon: Compass, title: "Life Direction", body: "Clarify where you're actually trying to go before optimizing how to get there." },
  { icon: Scale, title: "Decision Builder", body: "Surface the hidden trade-off behind a choice and make the call with confidence." },
  { icon: Target, title: "Goal Mapping", body: "Break a vague ambition into an ordered path with a clear first move." },
  { icon: Workflow, title: "Habit Systems", body: "Design routines that survive a bad day, so progress stops depending on mood." },
  { icon: NotebookPen, title: "Reflection", body: "Revisit decisions with context Nikos remembered, and adjust as life changes." },
];

function Features() {
  return (
    <section className="mx-auto mt-40 max-w-5xl px-5">
      <Reveal className="max-w-2xl">
        <Eyebrow>What it does</Eyebrow>
        <h2 className="font-serif text-3xl font-medium text-white sm:text-[2.75rem]">
          Built for direction, not dopamine
        </h2>
      </Reveal>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} delay={i * 0.07}>
            <div className={`${CARD} h-full p-6`}>
              <div className="mb-4 inline-flex size-10 items-center justify-center rounded-xl border border-white/15 text-[#9DB4FF]">
                <f.icon className="size-5" />
              </div>
              <h3 className="text-base font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{f.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
const STEPS = [
  ["Tell it where you're trying to go", "A 30-second setup teaches Nikos who you are and what you're navigating. No re-explaining, ever."],
  ["Think out loud, in any mode", "Decide, plan, build a system, or recover. Nikos finds the real constraint not the surface symptom."],
  ["Leave with one clear move", "Walk away knowing the single next step. Come back tomorrow and it picks up exactly where you left off."],
];

function How() {
  return (
    <section id="how" className="mx-auto mt-40 max-w-4xl px-5">
      <Reveal className="mx-auto max-w-2xl text-center">
        <Eyebrow>How Nikos works</Eyebrow>
        <h2 className="font-serif text-3xl font-medium text-white sm:text-[2.75rem]">
          From uncertainty to a clear next step
        </h2>
      </Reveal>
      <div className="mt-12 space-y-4">
        {STEPS.map(([t, b], i) => (
          <Reveal key={t} delay={i * 0.08}>
            <div className={`${CARD} flex items-start gap-5 p-6`}>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/15 text-sm font-semibold text-[#9DB4FF]">
                {i + 1}
              </span>
              <div>
                <h3 className="text-base font-semibold text-white">{t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/55">{b}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
function FinalCTA() {
  return (
    <section className="mx-auto mt-40 max-w-3xl px-5">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-white/10 background-gradient-to-br px-6 py-16 text-center">
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-40 width-[28rem] -translate-x-1/2 rounded-full opacity-60 blur-[80px]"
            style={{ background: "radial-gradient(circle, rgba(79,124,255,0.4), transparent 70%)" }}
            aria-hidden
          />
          <Logo className="relative mx-auto mb-6 size-10 text-white" />
          <h2 className="relative font-serif text-3xl font-medium text-white sm:text-[2.75rem]">
            Stop guessing. <span className="italic text-[#A9C0FF]">Start navigating.</span>
          </h2>
          <p className="relative mx-auto mt-4 max-w-md text-[15px] text-white/55">
            Clarity beats motivation. Tell Nikos one honest sentence about where you
            are” it&rsquo;ll take it from there.
          </p>
          <Link
            href="/app"
            className="relative mt-9 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3 text-sm font-medium text-black transition-colors hover:bg-white/90"
          >
            Open Nikos <ArrowRight className="size-4" />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

/* â”€â”€ Product showcase â€” scroll-rotating card with a live-styled chat mockup â”€ */
function ChatMockup() {
  return (
    <div className="flex h-full flex-col text-left">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <Logo className="size-4 text-white" />
        <span className="text-[13px] font-medium text-white">Nikos AI</span>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-white/10 background-gradient-to-br px-2.5 py-1 text-[11px] text-white/55">
          <span className="size-2 rounded-full background-gradient-to-br from-[#4F7CFF] to-[#6D8EFF]" /> Decide mode
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-hidden p-4 sm:p-6">
        <div className="flex items-center gap-2.5">
          <Logo className="size-6 shrink-0 text-white" />
          <span className="font-serif text-lg text-white sm:text-2xl">
            Hello Niko, <span className="italic text-[#A9C0FF]">what&rsquo;s really going on?</span>
          </span>
        </div>
        <UserBubble>I&rsquo;m stuck between two job offers and I keep going in circles.</UserBubble>
        <NikosBubble>
          Then the real question isn&rsquo;t which one pays more” it&rsquo;s which one
          you&rsquo;ll still respect in two years. Which offer scares you for the right
          reasons?
        </NikosBubble>
      </div>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 background-gradient-to-br px-3.5 py-2.5 text-sm text-white/35">
          What&rsquo;s on your mind right now?
          <span className="ml-auto inline-flex size-7 items-center justify-center rounded-lg bg-white text-black">
            <ArrowUp className="size-4" />
          </span>
        </div>
      </div>
    </div>
  );
}

function Showcase() {
  return (
    <section className="-mt-10 sm:-mt-4">
      <ContainerScroll
        titleComponent={
          <div className="mb-4">
            <Eyebrow>The product</Eyebrow>
            <h2 className="font-serif text-3xl font-medium text-white sm:text-[2.75rem]">
              A calmer place to <span className="italic text-[#A9C0FF]">think it through</span>
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[15px] text-white/55">
              One thread, your context remembered, and a partner that gets you to the next move.
            </p>
          </div>
        }
      >
        <ChatMockup />
      </ContainerScroll>
    </section>
  );
}

export default function LandingPage() {
  return (
    <main className="relative min-h-dvh overflow-hidden pb-28 text-white">
      {/* background is global (<SceneBackground/> in the layout) */}
      <NavBar />
      <Hero />
      <Showcase />
      <Stuck />
      <Solution />
      <Examples />
      <Features />
      <How />
      <FinalCTA />

      <footer className="mt-28 border-t border-white/10 px-5 pt-10 text-center">
        <LogoLockup markClass="h-5 w-5" className="opacity-80" />
        <p className="mt-3 text-[13px] text-white/40">
          A navigation system for your life” built to help you think, not to keep you scrolling.
        </p>
      </footer>
    </main>
  );
}
