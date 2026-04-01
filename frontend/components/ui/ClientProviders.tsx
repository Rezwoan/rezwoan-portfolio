"use client";
/**
 * ClientProviders.tsx
 * All client-only singletons that need to wrap the app.
 * Imported once in root layout.tsx.
 */
import dynamic from "next/dynamic";

// Dynamic import ensures cursor code never runs on server
const CustomCursor = dynamic(() => import("./CustomCursor"), { ssr: false });

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CustomCursor />
      {children}
    </>
  );
}
