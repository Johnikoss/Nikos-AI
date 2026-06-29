"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUp,
  Check,
  ChevronDown,
  ChevronRight,
  Compass,
  FolderClosed,
  LifeBuoy,
  Lock,
  Menu,
  MessageCircle,
  Pencil,
  Plus,
  Scale,
  Settings2,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import { Conversation, Message, uid } from "@/lib/types";
import { loadConversations, newConversation, renameConversation, saveConversations, titleFrom } from "@/lib/store";
import { MODES, ModeId, getMode } from "@/lib/modes";
import { Profile, EMPTY_PROFILE, loadProfile, saveProfile, profileToMemory } from "@/lib/memory";
import { Onboarding } from "@/components/onboarding";
import { PlansModal } from "@/components/plans-modal";
import { Composer } from "@/components/chat/composer";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

/* Icon resolver for modes (lucide names â†’ components) */
const ICONS = { Sparkles, Compass, Scale, Zap, LifeBuoy, MessageCircle } as const;

function Rich({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);
  return (
    <>
      {blocks.map((block, bi) => (
        <p key={bi} className={cn("whitespace-pre-wrap", bi > 0 && "mt-3")}>
          {block.split(/(\*\*[^*]+\*\*)/g).map((part, pi) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={pi} className="font-semibold text-[#A7C0FF]">
                {part.slice(2, -2)}
              </strong>
            ) : (
              <span key={pi}>{part}</span>
            )
          )}
        </p>
      ))}
    </>
  );
}
function ModeChip({
  mode,
  active,
  onClick,
}: {
  mode: (typeof MODES)[number];
  active: boolean;
  onClick: () => void;
}) {
  const Icon = ICONS[mode.icon];
  return (
    <button
      onClick={onClick}
      title={mode.blurb}
      className={cn(
        "group inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-all cursor-pointer",
        active
          ? "border-foreground/20 bg-foreground/10 text-foreground"
          : "border-border text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
      )}
    >
      <Icon className="size-3.5" />
      {mode.label}
    </button>
  );
}
function Sidebar({
  conversations,
  activeId,
  open,
  profile,
  onSelect,
  onNew,
  onDelete,
  onRename,
  onClose,
  onEditProfile,
  onUpgrade,
}: {
  conversations: Conversation[];
  activeId: string | null;
  open: boolean;
  profile: Profile;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onClose: () => void;
  onEditProfile: () => void;
  onUpgrade: () => void;
}) {
  const initials =
    profile.name
      ? profile.name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()
      : "";

  const [view, setView] = useState<"recent" | "projects">("recent");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [collapsed, setCollapsed] = useState<Set<ModeId>>(new Set());

  function startRename(c: Conversation) {
    setRenamingId(c.id);
    setDraft(c.title);
  }
  function commitRename() {
    if (renamingId) onRename(renamingId, draft);
    setRenamingId(null);
    setDraft("");
  }

  // One conversation row, shared by both views. Handles inline rename.
  function Row(c: Conversation) {
    const m = getMode(c.mode);
    const Icon = ICONS[m.icon];
    const active = c.id === activeId;
    const isRenaming = renamingId === c.id;
    return (
      <div
        key={c.id}
        role="button"
        tabIndex={0}
        onClick={() => !isRenaming && onSelect(c.id)}
        onKeyDown={(e) => e.key === "Enter" && !isRenaming && onSelect(c.id)}
        className={cn(
          "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 cursor-pointer transition-colors",
          active ? "bg-[#4F7CFF]/15 text-foreground" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
        )}
      >
        <span className={cn("inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br text-[#fff]", m.gradient)}>
          <Icon className="size-3" />
        </span>

        {isRenaming ? (
          <input
            autoFocus
            value={draft}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") {
                setRenamingId(null);
                setDraft("");
              }
            }}
            className="min-w-0 flex-1 rounded-md border border-[#4F7CFF]/50 bg-background/30 px-1.5 py-0.5 text-[13px] text-foreground outline-none"
          />
        ) : (
          <span className="min-w-0 flex-1 truncate text-[13px] leading-snug">{c.title}</span>
        )}

        {isRenaming ? (
          <button
            className="shrink-0 rounded-md p-1 text-muted-foreground/70 hover:bg-foreground/10 hover:text-foreground"
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.stopPropagation();
              commitRename();
            }}
            aria-label="Save name"
          >
            <Check className="size-3.5" />
          </button>
        ) : (
          <div className="flex shrink-0 items-center sm:opacity-0 sm:group-hover:opacity-100">
            <button
              className="rounded-md p-1 text-muted-foreground/50 transition-colors hover:bg-foreground/10 hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                startRename(c);
              }}
              aria-label={`Rename "${c.title}"`}
            >
              <Pencil className="size-3.5" />
            </button>
            <button
              className="rounded-md p-1 text-muted-foreground/50 transition-colors hover:bg-foreground/10 hover:text-red-400"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(c.id);
              }}
              aria-label={`Delete "${c.title}"`}
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-20 bg-background/50 md:hidden" onClick={onClose} aria-hidden />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-64 flex-col overflow-hidden glass-strong",
          "transition-transform duration-200 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full",
          "md:relative md:translate-x-0 md:z-auto"
        )}
      >
        {/* Brand */}
        <Link href="/" className="flex h-14 shrink-0 items-center gap-2.5 border-b border-border px-4">
          <Logo className="h-6 w-6 shrink-0" />
          <span className="text-sm font-semibold tracking-tight">Niko AI</span>
        </Link>

        {/* Projects toggle + New */}
        <div className="shrink-0 space-y-2 px-3 py-3">
          <button
            onClick={() => setView((v) => (v === "projects" ? "recent" : "projects"))}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-[13px] font-medium transition-colors",
              view === "projects"
                ? "border-[#4F7CFF]/50 bg-[#4F7CFF]/10 text-foreground"
                : "border-border text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
            )}
          >
            <FolderClosed className="size-3.5" /> Projects
          </button>
          <button
            onClick={onNew}
            className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium"
          >
            <Plus className="size-3.5" /> New conversation
          </button>
        </div>

        <div className="shrink-0 px-4 pb-1 pt-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {view === "projects" ? "Projects" : "Recent"}
          </span>
        </div>

        <ScrollArea className="flex-1">
          {view === "recent" ? (
            <div className="space-y-0.5 px-2 pb-2">
              {conversations.length === 0 ? (
                <p className="px-2 py-4 text-xs text-muted-foreground">No conversations yet.</p>
              ) : (
                conversations.map((c) => Row(c))
              )}
            </div>
          ) : (
            <div className="space-y-1 px-2 pb-2">
              {conversations.length === 0 ? (
                <p className="px-2 py-4 text-xs text-muted-foreground">No conversations yet.</p>
              ) : (
                MODES.map((m) => {
                  const items = conversations.filter((c) => (c.mode ?? "auto") === m.id);
                  const Icon = ICONS[m.icon];
                  const isCollapsed = collapsed.has(m.id);
                  return (
                    <div key={m.id}>
                      <button
                        onClick={() =>
                          setCollapsed((prev) => {
                            const n = new Set(prev);
                            n.has(m.id) ? n.delete(m.id) : n.add(m.id);
                            return n;
                          })
                        }
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
                      >
                        {isCollapsed ? <ChevronRight className="size-3.5 shrink-0" /> : <ChevronDown className="size-3.5 shrink-0" />}
                        <span className={cn("inline-flex size-5 shrink-0 items-center justify-center rounded-md bg-gradient-to-br text-[#fff]", m.gradient)}>
                          <Icon className="size-2.5" />
                        </span>
                        <span className="flex-1 truncate text-[12px] font-medium">{m.label}</span>
                        <span className="shrink-0 text-[11px] text-muted-foreground/60">{items.length}</span>
                      </button>
                      {!isCollapsed && (
                        <div className="ml-3 space-y-0.5 border-l border-border pl-1.5">
                          {items.length === 0 ? (
                            <p className="px-2 py-1.5 text-[11px] text-muted-foreground/60">No chats yet.</p>
                          ) : (
                            items.map((c) => Row(c))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </ScrollArea>

        {/* Footer — memory + account/membership */}
        <div className="shrink-0 space-y-2 border-t border-border p-2.5">
          {/* Memory shortcut */}
          <button
            onClick={onEditProfile}
            className="flex w-full items-center gap-2.5 rounded-xl glass-hover px-3 py-2 text-left cursor-pointer"
            title="Edit what Niko remembers"
          >
            <Settings2 className="size-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12px] font-medium">
                {profile.name || profile.focus ? "Memory" : "Set up memory"}
              </span>
              <span className="block truncate text-[11px] text-muted-foreground">
                {profile.focus || "Tell Niko what you're navigating"}
              </span>
            </span>
            <Lock className="size-3 shrink-0 text-muted-foreground/60" />
          </button>

          {/* Account + membership (ChatGPT-style) */}
          <div className="flex items-center gap-2.5 rounded-xl border border-border px-2.5 py-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4F7CFF] to-[#6D5CFF] text-[12px] font-semibold text-[#fff]">
              {initials || "?"}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium">{profile.name || "Guest"}</span>
              <span className="block truncate text-[11px] text-muted-foreground">Free</span>
            </span>
            <button
              onClick={onUpgrade}
              className="shrink-0 rounded-full bg-foreground px-3 py-1 text-[12px] font-medium text-background transition-colors hover:bg-foreground/90"
            >
              Upgrade
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

/* â”€â”€â”€ Message â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function MessageRow({ message, streaming }: { message: Message; streaming: boolean }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex flex-col gap-1.5 msg-enter", isUser ? "items-end" : "items-start")}>
      {!isUser && (
        <div className="flex items-center gap-2 px-1">
          <Logo className="size-3.5 text-muted-foreground" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Niko
          </span>
        </div>
      )}
      {isUser ? (
        <div className="max-w-[80%] rounded-2xl rounded-br-md gradient-user px-4 py-2.5 text-sm text-[#fff] shadow-[0_8px_24px_-10px_rgba(79,107,255,0.7)]">
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        </div>
      ) : (
        <div className="max-w-[88%] rounded-2xl rounded-tl-md glass px-4 py-3 text-sm leading-[1.7] text-foreground">
          {message.content ? (
            <Rich text={message.content} />
          ) : streaming ? (
            <span className="typing inline-flex items-center" aria-label="Niko is thinking">
              <span /><span /><span />
            </span>
          ) : null}
          {message.content && streaming && <span className="caret" />}
        </div>
      )}
    </div>
  );
}
function EmptyState({
  mode,
  greeting,
  onSend,
}: {
  mode: ModeId;
  greeting: string;
  onSend: (text: string) => void;
}) {
  const starters = STARTERS[mode];
  return (
    <div className="flex flex-col items-center pt-14 text-center sm:pt-24">
      <h1 className="text-[1.5rem] font-normal leading-tight text-foreground/85 sm:text-[1.9rem]">
        {greeting}
      </h1>

      <div className="mt-10 w-full max-w-md text-left">
        <p className="mb-2 text-[13px] text-muted-foreground">Suggestions</p>
        <div className="flex flex-col gap-2">
          {starters.map((s) => (
            <button
              key={s}
              onClick={() => onSend(s)}
              className="glass glass-hover flex items-start gap-3 rounded-xl px-4 py-3 text-left text-sm text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <span className="mt-px shrink-0 text-accent-blue/70"></span>
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
const GREETINGS: { withName: (n: string) => string; plain: string }[] = [
  { withName: (n) => `Hello ${n}, what's really going on?`, plain: "Hello what's really going on?" },
  { withName: (n) => `${n}, where should we start?`,         plain: "Where should we start?" },
  { withName: (n) => `What's on your mind, ${n}?`,            plain: "What's on your mind?" },
  { withName: (n) => `Okay ${n} what's the real situation?`, plain: "What's the real situation?" },
  { withName: (n) => `Good to see you, ${n}. What are we untangling?`, plain: "What are we untangling today?" },
  { withName: (n) => `What needs clarity today, ${n}?`,       plain: "What needs clarity today?" },
  { withName: (n) => `${n}, what's actually weighing on you?`, plain: "What's actually weighing on you?" },
  { withName: (n) => `Let's get to it, ${n}. What's the knot?`, plain: "Let's get to it" },
];

function resolveGreeting(name: string, idx: number): string {
  const g = GREETINGS[idx % GREETINGS.length];
  return name ? g.withName(name) : g.plain;
}

/* Starters per mode */
const STARTERS: Record<ModeId, string[]> = {
  auto: [
    "I want to do something with my life.",
    "I have too much on my plate and I can't tell what actually matters.",
  ],
  guide: [
    "I want more but I don't know where to focus.",
    "I keep avoiding one specific thing. Help me see why.",
  ],
  decide: [
    "I'm stuck between two options and can't decide.",
    "Should I stay where I am or make the leap?",
  ],
  action: [
    "I know what I want — help me turn it into real steps.",
    "I want to ship something in 30 days but don't know where to start.",
  ],
  recover: [
    "I'm overwhelmed and can't think straight.",
    "I'm drained and everything feels like too much.",
  ],
  chat: [
    "Can I just think out loud with you for a minute?",
    "Help me make sense of something on my mind.",
  ],
};

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile>({ ...EMPTY_PROFILE, onboarded: true });
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [mode, setMode] = useState<ModeId>("chat");
  const [greetingIdx, setGreetingIdx] = useState(0);

  const threadRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const loadedRef = useRef(false);

  // never auto-reopen the last conversation.
  useEffect(() => {
    setConversations(loadConversations());
    setActiveId(null);
    setGreetingIdx(Math.floor(Math.random() * GREETINGS.length));
    const p = loadProfile();
    setProfile(p);
    if (!p.onboarded) setShowOnboarding(true);
  }, []);

  // Safety net: persist the profile whenever it changes (skip the first run so we
  // never overwrite stored memory before hydration has loaded it).
  useEffect(() => {
    if (!loadedRef.current) {
      loadedRef.current = true;
      return;
    }
    saveProfile(profile);
  }, [profile]);

  const activeConv = conversations.find((c) => c.id === activeId);
  const messages = activeConv?.messages ?? [];
  const isEmpty = messages.length === 0;

  // Keep the visible mode in sync with the active conversation.
  useEffect(() => {
    if (activeConv) setMode(activeConv.mode ?? "chat");
  }, [activeId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll.
  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length, streaming]);

  const memory = useMemo(() => profileToMemory(profile), [profile]);

  function persist(updated: Conversation[]) {
    setConversations(updated);
    saveConversations(updated);
  }

  // "New conversation" just returns to a fresh greeting. The actual conversation
  // is created lazily on first send (ChatGPT-style) â€” no empty rows in history.
  const handleNew = useCallback(() => {
    setActiveId(null);
    setSidebarOpen(false);
    setInput("");
    setError(null);
    setGreetingIdx((i) => (i + 1) % GREETINGS.length);
  }, []);

  const handleSelect = useCallback((id: string) => {
    setActiveId(id);
    setSidebarOpen(false);
    setError(null);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      saveConversations(next);
      setActiveId((cur) => (cur === id ? null : cur));
      return next;
    });
  }, []);

  const handleRename = useCallback((id: string, title: string) => {
    setConversations((prev) => renameConversation(prev, id, title));
  }, []);

  // Picking a mode updates the active conversation (if any) and the picker.
  function pickMode(id: ModeId) {
    setMode(id);
    if (!activeId) return;
    setConversations((prev) => {
      const next = prev.map((c) => (c.id === activeId ? { ...c, mode: id } : c));
      saveConversations(next);
      return next;
    });
  }

  function autoGrow() {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 180) + "px";
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;
    setError(null);

    let targetId = activeId;
    let snapshot = conversations;
    const activeMode = mode;

    if (!targetId || !snapshot.find((c) => c.id === targetId)) {
      // Lazily create the conversation and title it immediately from this message.
      const c = newConversation(mode);
      c.title = titleFrom([{ id: "", role: "user", content: trimmed }]);
      targetId = c.id;
      snapshot = [c, ...snapshot];
      setActiveId(targetId);
    }

    const conv = snapshot.find((c) => c.id === targetId)!;
    const userMsg: Message = { id: uid(), role: "user", content: trimmed };
    const assistantMsg: Message = { id: uid(), role: "assistant", content: "" };

    const apiPayload = [...conv.messages, userMsg].map((m) => ({ role: m.role, content: m.content }));

    const optimistic = snapshot.map((c) =>
      c.id === targetId
        ? { ...c, mode: activeMode, messages: [...c.messages, userMsg, assistantMsg], updatedAt: Date.now() }
        : c
    );
    persist(optimistic);

    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiPayload, mode: activeMode, memory }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({ error: "Request failed." }));
        throw new Error(data.error ?? "Request failed.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setConversations((prev) =>
          prev.map((c) =>
            c.id === targetId
              ? { ...c, messages: c.messages.map((m) => (m.id === assistantMsg.id ? { ...m, content: acc } : m)) }
              : c
          )
        );
      }

      setConversations((prev) => {
        const next = prev.map((c) =>
          c.id === targetId ? { ...c, updatedAt: Date.now() } : c
        );
        saveConversations(next);
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setConversations((prev) => {
        const next = prev.map((c) =>
          c.id === targetId
            ? { ...c, messages: c.messages.filter((m) => !(m.id === assistantMsg.id && m.content === "")) }
            : c
        );
        saveConversations(next);
        return next;
      });
    } finally {
      setStreaming(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  const activeModeObj = getMode(mode);

  return (
    <div className="grid h-dvh overflow-hidden text-foreground" style={{ gridTemplateColumns: "auto 1fr" }}>
      {showOnboarding && (
        <Onboarding
          initial={profile}
          onClose={profile.onboarded ? () => setShowOnboarding(false) : undefined}
          onDone={(p) => {
            setProfile(p);
            saveProfile(p);
            setShowOnboarding(false);
          }}
        />
      )}

      {showPlans && <PlansModal onClose={() => setShowPlans(false)} />}

      <Sidebar
        conversations={conversations.filter((c) => c.messages.length > 0)}
        activeId={activeId}
        open={sidebarOpen}
        profile={profile}
        onSelect={handleSelect}
        onNew={handleNew}
        onDelete={handleDelete}
        onRename={handleRename}
        onClose={() => setSidebarOpen(false)}
        onEditProfile={() => setShowOnboarding(true)}
        onUpgrade={() => setShowPlans(true)}
      />

      <div className="flex min-w-0 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border px-4 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8 shrink-0 text-muted-foreground"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Open history"
          >
            <Menu className="size-4" />
          </Button>
          <span className="flex-1 truncate text-sm font-medium">
            {activeConv && activeConv.title !== "New conversation" ? activeConv.title : "Niko AI"}
          </span>
          <span className="hidden items-center gap-1.5 rounded-full glass px-2.5 py-1 text-[11px] text-muted-foreground sm:inline-flex">
            <span className="size-1.5 rounded-full bg-foreground/40" />
            {activeModeObj.label} mode
          </span>
        </header>

        {/* Thread */}
        <div ref={threadRef} className="scroll-thin flex-1 overflow-y-auto">
          <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
            {isEmpty ? (
              <EmptyState
                mode={mode}
                greeting={resolveGreeting(profile.name, greetingIdx)}
                onSend={send}
              />
            ) : (
              <div className="flex flex-col gap-6">
                {messages.map((m, i) => (
                  <MessageRow
                    key={m.id}
                    message={m}
                    streaming={streaming && i === messages.length - 1 && m.role === "assistant"}
                  />
                ))}
              </div>
            )}
            {error && (
              <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive msg-enter">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Composer */}
        <div className="shrink-0 px-4 pb-5 pt-3 sm:px-6">
          <div className="mx-auto max-w-2xl">
            {/* Mode chips */}
            <div className="scroll-thin mb-3 flex gap-2 overflow-x-auto pb-1">
              {MODES.map((m) => (
                <ModeChip key={m.id} mode={m} active={m.id === mode} onClick={() => pickMode(m.id)} />
              ))}
            </div>

            {/* Input — glass composer with tools (attach · search · tools/slash) */}
            <Composer
              value={input}
              onChange={setInput}
              onSend={send}
              disabled={streaming}
              hint={activeModeObj.hint}
              activeMode={mode}
              onPickMode={pickMode}
            />
            <p className="mt-2.5 text-center text-[11px] text-muted-foreground">
              Enter to send&nbsp;·&nbsp;Shift+Enter for new line&nbsp;·&nbsp;Type&nbsp;<span className="text-foreground/70">/</span>&nbsp;for tools &amp; modes
            </p>
          </div>
        </div>
      </div>
      <ThemeToggle />
    </div>
  );
}
