import { Conversation, Message, uid } from "./types";

const STORAGE_KEY = "nikos-ai:conversations";

export function loadConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Conversation[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((c) => ({ ...c, mode: c.mode ?? "navigate" }))
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

export function newConversation(mode: Conversation["mode"] = "navigate"): Conversation {
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
