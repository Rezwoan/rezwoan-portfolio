import { Controller, Get, Header, Injectable, Module } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
class MetaService {
  constructor(private readonly prisma: PrismaService) {}

  async llmsTxt(): Promise<string> {
    const [s, projects, skills] = await Promise.all([
      this.prisma.siteSettings.findUnique({ where: { id: 'singleton' } }),
      this.prisma.project.findMany({ where: { published: true }, orderBy: [{ featured: 'desc' }, { order: 'asc' }] }),
      this.prisma.skill.findMany({ orderBy: { proficiency: 'desc' } }),
    ]);
    const out: string[] = [];
    out.push(`# ${s?.fullName || 'Din Muhammad Rezwoan'}`);
    out.push('');
    out.push(`> ${s?.roleLine || 'Full Stack Developer'} — ${s?.location || 'Dhaka, Bangladesh'}`);
    if (s?.bioShort) { out.push(''); out.push(s.bioShort); }
    out.push('');
    out.push(`- Website: https://rezwoan.me`);
    if (s?.githubUrl) out.push(`- GitHub: ${s.githubUrl}`);
    if (s?.linkedinUrl) out.push(`- LinkedIn: ${s.linkedinUrl}`);
    if (s?.email) out.push(`- Contact: ${s.email}`);
    out.push(`- Available for work: ${s?.availableForWork ? 'yes' : 'no'}`);
    if (skills.length) {
      out.push('');
      out.push('## Skills');
      out.push(skills.map((k) => k.name).join(', '));
    }
    if (projects.length) {
      out.push('');
      out.push('## Projects');
      projects.forEach((p) => {
        out.push(`- **${p.title}** — ${p.shortDescription}${p.liveUrl ? ` (${p.liveUrl})` : ''}`);
      });
    }
    out.push('');
    return out.join('\n');
  }
}

@ApiTags('meta')
@Controller()
class MetaController {
  constructor(private readonly service: MetaService) {}

  @Get('llms.txt')
  @Header('Content-Type', 'text/markdown; charset=utf-8')
  llms() {
    return this.service.llmsTxt();
  }
}

@Module({ controllers: [MetaController], providers: [MetaService] })
export class MetaModule {}
