"use client";
/**
 * TextReveal.tsx — Word-by-word staggered reveal.
 * Used for hero headings and section titles.
 *
 * Usage:
 *   <TextReveal as="h1" text="Din Muhammad Rezwoan" className="text-hero" />
 */
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TextRevealProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  delay?: number;
  stagger?: number;
  animateOnLoad?: boolean;
}

export default function TextReveal({
  text,
  as: Tag = "h2",
  className,
  delay = 0,
  stagger = 0.04,
  animateOnLoad = false,
}: TextRevealProps) {
  const shouldReduce = useReducedMotion();
  const words = text.split(" ");

  if (shouldReduce) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <Tag className={cn("overflow-hidden", className)}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.25em] last:mr-0">
          <motion.span
            className="inline-block"
            initial={{ y: "110%", opacity: 0 }}
            animate={animateOnLoad ? { y: "0%", opacity: 1 } : undefined}
            whileInView={!animateOnLoad ? { y: "0%", opacity: 1 } : undefined}
            viewport={{ once: true, margin: animateOnLoad ? "0px" : "-40px" }}
            transition={{
              duration: 0.55,
              delay: delay + i * stagger,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
