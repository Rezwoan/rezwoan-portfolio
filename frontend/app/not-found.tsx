import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-site section flex flex-col items-center justify-center text-center min-h-[60vh]">
      <p className="font-mono text-accent text-small mb-4">404</p>
      <h1 className="text-display font-display mb-4">Page not found</h1>
      <p className="text-body text-text-secondary mb-8 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/" className="btn-accent group">
        <ArrowLeft size={15} className="transition-transform duration-micro group-hover:-translate-x-1" />
        Back to home
      </Link>
    </div>
  );
}
