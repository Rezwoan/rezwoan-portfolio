"use client";
import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import FadeUp from "@/components/animations/FadeUp";
import { cn } from "@/lib/utils";
import type { Testimonial } from "@/lib/api";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? "fill-accent text-accent" : "fill-border text-border"}
        />
      ))}
    </div>
  );
}

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-6 md:p-8 max-w-2xl mx-auto">
      <div className="mb-5">
        <StarRating rating={t.rating} />
      </div>
      <blockquote className="text-body md:text-subheading text-text-primary leading-relaxed mb-6 font-display">
        &ldquo;{t.quote}&rdquo;
      </blockquote>
      <div className="flex items-center gap-3 pt-4 border-t border-border/50">
        {/* Avatar circle */}
        <div className="w-10 h-10 rounded-full bg-accent-muted border border-accent/20 flex items-center justify-center text-sm font-bold text-accent shrink-0">
          {t.client_name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <div className="font-medium text-small text-text-primary">{t.client_name}</div>
          <div className="text-xs text-text-muted">
            {t.client_title}{t.client_company && ` · ${t.client_company}`}
          </div>
        </div>
        <span className="ml-auto tech-tag text-[10px] capitalize">{t.source}</span>
      </div>
    </div>
  );
}

export default function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  const [current, setCurrent] = useState(0);
  const shouldReduce = useReducedMotion();

  if (!testimonials.length) return null;

  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent((c) => (c + 1) % testimonials.length);

  return (
    <section className="section" id="testimonials" aria-labelledby="testimonials-heading">
      <div className="container-site">
        <FadeUp>
          <p className="section-label">Social proof</p>
          <h2 id="testimonials-heading" className="text-display font-display mb-10 text-center">
            What clients say
          </h2>
        </FadeUp>

        <FadeUp delay={0.1} className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={shouldReduce ? false : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <TestimonialCard t={testimonials[current]} />
            </motion.div>
          </AnimatePresence>

          {testimonials.length > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={prev}
                aria-label="Previous testimonial"
                className="w-9 h-9 flex items-center justify-center rounded-md border border-border text-text-muted hover:text-accent hover:border-accent transition-all duration-micro"
              >
                <ChevronLeft size={16} />
              </button>
              {/* Dots */}
              <div className="flex gap-1.5">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    aria-label={`Go to testimonial ${i + 1}`}
                    aria-current={i === current}
                    className={cn(
                      "rounded-full transition-all duration-micro",
                      i === current
                        ? "w-5 h-1.5 bg-accent"
                        : "w-1.5 h-1.5 bg-border hover:bg-text-muted"
                    )}
                  />
                ))}
              </div>
              <button
                onClick={next}
                aria-label="Next testimonial"
                className="w-9 h-9 flex items-center justify-center rounded-md border border-border text-text-muted hover:text-accent hover:border-accent transition-all duration-micro"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </FadeUp>
      </div>
    </section>
  );
}
