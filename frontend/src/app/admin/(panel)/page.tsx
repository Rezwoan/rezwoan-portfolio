'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FolderKanban, FileText, Inbox, Github, Plus, ArrowRight } from 'lucide-react';
import { adminApi } from '@/lib/admin';

export default function Dashboard() {
  const [stats, setStats] = useState({ projects: 0, posts: 0, unread: 0 });
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([adminApi.projects.list(), adminApi.blog.list(), adminApi.contact.list()])
      .then(([projects, posts, contact]) => {
        setStats({ projects: projects.length, posts: posts.length, unread: contact.filter((c: any) => !c.read).length });
        setRecent(contact.slice(0, 5));
      })
      .catch(() => {});
  }, []);

  const cards = [
    { label: 'Projects', value: stats.projects, icon: FolderKanban, href: '/admin/projects' },
    { label: 'Blog posts', value: stats.posts, icon: FileText, href: '/admin/blog' },
    { label: 'Unread messages', value: stats.unread, icon: Inbox, href: '/admin/inbox' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-heading font-bold">Dashboard</h1>
        <p className="text-text-secondary">Welcome back. Here&apos;s your site at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="card flex items-center gap-4 p-5 hover:border-accent/40">
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-accent/10 text-accent">
              <c.icon size={22} />
            </span>
            <div>
              <p className="text-2xl font-bold">{c.value}</p>
              <p className="text-sm text-text-muted">{c.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">Quick actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/projects/new?import=1" className="btn-primary"><Github size={16} /> Import from GitHub</Link>
          <Link href="/admin/projects/new" className="btn-secondary"><Plus size={16} /> New project</Link>
          <Link href="/admin/blog/new" className="btn-secondary"><Plus size={16} /> New post</Link>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Recent messages</h2>
          <Link href="/admin/inbox" className="inline-flex items-center gap-1 text-sm text-accent">All <ArrowRight size={14} /></Link>
        </div>
        {recent.length ? (
          <div className="card divide-y divide-border">
            {recent.map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-4">
                {!m.read && <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{m.name} <span className="text-text-muted">· {m.email}</span></p>
                  <p className="truncate text-sm text-text-secondary">{m.subject || m.message}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted">No messages yet.</p>
        )}
      </div>
    </div>
  );
}
