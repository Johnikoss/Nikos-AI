"use client";

import { useEffect, useRef } from "react";

/**
 * Global living background, shared by the landing AND the chat so they match.
 * Layers (back → front): near-black base · slowly color-shifting glow (blue /
 * white / teal, see .scene-glow) · a mesh of crossing lines that web blue around
 * the cursor · faint grain. Pure 2D canvas; goes static under reduced motion.
 */
export function SceneBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const context = canvasEl.getContext("2d", { alpha: true });
    if (!context) return;
    const cv = canvasEl;
    const c = context;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const LINK = 150; // node ↔ node line distance
    const CURSOR_LINK = 210; // node ↔ cursor line distance

    let w = 0;
    let h = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: -9999, y: -9999, active: false };

    type Node = { x: number; y: number; vx: number; vy: number };
    let nodes: Node[] = [];

    function build() {
      const count = Math.min(120, Math.max(40, Math.round((w * h) / 16000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
      }));
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      cv.width = Math.floor(w * dpr);
      cv.height = Math.floor(h * dpr);
      cv.style.width = w + "px";
      cv.style.height = h + "px";
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    function step() {
      c.clearRect(0, 0, w, h);

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }

      // crossing lines between nearby nodes (faint white)
      c.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < LINK) {
            c.strokeStyle = `rgba(255,255,255,${(1 - d / LINK) * 0.15})`;
            c.beginPath();
            c.moveTo(a.x, a.y);
            c.lineTo(b.x, b.y);
            c.stroke();
          }
        }
        // tiny node glints
        c.fillStyle = "rgba(255,255,255,0.18)";
        c.fillRect(a.x - 0.6, a.y - 0.6, 1.2, 1.2);
      }

      // cursor weaves a blue web + soft glow
      if (mouse.active) {
        for (const n of nodes) {
          const d = Math.hypot(n.x - mouse.x, n.y - mouse.y);
          if (d < CURSOR_LINK) {
            c.strokeStyle = `rgba(79,124,255,${(1 - d / CURSOR_LINK) * 0.5})`;
            c.beginPath();
            c.moveTo(n.x, n.y);
            c.lineTo(mouse.x, mouse.y);
            c.stroke();
          }
        }
        const g = c.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 230);
        g.addColorStop(0, "rgba(79,124,255,0.12)");
        g.addColorStop(1, "rgba(79,124,255,0)");
        c.fillStyle = g;
        c.fillRect(mouse.x - 230, mouse.y - 230, 460, 460);
      }
    }

    let raf = 0;
    function loop() {
      step();
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
    if (reduced) step();
    else raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
    };
  }, []);

  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#050507]" />
      <div className="scene-glow" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="scene-grain" />
    </div>
  );
}
