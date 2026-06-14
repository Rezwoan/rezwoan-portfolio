import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-[6rem] font-bold leading-none text-accent">404</p>
      <h1 className="mt-2 text-heading font-semibold">Page not found</h1>
      <p className="mt-2 max-w-sm text-text-secondary">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link href="/" className="btn-primary mt-8">
        <ArrowLeft size={16} /> Back home
      </Link>
    </div>
  );
}
