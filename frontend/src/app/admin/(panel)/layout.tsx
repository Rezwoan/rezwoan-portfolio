'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/admin';
import { AdminShell } from '@/components/admin/admin-shell';
import { ToastProvider } from '@/components/admin/ui';

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<'loading' | 'ok'>('loading');

  useEffect(() => {
    auth
      .me()
      .then(() => setState('ok'))
      .catch(() => router.replace('/admin/login'));
  }, [router]);

  if (state === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent" />
      </div>
    );
  }

  return (
    <ToastProvider>
      <AdminShell>{children}</AdminShell>
    </ToastProvider>
  );
}
