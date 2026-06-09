"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Letter-by-letter spring reveal for headline text. Splits into words (so they
 * wrap cleanly) then animates each letter up into place.
 */
export function LetterReveal({
  text,
  className,
  delay = 0,
  stagger = 0.025,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const words = text.split(" ");
  let k = 0;
  return (
    <span className={cn("inline-block", className)} aria-label={text}>
      {words.map((word, wi) => (
        <span key={wi} aria-hidden className="mr-[0.25em] inline-block whitespace-nowrap last:mr-0">
          {word.split("").map((ch, ci) => {
            const i = k++;
            return (
              <motion.span
                key={ci}
                className="inline-block"
                initial={{ y: "0.5em", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  delay: delay + i * stagger,
                  type: "spring",
                  stiffness: 220,
                  damping: 24,
                }}
              >
                {ch}
              </motion.span>
            );
          })}
        </span>
      ))}
    </span>
  );
}

/** Fade + rise on scroll into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 26,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

/** Simple fade for things that should just appear (e.g. hero sub/CTAs). */
export function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
