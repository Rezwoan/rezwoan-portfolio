'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Github, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Project } from '@/lib/api';
import { mediaUrl } from '@/lib/utils';

export function ProjectCard({ project }: { project: Project }) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="card group flex flex-col overflow-hidden hover:border-accent/40 hover:shadow-card"
    >
      <Link href={`/projects/${project.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-bg-raised">
          {project.coverImageUrl ? (
            <Image
              src={mediaUrl(project.coverImageUrl)}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-accent/10 to-accent-2/10">
              <span className="font-display text-2xl font-bold text-accent/60">{project.title.charAt(0)}</span>
            </div>
          )}
          {project.repoStars ? (
            <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-bg/80 px-2 py-1 text-xs text-text backdrop-blur">
              <Star size={12} className="text-accent" /> {project.repoStars}
            </span>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/projects/${project.slug}`}>
            <h3 className="font-display text-lg font-semibold transition-colors group-hover:text-accent">
              {project.title}
            </h3>
          </Link>
          <span className="chip shrink-0 capitalize">{project.category}</span>
        </div>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-text-secondary">{project.shortDescription}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.tags?.slice(0, 4).map((t) => (
            <span
              key={t.name}
              className="rounded-sm px-2 py-0.5 text-xs"
              style={{ color: t.color, backgroundColor: `${t.color}1A` }}
            >
              {t.name}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3 border-t border-border-muted pt-4 text-sm">
          <Link href={`/projects/${project.slug}`} className="inline-flex items-center gap-1 text-accent">
            Case study <ArrowUpRight size={14} />
          </Link>
          <span className="ml-auto flex gap-2">
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noreferrer" aria-label="Source" className="text-text-muted hover:text-text">
                <Github size={16} />
              </a>
            )}
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noreferrer" aria-label="Live" className="text-text-muted hover:text-text">
                <ArrowUpRight size={16} />
              </a>
            )}
          </span>
        </div>
      </div>
    </motion.article>
  );
}
