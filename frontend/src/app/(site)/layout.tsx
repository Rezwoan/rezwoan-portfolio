import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/ui/footer';
import { ChatWidget } from '@/components/chat/chat-widget';
import { getSiteSettings } from '@/lib/api';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  return (
    <>
      <Navbar shortName={settings?.shortName} />
      <main className="min-h-screen pt-16">{children}</main>
      <Footer settings={settings} />
      <ChatWidget />
    </>
  );
}
