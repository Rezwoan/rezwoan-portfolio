import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { slugify } from '../src/common/slug';

const prisma = new PrismaClient();

async function main() {
  // 1. Admin user
  const email = (process.env.ADMIN_EMAIL || 'frezwoan@gmail.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'admin12345';
  const hash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, password: hash, name: 'Din Muhammad Rezwoan' },
  });
  console.log(`✓ admin user (${email})`);

  // 2. Site settings singleton
  await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      fullName: 'Din Muhammad Rezwoan',
      shortName: 'Rezwoan',
      roleLine: 'Full Stack Developer',
      tagline: 'I build fast, polished web apps that turn ideas into products.',
      bioShort:
        'Full Stack Developer and CSE student at AIUB, building modern web apps with Next.js, NestJS and TypeScript. Available for freelance work worldwide.',
      bioLong:
        '## Hi, I\'m Rezwoan\n\nI\'m a full stack developer from Dhaka, Bangladesh, focused on shipping fast, accessible, well-designed web applications. I work across the stack — Next.js on the front, NestJS/Node on the back — and I self-host my projects on a Raspberry Pi behind Cloudflare.\n\nI freelance on Fiverr and take on SaaS MVPs, dashboards, and marketing sites. If you have an idea, let\'s build it.',
      location: 'Dhaka, Bangladesh',
      availableForWork: true,
      email: 'frezwoan@gmail.com',
      githubUrl: 'https://github.com/Rezwoan',
      linkedinUrl: 'https://linkedin.com/in/din-muhammad-rezwoan-b4b87020a',
      twitterUrl: 'https://twitter.com/XRezwoan',
      fiverrUrl: 'https://www.fiverr.com/rezwoanfaisal',
      metaTitleSuffix: ' — Rezwoan',
    },
  });
  console.log('✓ site settings');

  // 3. Tags
  const tags: Array<[string, string]> = [
    ['Next.js', '#000000'],
    ['React', '#61DAFB'],
    ['TypeScript', '#3178C6'],
    ['NestJS', '#E0234E'],
    ['Node.js', '#5FA04E'],
    ['Prisma', '#2D3748'],
    ['Tailwind CSS', '#38BDF8'],
    ['PostgreSQL', '#4169E1'],
    ['SQLite', '#003B57'],
    ['Python', '#3776AB'],
    ['Docker', '#2496ED'],
    ['Framer Motion', '#7C6CFF'],
  ];
  for (const [name, color] of tags) {
    await prisma.tag.upsert({
      where: { slug: slugify(name) },
      update: { color },
      create: { name, slug: slugify(name), color },
    });
  }
  console.log(`✓ ${tags.length} tags`);

  // 4. Skills
  const skills: Array<{ name: string; category: string; proficiency: number; context: string; hero?: boolean; order: number }> = [
    { name: 'Next.js', category: 'frontend', proficiency: 5, context: 'daily', hero: true, order: 1 },
    { name: 'React', category: 'frontend', proficiency: 5, context: '3y, daily', hero: true, order: 2 },
    { name: 'TypeScript', category: 'frontend', proficiency: 5, context: 'daily', hero: true, order: 3 },
    { name: 'Tailwind CSS', category: 'frontend', proficiency: 5, context: 'daily', hero: true, order: 4 },
    { name: 'NestJS', category: 'backend', proficiency: 4, context: 'production', hero: true, order: 5 },
    { name: 'Node.js', category: 'backend', proficiency: 5, context: 'daily', hero: true, order: 6 },
    { name: 'Prisma', category: 'database', proficiency: 4, context: 'production', order: 7 },
    { name: 'PostgreSQL', category: 'database', proficiency: 4, context: 'production', order: 8 },
    { name: 'Python', category: 'backend', proficiency: 4, context: '2y', order: 9 },
    { name: 'Docker', category: 'devops', proficiency: 3, context: 'self-hosting', order: 10 },
  ];
  for (const s of skills) {
    const existing = await prisma.skill.findFirst({ where: { name: s.name } });
    if (!existing) {
      await prisma.skill.create({
        data: {
          name: s.name,
          category: s.category,
          proficiency: s.proficiency,
          context: s.context,
          showOnHero: s.hero || false,
          order: s.order,
        },
      });
    }
  }
  console.log(`✓ ${skills.length} skills`);

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
