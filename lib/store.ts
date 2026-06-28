import { Conversation, Message, uid } from "./types";
import { ModeId, MODES } from "./modes";

const STORAGE_KEY = "nikos-ai:conversations";

/** Old mode ids that no longer exist, mapped onto the current set. */
const LEGACY_MODE_MAP: Record<string, ModeId> = {
  navigate: "guide",
  plan: "action",
  system: "action",
};
const VALID_MODES = new Set<string>(MODES.map((m) => m.id));

/** Coerce any stored/legacy mode value into a valid current ModeId. */
function normalizeMode(mode: unknown): ModeId {
  if (typeof mode === "string") {
    if (VALID_MODES.has(mode)) return mode as ModeId;
    if (mode in LEGACY_MODE_MAP) return LEGACY_MODE_MAP[mode];
  }
  return "auto";
}

export function loadConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Conversation[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((c) => ({ ...c, mode: normalizeMode(c.mode) }))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export function saveConversations(conversations: Conversation[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch {
    // Storage full or unavailable — in-memory state still works.
  }
}

export function newConversation(mode: Conversation["mode"] = "chat"): Conversation {
  const now = Date.now();
  return {
    id: uid(),
    title: "New conversation",
    messages: [],
    mode,
    createdAt: now,
    updatedAt: now,
  };
}

/** Rename a conversation by id, returning a new sorted list and persisting it. */
export function renameConversation(
  list: Conversation[],
  id: string,
  title: string
): Conversation[] {
  const clean = title.trim();
  if (!clean) return list;
  const next = list.map((c) =>
    c.id === id ? { ...c, title: clean, updatedAt: Date.now() } : c
  );
  saveConversations(next);
  return next;
}

export function titleFrom(messages: Message[]): string {
  const first = messages.find((m) => m.role === "user");
  if (!first) return "New conversation";
  const t = first.content.trim().replace(/\s+/g, " ");
  return t.length > 44 ? t.slice(0, 44) + "…" : t;
}
