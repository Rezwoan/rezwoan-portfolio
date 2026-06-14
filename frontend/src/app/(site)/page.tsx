import {
  getSiteSettings,
  getProjects,
  getSkills,
  getExperiences,
  getTestimonials,
} from '@/lib/api';
import { Hero } from '@/components/sections/hero';
import { FeaturedProjects } from '@/components/sections/featured-projects';
import { Skills } from '@/components/sections/skills';
import { ExperienceTimeline } from '@/components/sections/experience';
import { Testimonials } from '@/components/sections/testimonials';
import { ContactCTA } from '@/components/sections/contact-cta';
import { personJsonLd } from '@/lib/seo';

export const revalidate = 60;

export default async function HomePage() {
  const [settings, featured, allProjects, heroSkills, skills, experiences, testimonials] = await Promise.all([
    getSiteSettings(),
    getProjects('?featured=true'),
    getProjects(),
    getSkills(true),
    getSkills(),
    getExperiences(),
    getTestimonials(true),
  ]);

  const projects = featured.length ? featured : allProjects;
  const jsonLd = personJsonLd({
    fullName: settings?.fullName || 'Din Muhammad Rezwoan',
    roleLine: settings?.roleLine || 'Full Stack Developer',
    githubUrl: settings?.githubUrl || '',
    linkedinUrl: settings?.linkedinUrl || '',
    twitterUrl: settings?.twitterUrl || '',
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero settings={settings} heroSkills={heroSkills} />
      <FeaturedProjects projects={projects} />
      <Skills skills={skills} />
      <ExperienceTimeline items={experiences} />
      <Testimonials items={testimonials} />
      <ContactCTA settings={settings} />
    </>
  );
}
