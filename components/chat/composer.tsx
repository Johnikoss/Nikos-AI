"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUp,
  Compass,
  Globe,
  LifeBuoy,
  MessageCircle,
  Paperclip,
  Scale,
  SlidersHorizontal,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MODES, ModeId, Mode } from "@/lib/modes";

const MODE_ICONS = { Sparkles, Compass, Scale, Zap, LifeBuoy, MessageCircle } as const;

interface ComposerProps {
  value: string;
  onChange: (v: string) => void;
  onSend: (text: string) => void;
  disabled?: boolean;
  hint?: string;
  activeMode: ModeId;
  onPickMode: (id: ModeId) => void;
}

export function Composer({
  value,
  onChange,
  onSend,
  disabled,
  hint,
  activeMode,
  onPickMode,
}: ComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [focused, setFocused] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [webSearch, setWebSearch] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [activeCmd, setActiveCmd] = useState(0);

  // slash-command list: each mode + a web-search toggle
  const slashQuery = value.startsWith("/") && !value.includes(" ") ? value.slice(1).toLowerCase() : null;
  const commands: { id: string; label: string; hint: string; run: () => void; icon: React.ReactNode }[] = [
    ...MODES.map((m: Mode) => {
      const Icon = MODE_ICONS[m.icon];
      return {
        id: m.id,
        label: m.label,
        hint: `/${m.id}`,
        icon: <Icon className="size-4" />,
        run: () => {
          onPickMode(m.id);
          onChange("");
          focusInput();
        },
      };
    }),
    {
      id: "search",
      label: webSearch ? "Web search · on" : "Search the web",
      hint: "/search",
      icon: <Globe className="size-4" />,
      run: () => {
        setWebSearch((v) => !v);
        onChange("");
        focusInput();
      },
    },
  ];
  const filtered = slashQuery
    ? commands.filter((c) => c.id.includes(slashQuery) || c.label.toLowerCase().includes(slashQuery))
    : commands;

  function focusInput() {
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  const autoGrow = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
  }, []);

  useEffect(() => {
    autoGrow();
    if (value === "" && textareaRef.current) textareaRef.current.style.height = "auto";
  }, [value, autoGrow]);

  // open palette when typing a slash command
  useEffect(() => {
    if (slashQuery !== null) {
      setShowCommands(true);
      setActiveCmd(0);
    } else if (slashQuery === null && value !== "") {
      setShowCommands(false);
    }
  }, [slashQuery, value]);

  // close the tools palette on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      const btn = document.querySelector("[data-tools-button]");
      if (paletteRef.current && !paletteRef.current.contains(t) && !btn?.contains(t)) {
        if (slashQuery === null) setShowCommands(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [slashQuery]);

  function submit() {
    if (!value.trim() || disabled) return;
    onSend(value);
    setAttachments([]);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (showCommands && filtered.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveCmd((p) => (p + 1) % filtered.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveCmd((p) => (p - 1 + filtered.length) % filtered.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        filtered[activeCmd]?.run();
        setShowCommands(false);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setShowCommands(false);
        return;
      }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const names = Array.from(e.target.files ?? []).map((f) => f.name);
    if (names.length) setAttachments((prev) => [...prev, ...names]);
    e.target.value = "";
  }

  return (
    <div className="relative">
      {/* command / tools palette */}
      <AnimatePresence>
        {showCommands && filtered.length > 0 && (
          <motion.div
            ref={paletteRef}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-xl border border-foreground/10 bg-background/85 p-1 backdrop-blur-xl"
          >
            <p className="px-3 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-widest text-foreground/35">
              Tools & modes
            </p>
            {filtered.map((cmd, i) => (
              <button
                key={cmd.id}
                onMouseEnter={() => setActiveCmd(i)}
                onClick={() => {
                  cmd.run();
                  setShowCommands(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] transition-colors",
                  i === activeCmd ? "bg-foreground/10 text-foreground" : "text-foreground/65 hover:bg-foreground/5"
                )}
              >
                <span className="text-foreground/55">{cmd.icon}</span>
                <span className="flex-1 font-medium">{cmd.label}</span>
                <span className="text-[11px] text-foreground/35">{cmd.hint}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={cn(
          "rounded-2xl border bg-foreground/[0.03] backdrop-blur-xl transition-colors",
          focused ? "border-[#4F7CFF]/50" : "border-foreground/10"
        )}
      >
        {/* attachments */}
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-2 px-4 pt-3"
            >
              {attachments.map((file, i) => (
                <span
                  key={`${file}-${i}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-foreground/[0.06] px-2.5 py-1 text-[12px] text-foreground/70"
                >
                  <Paperclip className="size-3" />
                  <span className="max-w-[160px] truncate">{file}</span>
                  <button
                    onClick={() => setAttachments((p) => p.filter((_, j) => j !== i))}
                    className="text-foreground/40 transition-colors hover:text-foreground"
                    aria-label={`Remove ${file}`}
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          rows={1}
          disabled={disabled}
          placeholder={hint || "What's on your mind?"}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="block w-full resize-none bg-transparent px-4 pt-3.5 text-sm text-foreground/90 outline-none placeholder:text-foreground/30 disabled:opacity-50"
          style={{ maxHeight: 200 }}
        />

        {/* toolbar */}
        <div className="flex items-center justify-between gap-2 px-3 py-2.5">
          <div className="flex items-center gap-1">
            <input ref={fileRef} type="file" multiple hidden onChange={onPickFiles} />
            <ToolButton label="Attach files" onClick={() => fileRef.current?.click()}>
              <Paperclip className="size-4" />
            </ToolButton>
            <ToolButton
              label="Search the web"
              active={webSearch}
              onClick={() => setWebSearch((v) => !v)}
            >
              <Globe className="size-4" />
            </ToolButton>
            <button
              data-tools-button
              onClick={() => setShowCommands((v) => !v)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] transition-colors",
                showCommands ? "bg-foreground/10 text-foreground" : "text-foreground/55 hover:bg-foreground/5 hover:text-foreground/90"
              )}
            >
              <SlidersHorizontal className="size-4" />
              Tools
            </button>
          </div>

          <button
            onClick={submit}
            disabled={!value.trim() || disabled}
            aria-label="Send message"
            className="btn-primary inline-flex size-9 shrink-0 items-center justify-center rounded-xl disabled:opacity-40"
          >
            <ArrowUp className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ToolButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        "inline-flex items-center justify-center rounded-lg p-2 transition-colors",
        active ? "bg-[#4F7CFF]/15 text-[#9DB4FF]" : "text-foreground/45 hover:bg-foreground/5 hover:text-foreground/90"
      )}
    >
      {children}
    </button>
  );
}
