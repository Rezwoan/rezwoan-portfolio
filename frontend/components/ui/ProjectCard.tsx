"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Github } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/api";

interface ProjectCardProps {
  project: Project;
  index?: number;
  featured?: boolean;
}

export default function ProjectCard({ project, index = 0, featured = false }: ProjectCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const shouldReduce = useReducedMotion();

  const handleMove = (e: React.MouseEvent) => {
    if (shouldReduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
    setTilt({ x, y });
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        delay: index * 0.08,
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
      }}
      onMouseMove={handleMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      style={shouldReduce ? {} : {
        transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
        transition: "transform 200ms ease",
      }}
      className={cn(
        "group relative bg-surface border border-border rounded-xl overflow-hidden",
        "hover:border-[#333] transition-colors duration-ui",
        featured ? "md:col-span-2" : ""
      )}
    >
      {/* Cover image */}
      {project.cover_image && (
        <div className={cn("overflow-hidden bg-surface-raised", featured ? "h-64 md:h-80" : "h-48")}>
          <Image
            src={project.cover_image.url}
            alt={project.cover_image.alt_text || project.title}
            width={project.cover_image.width}
            height={project.cover_image.height}
            className="w-full h-full object-cover transition-transform duration-page group-hover:scale-[1.03]"
          />
        </div>
      )}

      {/* No image fallback */}
      {!project.cover_image && (
        <div className={cn(
          "bg-surface-raised flex items-center justify-center overflow-hidden",
          featured ? "h-64 md:h-80" : "h-48"
        )}>
          <div className="font-display font-bold text-4xl text-border select-none">
            {project.title.slice(0, 2).toUpperCase()}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        {/* Category badge */}
        <span className="tech-tag text-[10px] mb-3 inline-flex">
          {project.category}
        </span>

        <h3 className="font-display font-bold text-subheading mb-2 group-hover:text-accent transition-colors duration-micro">
          {project.title}
        </h3>
        <p className="text-small text-text-secondary leading-relaxed mb-4 line-clamp-2">
          {project.short_description}
        </p>

        {/* Tech stack */}
        {project.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.tech_stack.slice(0, 4).map((tag) => (
              <span
                key={tag.name}
                className="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-mono font-medium bg-surface-raised border border-border text-text-muted"
                style={{ borderColor: `${tag.color}30`, color: tag.color }}
              >
                {tag.name}
              </span>
            ))}
            {project.tech_stack.length > 4 && (
              <span className="tech-tag text-[11px]">+{project.tech_stack.length - 4}</span>
            )}
          </div>
        )}

        {/* Links */}
        <div className="flex items-center gap-3 pt-3 border-t border-border/50">
          <Link
            href={`/projects/${project.slug}`}
            className="flex items-center gap-1 text-small font-medium text-text-secondary hover:text-accent transition-colors duration-micro"
          >
            Case study <ArrowUpRight size={14} />
          </Link>
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-small text-text-muted hover:text-text-primary transition-colors duration-micro"
              aria-label={`${project.title} live demo`}
            >
              Live <ArrowUpRight size={13} />
            </a>
          )}
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-text-muted hover:text-text-primary transition-colors duration-micro"
              aria-label={`${project.title} source code`}
            >
              <Github size={16} />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
