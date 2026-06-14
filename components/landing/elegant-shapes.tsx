"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** A single floating, rotated glass pill that drifts gently. */
function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
}: {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -150, rotate: rotate - 15 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        style={{ width, height }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full bg-gradient-to-r to-transparent",
            gradient,
            "border-2 border-white/[0.12] backdrop-blur-[2px]",
            "shadow-[0_8px_32px_0_rgba(255,255,255,0.08)]",
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.16),transparent_70%)]"
          )}
        />
      </motion.div>
    </motion.div>
  );
}

/** Floating glass pills behind the hero — tuned to the blue/violet brand. */
export function ElegantShapes() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-[1] overflow-hidden">
      <ElegantShape delay={0.3} width={600} height={140} rotate={12} gradient="from-indigo-500/[0.14]" className="left-[-10%] top-[8%] md:left-[-5%] md:top-[14%]" />
      <ElegantShape delay={0.5} width={460} height={120} rotate={-15} gradient="from-blue-500/[0.14]" className="right-[-6%] top-[64%] md:right-[0%] md:top-[70%]" />
      <ElegantShape delay={0.4} width={300} height={80} rotate={-8} gradient="from-violet-500/[0.14]" className="left-[4%] bottom-[2%] md:left-[10%] md:bottom-[8%]" />
      <ElegantShape delay={0.6} width={200} height={60} rotate={20} gradient="from-sky-500/[0.14]" className="right-[14%] top-[6%] md:right-[20%] md:top-[10%]" />
      <ElegantShape delay={0.7} width={140} height={40} rotate={-25} gradient="from-cyan-500/[0.14]" className="left-[18%] top-[2%] md:left-[24%] md:top-[8%]" />
    </div>
  );
}
