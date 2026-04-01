"use client";
/**
 * CustomCursor.tsx — Magnetic dot + trailing ring cursor.
 * Only renders on non-touch devices (pointer: fine).
 * Add to root layout inside a <ClientOnly> wrapper.
 */
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

type CursorState = "default" | "hover" | "image" | "text";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<CursorState>("default");
  const [visible, setVisible] = useState(false);
  const shouldReduce = useReducedMotion();

  // Mouse position — dot follows exactly, ring lerps
  const mouse = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const rafId = useRef<number>(0);

  useEffect(() => {
    // Only on pointer: fine (mouse) devices
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (shouldReduce) return;

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    // Track hover state changes on interactive elements
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("img, video, [data-cursor='image']")) {
        setState("image");
      } else if (target.closest("a, button, [role='button'], [data-cursor='hover']")) {
        setState("hover");
      } else if (target.closest("p, span, h1, h2, h3, h4, h5, h6, [data-cursor='text']")) {
        setState("text");
      } else {
        setState("default");
      }
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    document.addEventListener("mouseover", onMouseOver);

    // Animation loop — dot snaps, ring lerps
    const animate = () => {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouse.current.x}px, ${mouse.current.y}px) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ring.current.x += (mouse.current.x - ring.current.x) * 0.12;
        ring.current.y += (mouse.current.y - ring.current.y) * 0.12;
        ringRef.current.style.transform = `translate(${ring.current.x}px, ${ring.current.y}px) translate(-50%, -50%)`;
      }
      rafId.current = requestAnimationFrame(animate);
    };
    rafId.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      document.removeEventListener("mouseover", onMouseOver);
      cancelAnimationFrame(rafId.current);
    };
  }, [shouldReduce, visible]);

  if (shouldReduce) return null;

  const dotSize = state === "hover" ? "4px" : "8px";
  const ringSize = state === "hover" ? "48px" : state === "image" ? "56px" : "36px";
  const ringRadius = state === "image" ? "8px" : "50%";
  const ringOpacity = visible ? 1 : 0;

  return (
    <>
      {/* Dot — snaps to cursor */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: dotSize,
          height: dotSize,
          borderRadius: "50%",
          backgroundColor: "#C8F04B",
          pointerEvents: "none",
          zIndex: 9999,
          opacity: visible ? 1 : 0,
          transition: "width 150ms ease, height 150ms ease, opacity 200ms ease",
          willChange: "transform",
          mixBlendMode: "difference",
        }}
      />
      {/* Ring — follows with lag */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: ringSize,
          height: ringSize,
          borderRadius: ringRadius,
          border: "1.5px solid rgba(200, 240, 75, 0.6)",
          pointerEvents: "none",
          zIndex: 9998,
          opacity: ringOpacity,
          transition: "width 200ms ease, height 200ms ease, border-radius 200ms ease, opacity 200ms ease",
          willChange: "transform",
        }}
      />
    </>
  );
}
