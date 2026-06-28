/**
 * Navigation modes — the "capability chips" the user can steer Niko with.
 * Each mode reshapes how the assistant responds (see system-prompt.ts).
 *
 * `auto` is the default: Niko reads the message and self-routes to the right
 * register (understand / discover / decide / act). The other chips are manual
 * overrides for when the user already knows what they want from Niko.
 */
export type ModeId = "auto" | "guide" | "decide" | "action" | "recover" | "chat";

export interface Mode {
  id: ModeId;
  label: string;
  blurb: string;        // shown on hover / under chip
  hint: string;         // placeholder seed for the composer
  /** tailwind gradient for the chip icon disc */
  gradient: string;
  /** lucide icon name resolved in the UI */
  icon:
    | "Sparkles"
    | "Compass"
    | "Scale"
    | "Zap"
    | "LifeBuoy"
    | "MessageCircle";
}

export const MODES: Mode[] = [
  {
    id: "chat",
    label: "Chat",
    blurb: "Just talk. Open conversation, no fixed format.",
    hint: "Let's just talk…",
    gradient: "from-slate-400 to-slate-600",
    icon: "MessageCircle",
  },
  {
    id: "auto",
    label: "Auto",
    blurb: "Let Niko read the moment and respond the right way.",
    hint: "What's on your mind right now?",
    gradient: "from-violet-500 to-indigo-600",
    icon: "Sparkles",
  },
  {
    id: "guide",
    label: "Guide",
    blurb: "Untangle what's going on, or narrow a vague want into focus.",
    hint: "I want to do something with my life…",
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
    id: "action",
    label: "Action",
    blurb: "Know what you want? Turn it into the next concrete move.",
    hint: "Help me turn this into real steps…",
    gradient: "from-sky-500 to-blue-600",
    icon: "Zap",
  },
  {
    id: "recover",
    label: "Recover",
    blurb: "Overwhelmed or drained. One grounding step.",
    hint: "I'm overwhelmed and can't think straight…",
    gradient: "from-amber-500 to-orange-600",
    icon: "LifeBuoy",
  },
];

export function getMode(id: ModeId | undefined): Mode {
  return MODES.find((m) => m.id === id) ?? MODES[0];
}
