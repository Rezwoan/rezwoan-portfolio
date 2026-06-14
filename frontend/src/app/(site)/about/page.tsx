import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Briefcase, GraduationCap, ArrowRight } from 'lucide-react';
import { getSiteSettings, getSkills, getExperiences } from '@/lib/api';
import { Markdown } from '@/components/ui/markdown';
import { ExperienceTimeline } from '@/components/sections/experience';
import { Skills } from '@/components/sections/skills';
import { FadeUp } from '@/components/animations';
import { pageMetadata } from '@/lib/seo';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return pageMetadata({
    title: 'About',
    description: s?.bioShort || 'About Din Muhammad Rezwoan — Full Stack Developer from Dhaka, Bangladesh.',
    path: '/about',
  });
}

export default async function AboutPage() {
  const [settings, skills, experiences] = await Promise.all([
    getSiteSettings(),
    getSkills(),
    getExperiences(),
  ]);

  return (
    <>
      <div className="container-page section">
        <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
          <FadeUp>
            <p className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-accent">
              <span className="h-px w-6 bg-accent" /> About
            </p>
            <h1 className="text-display font-bold">{settings?.fullName || 'Din Muhammad Rezwoan'}</h1>
            <p className="mt-3 text-lg text-text-secondary">{settings?.roleLine}</p>
            <div className="mt-8">
              {settings?.bioLong ? (
                <Markdown content={settings.bioLong} />
              ) : (
                <p className="text-text-secondary">{settings?.bioShort}</p>
              )}
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="card lg:sticky lg:top-24 lg:self-start">
              <div className="space-y-4 p-6 text-sm">
                <Info icon={MapPin} label="Location" value={settings?.location || 'Dhaka, Bangladesh'} />
                <Info icon={Briefcase} label="Status" value={settings?.availableForWork ? 'Available for work' : 'Currently engaged'} />
                <Info icon={GraduationCap} label="Education" value="CSE @ AIUB" />
              </div>
              <div className="border-t border-border p-6">
                <Link href="/contact" className="btn-primary w-full">
                  Get in touch <ArrowRight size={16} />
                </Link>
                {settings?.resumeUrl && (
                  <a href={settings.resumeUrl} target="_blank" rel="noreferrer" className="btn-secondary mt-3 w-full">
                    Download résumé
                  </a>
                )}
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
      <Skills skills={skills} />
      <ExperienceTimeline items={experiences} />
    </>
  );
}

function Info({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-9 w-9 place-items-center rounded-md bg-accent/10 text-accent">
        <Icon size={16} />
      </span>
      <div>
        <p className="text-xs text-text-muted">{label}</p>
        <p className="font-medium text-text">{value}</p>
      </div>
    </div>
  );
}
