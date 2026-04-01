import type { Metadata } from "next";
import "./globals.css";
import { getSiteSettings } from "@/lib/api";
import { buildBaseMetadata, buildPersonSchema, jsonLd } from "@/lib/seo";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import ClientProviders from "@/components/ui/ClientProviders";

async function getSettings() {
  try {
    return await getSiteSettings();
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  if (!settings) {
    return {
      title: { default: "Rezwoan — Full Stack Developer", template: "%s — Rezwoan" },
      description: "Full Stack Developer & CSE Student based in Dhaka, Bangladesh.",
    };
  }
  return buildBaseMetadata(settings);
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@800,700,600,500&f[]=satoshi@700,500,400&display=swap"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="alternate" type="application/rss+xml" title="Rezwoan's Blog" href="/feed/rss/" />
        {settings && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: jsonLd(buildPersonSchema(settings)) }}
          />
        )}
        {settings?.google_analytics_id && process.env.NODE_ENV === "production" && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${settings.google_analytics_id}`} />
            <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${settings.google_analytics_id}');` }} />
          </>
        )}
      </head>
      <body className="bg-background text-text-primary font-body antialiased">
        <ClientProviders>
          <Navbar availableForWork={settings?.available_for_work ?? false} />
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
          <Footer settings={settings} />
        </ClientProviders>
      </body>
    </html>
  );
}
