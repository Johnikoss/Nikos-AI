/**
 * Lightweight persistent "memory" — the single most-demanded AI feature in 2026.
 * Stored locally for now; swap loadProfile/saveProfile for a DB call later
 * (see the publish plan). The profile is injected into every system prompt so
 * Niko remembers who the user is and what they're navigating toward.
 */
const PROFILE_KEY = "nikos-ai:profile";

export interface Profile {
  /** what they want to be called */
  name: string;
  /** the headline thing they're navigating right now */
  focus: string;
  /** which area of life the focus lives in */
  area: "" | "career" | "relationships" | "health" | "growth";
  /** how they want Niko to talk to them */
  style: "direct" | "gentle" | "challenging" | "analytical";
  /** what they trust most when a decision gets hard */
  decision: "" | "head" | "gut" | "people";
  /** how often Niko should proactively reach out */
  cadence: "" | "often" | "weekly" | "onlyask";
  /** durable facts Niko has learned (manually or pinned from chats) */
  notes: string[];
  /** has the user finished onboarding */
  onboarded: boolean;
  updatedAt: number;
}

export const EMPTY_PROFILE: Profile = {
  name: "",
  focus: "",
  area: "",
  style: "direct",
  decision: "",
  cadence: "",
  notes: [],
  onboarded: false,
  updatedAt: 0,
};

export function loadProfile(): Profile {
  if (typeof window === "undefined") return EMPTY_PROFILE;
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (!raw) return EMPTY_PROFILE;
    return { ...EMPTY_PROFILE, ...(JSON.parse(raw) as Profile) };
  } catch {
    return EMPTY_PROFILE;
  }
}

export function saveProfile(profile: Profile): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      PROFILE_KEY,
      JSON.stringify({ ...profile, updatedAt: Date.now() })
    );
  } catch {
    /* storage unavailable — in-memory state still works */
  }
}

const STYLE_LINE: Record<Profile["style"], string> = {
  direct: "Be blunt and economical. No softening.",
  gentle: "Stay calm and steady, but never vague or reassuring for its own sake.",
  challenging: "Push back. Question their framing when it's off.",
  analytical: "Lay out the trade-offs and the logic. Reason it through with them.",
};

const AREA_LINE: Record<Exclude<Profile["area"], "">, string> = {
  career: "career and work",
  relationships: "relationships and the people around them",
  health: "health, energy and daily habits",
  growth: "personal direction and meaning",
};

const DECISION_LINE: Record<Exclude<Profile["decision"], "">, string> = {
  head: "logic and evidence (their head)",
  gut: "instinct and how it feels (their gut)",
  people: "talking it through with people they trust",
};

const CADENCE_LINE: Record<Exclude<Profile["cadence"], "">, string> = {
  often: "wants frequent, near-daily check-ins and accountability",
  weekly: "wants a steady weekly rhythm, not constant contact",
  onlyask: "prefers you stay quiet until they come to you",
};

/** Render the profile into a compact memory block for the system prompt. */
export function profileToMemory(p: Profile): string {
  if (!p.onboarded && !p.name && !p.focus) return "";
  const lines: string[] = ["═══ WHAT YOU REMEMBER ABOUT THIS PERSON ═══"];
  if (p.name) lines.push(`Name: ${p.name} (address them by it occasionally).`);
  if (p.focus) lines.push(`Currently navigating: ${p.focus}.`);
  if (p.area) lines.push(`This sits in the area of ${AREA_LINE[p.area]}.`);
  lines.push(`Preferred tone: ${STYLE_LINE[p.style]}`);
  if (p.decision) lines.push(`When decisions get hard, they lean on ${DECISION_LINE[p.decision]}.`);
  if (p.cadence) lines.push(`Check-in preference: ${CADENCE_LINE[p.cadence]}.`);
  if (p.notes.length) {
    lines.push("Durable facts you've learned:");
    p.notes.slice(0, 12).forEach((n) => lines.push(`- ${n}`));
  }
  lines.push(
    "Use this memory naturally. Do not recite it back. Build on it."
  );
  return lines.join("\n");
}
