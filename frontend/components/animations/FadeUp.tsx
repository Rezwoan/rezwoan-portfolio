"use client";
/**
 * FadeUp.tsx — Scroll-triggered fade-up reveal.
 * Wrap any section content in this to animate it into view.
 *
 * Usage:
 *   <FadeUp><h2>Hello</h2></FadeUp>
 *   <FadeUp delay={0.2}><p>World</p></FadeUp>
 */
import { motion, useReducedMotion } from "framer-motion";

interface FadeUpProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean; // Only animate once (default true)
}

export default function FadeUp({
  children,
  delay = 0,
  duration = 0.5,
  className,
  once = true,
}: FadeUpProps) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{
        duration: shouldReduce ? 0 : duration,
        delay: shouldReduce ? 0 : delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
