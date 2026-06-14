'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';
import { auth } from '@/lib/admin';
import { Input, Field } from '@/components/admin/ui';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    auth.me().then(() => router.replace('/admin')).catch(() => {});
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await auth.login(email, password);
      router.replace('/admin');
    } catch {
      setError('Invalid email or password');
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-2xl font-bold">Rezwoan<span className="text-accent">.</span></p>
          <p className="mt-1 text-sm text-text-muted">Admin sign in</p>
        </div>
        <form onSubmit={onSubmit} className="card space-y-4 p-6">
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus placeholder="you@email.com" />
          </Field>
          <Field label="Password">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
          </Field>
          {error && <p className="text-sm text-error">{error}</p>}
          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? 'Signing in…' : (<>Sign in <LogIn size={16} /></>)}
          </button>
        </form>
      </div>
    </div>
  );
}
