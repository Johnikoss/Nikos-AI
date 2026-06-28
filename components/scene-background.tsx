"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/theme-provider";

/**
 * Global background. The landing gets the living scene (color-shifting glow,
 * math-graph canvas, cursor crosshair, grain — see .scene-glow). The chat
 * (/app) gets a calm static version: near-black base + one faint glow, so the
 * product feels focused rather than showy. Goes static under reduced motion.
 */
export function SceneBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathname = usePathname();
  const { theme } = useTheme();
  const isChat = pathname?.startsWith("/app") ?? false;

  useEffect(() => {
    if (isChat) return;
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const context = canvasEl.getContext("2d", { alpha: true });
    if (!context) return;
    const cv = canvasEl;
    const c = context;

    // The landing is a dark-only page (base is hard-coded near-black below), so the
    // grid/curves are always drawn with their dark-theme colors — independent of the
    // user's stored app theme.
    const gridColor = "rgba(255,255,255,0.045)";
    const neutralCurve = "255,255,255";
    const neutralAlpha = 0.10;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const GRID = 46; // grid cell size (px)

    let w = 0;
    let h = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: -9999, y: -9999, active: false };

    // animated function curves (sine/cosine plots)
    const curves = [
      { amp: 70, freq: 0.0055, speed: 0.18, phase: 0, yFrac: 0.32, color: "79,124,255", alpha: 0.30 },
      { amp: 110, freq: 0.0034, speed: -0.12, phase: 1.7, yFrac: 0.55, color: "139,108,255", alpha: 0.22 },
      { amp: 52, freq: 0.0072, speed: 0.24, phase: 3.4, yFrac: 0.7, color: neutralCurve, alpha: neutralAlpha },
    ];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      cv.width = Math.floor(w * dpr);
      cv.height = Math.floor(h * dpr);
      cv.style.width = w + "px";
      cv.style.height = h + "px";
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawGrid() {
      c.lineWidth = 1;
      c.strokeStyle = gridColor;
      c.beginPath();
      for (let x = (w / 2) % GRID; x <= w; x += GRID) {
        c.moveTo(Math.round(x) + 0.5, 0);
        c.lineTo(Math.round(x) + 0.5, h);
      }
      for (let y = (h / 2) % GRID; y <= h; y += GRID) {
        c.moveTo(0, Math.round(y) + 0.5);
        c.lineTo(w, Math.round(y) + 0.5);
      }
      c.stroke();
    }

    function drawCurves(t: number) {
      for (const cu of curves) {
        const baseY = h * cu.yFrac;
        c.beginPath();
        for (let x = 0; x <= w; x += 6) {
          const y = baseY + cu.amp * Math.sin(x * cu.freq + t * cu.speed + cu.phase);
          if (x === 0) c.moveTo(x, y);
          else c.lineTo(x, y);
        }
        c.strokeStyle = `rgba(${cu.color},${cu.alpha})`;
        c.lineWidth = 1.4;
        c.stroke();
      }
    }

    function drawCursor() {
      if (!mouse.active) return;
      // crosshair (graph reticle)
      c.strokeStyle = "rgba(79,124,255,0.22)";
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(0, mouse.y + 0.5);
      c.lineTo(w, mouse.y + 0.5);
      c.moveTo(mouse.x + 0.5, 0);
      c.lineTo(mouse.x + 0.5, h);
      c.stroke();
      // soft glow at the intersection
      const g = c.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 240);
      g.addColorStop(0, "rgba(79,124,255,0.14)");
      g.addColorStop(1, "rgba(79,124,255,0)");
      c.fillStyle = g;
      c.fillRect(mouse.x - 240, mouse.y - 240, 480, 480);
      // plotted point
      c.fillStyle = "rgba(157,180,255,0.9)";
      c.beginPath();
      c.arc(mouse.x, mouse.y, 2.5, 0, Math.PI * 2);
      c.fill();
    }

    function step(t: number) {
      c.clearRect(0, 0, w, h);
      drawGrid();
      drawCurves(t * 0.001);
      drawCursor();
    }

    let raf = 0;
    function loop(t: number) {
      step(t);
      raf = requestAnimationFrame(loop);
    }
    function onMove(e: MouseEvent) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    }
    function onLeave() {
      mouse.active = false;
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseout", onLeave);
    if (reduced) step(0);
    else raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
    };
  }, [isChat, theme]);

  if (isChat) {
    return (
      <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-background" />
        <div className="chat-glow" />
      </div>
    );
  }

  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#050507]" />
      <div className="scene-glow" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="scene-grain" />
    </div>
  );
}
