/**
 * Navigation modes — the "capability chips" the user can steer Nikos with.
 * Each mode reshapes how the assistant responds (see system-prompt.ts).
 * `map` is the differentiator: a structured, saveable artifact ChatGPT doesn't
 * produce by default.
 */
export type ModeId = "navigate" | "decide" | "plan" | "system" | "recover" | "chat";

export interface Mode {
  id: ModeId;
  label: string;
  blurb: string;        // shown on hover / under chip
  hint: string;         // placeholder seed for the composer
  /** tailwind gradient for the chip icon disc */
  gradient: string;
  /** lucide icon name resolved in the UI */
  icon:
    | "Compass"
    | "Scale"
    | "Map"
    | "Workflow"
    | "LifeBuoy"
    | "MessageCircle";
}

export const MODES: Mode[] = [
  {
    id: "navigate",
    label: "Navigation",
    blurb: "Untangle what's actually going on.",
    hint: "What's on your mind right now?",
    gradient: "from-blue-500 to-indigo-600",
    icon: "Compass",
  },
  {
    id: "decide",
    label: "Decision",
    blurb: "Stuck between options? Find the real trade-off.",
    hint: "I'm stuck between two options…",
    gradient: "from-cyan-500 to-blue-600",
    icon: "Scale",
  },
  {
    id: "plan",
    label: "Plan",
    blurb: "Turn a vague goal into a sequence.",
    hint: "Help me turn this goal into a plan…",
    gradient: "from-sky-500 to-blue-600",
    icon: "Map",
  },
  {
    id: "system",
    label: "System",
    blurb: "Build a repeatable routine so it sticks.",
    hint: "I keep failing at this — build me a system…",
    gradient: "from-emerald-500 to-teal-600",
    icon: "Workflow",
  },
  {
    id: "recover",
    label: "Recover",
    blurb: "Overwhelmed or drained. One grounding step.",
    hint: "I'm overwhelmed and can't think straight…",
    gradient: "from-amber-500 to-orange-600",
    icon: "LifeBuoy",
  },
  {
    id: "chat",
    label: "Chat",
    blurb: "Just talk. Open conversation, no fixed format.",
    hint: "Let's just talk…",
    gradient: "from-slate-400 to-slate-600",
    icon: "MessageCircle",
  },
];

export function getMode(id: ModeId | undefined): Mode {
  return MODES.find((m) => m.id === id) ?? MODES[0];
}
