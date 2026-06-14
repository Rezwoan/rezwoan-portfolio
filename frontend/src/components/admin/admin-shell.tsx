'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import {
  LayoutDashboard, FolderKanban, FileText, Wrench, Briefcase, Quote, Tags, Inbox, Settings, LogOut, ExternalLink,
} from 'lucide-react';
import { auth } from '@/lib/admin';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { href: '/admin/blog', label: 'Blog', icon: FileText },
  { href: '/admin/skills', label: 'Skills', icon: Wrench },
  { href: '/admin/experience', label: 'Experience', icon: Briefcase },
  { href: '/admin/testimonials', label: 'Testimonials', icon: Quote },
  { href: '/admin/tags', label: 'Tags', icon: Tags },
  { href: '/admin/inbox', label: 'Inbox', icon: Inbox },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await auth.logout().catch(() => {});
    router.replace('/admin/login');
  }

  const active = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));

  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-bg-elevated md:flex">
        <div className="flex h-16 items-center px-5 font-display text-lg font-bold">
          Rezwoan<span className="text-accent">.</span>
          <span className="ml-2 text-xs font-normal text-text-muted">admin</span>
        </div>
        <nav className="flex-1 space-y-0.5 px-3 py-2">
          {NAV.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                active(href, exact) ? 'bg-accent/12 text-accent' : 'text-text-secondary hover:bg-bg-raised hover:text-text',
              )}
            >
              <Icon size={16} /> {label}
            </Link>
          ))}
        </nav>
        <div className="space-y-1 border-t border-border p-3">
          <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-bg-raised">
            <ExternalLink size={16} /> View site
          </a>
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-bg-raised hover:text-error">
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-bg/80 px-5 backdrop-blur">
          <div className="flex gap-1 overflow-x-auto md:hidden">
            {NAV.map(({ href, label, exact }) => (
              <Link key={href} href={href} className={cn('whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs', active(href, exact) ? 'bg-accent/12 text-accent' : 'text-text-secondary')}>
                {label}
              </Link>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <button onClick={logout} className="btn-secondary text-sm md:hidden">
              <LogOut size={14} />
            </button>
          </div>
        </header>
        <main className="flex-1 p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
