import { getSiteSettings, getProjects, getSkills, getExperiences, getTestimonials } from "@/lib/api";
import HeroSection from "@/components/sections/HeroSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import SkillsSection from "@/components/sections/SkillsSection";
import ExperienceSection from "@/components/sections/ExperienceSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import ContactCTA from "@/components/sections/ContactCTA";

export const revalidate = 60;

async function getData() {
  const [settings, projects, skills, experiences, testimonials] = await Promise.allSettled([
    getSiteSettings(),
    getProjects({ featured: true }),
    getSkills(),
    getExperiences(),
    getTestimonials(),
  ]);

  return {
    settings:     settings.status === "fulfilled" ? settings.value : null,
    projects:     projects.status === "fulfilled" ? projects.value : [],
    skills:       skills.status === "fulfilled" ? skills.value : [],
    experiences:  experiences.status === "fulfilled" ? experiences.value : [],
    testimonials: testimonials.status === "fulfilled" ? testimonials.value : [],
  };
}

export default async function HomePage() {
  const { settings, projects, skills, experiences, testimonials } = await getData();

  const heroSkills = skills.filter((s) => s.show_on_hero);

  if (!settings) {
    return (
      <div className="container-site section">
        <div className="p-4 rounded-lg border border-error/30 bg-error/5 text-error text-small max-w-lg">
          Backend not reachable. Make sure Django is running at{" "}
          <code className="font-mono">localhost:8000</code> and run{" "}
          <code className="font-mono">python manage.py migrate</code>.
        </div>
      </div>
    );
  }

  return (
    <>
      <HeroSection settings={settings} heroSkills={heroSkills} />
      <ProjectsSection projects={projects} />
      <SkillsSection skills={skills} />
      <ExperienceSection experiences={experiences} />
      <TestimonialsSection testimonials={testimonials} />
      <ContactCTA settings={settings} />
    </>
  );
}
