"use client";
/**
 * MagneticButton.tsx
 * Wraps any child in a container that moves toward the cursor on hover.
 * Apply to primary CTAs and social icon links.
 */
import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  strength?: number; // 0–1, how strongly it pulls (default 0.4)
  as?: "button" | "a" | "div";
  href?: string;
  onClick?: () => void;
  [key: string]: unknown;
}

export default function MagneticButton({
  children,
  className,
  strength = 0.4,
  as: Tag = "div",
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const shouldReduce = useReducedMotion();

  const handleMove = (e: React.MouseEvent) => {
    if (shouldReduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setOffset({
      x: (e.clientX - cx) * strength,
      y: (e.clientY - cy) * strength,
    });
  };

  const handleLeave = () => setOffset({ x: 0, y: 0 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: "spring", stiffness: 300, damping: 20, mass: 0.5 }}
      className={cn("inline-flex", className)}
      {...(props as object)}
    >
      {children}
    </motion.div>
  );
}
