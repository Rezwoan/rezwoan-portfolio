import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/slug';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------- Public ----------
  findPublished(opts: { featured?: boolean; category?: string }) {
    return this.prisma.project.findMany({
      where: {
        published: true,
        ...(opts.featured !== undefined ? { featured: opts.featured } : {}),
        ...(opts.category ? { category: opts.category } : {}),
      },
      orderBy: [{ featured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
      include: { tags: { select: { name: true, color: true, iconName: true } } },
    });
  }

  async findOnePublished(slug: string) {
    const p = await this.prisma.project.findFirst({
      where: { slug, published: true },
      include: { tags: { select: { name: true, color: true, iconName: true } } },
    });
    if (!p) throw new NotFoundException('Project not found');
    return p;
  }

  // ---------- Admin ----------
  findAll() {
    return this.prisma.project.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      include: { tags: true },
    });
  }

  async findOne(id: string) {
    const p = await this.prisma.project.findUnique({ where: { id }, include: { tags: true } });
    if (!p) throw new NotFoundException('Project not found');
    return p;
  }

  async create(dto: CreateProjectDto) {
    const slug = await this.uniqueSlug(dto.slug || dto.title);
    const { tagNames, ...data } = dto;
    return this.prisma.project.create({
      data: { ...data, slug, tags: this.tagConnect(tagNames) },
      include: { tags: true },
    });
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.findOne(id);
    const { tagNames, slug, ...data } = dto;
    return this.prisma.project.update({
      where: { id },
      data: {
        ...data,
        ...(slug ? { slug: slugify(slug) } : {}),
        ...(tagNames ? { tags: { set: [], ...this.tagConnect(tagNames) } } : {}),
      },
      include: { tags: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.project.delete({ where: { id } });
    return { ok: true };
  }

  // ---------- helpers ----------
  private tagConnect(tagNames?: string[]) {
    if (!tagNames || tagNames.length === 0) return {};
    const unique = Array.from(new Set(tagNames.map((t) => t.trim()).filter(Boolean)));
    return {
      connectOrCreate: unique.map((name) => ({
        where: { slug: slugify(name) },
        create: { name, slug: slugify(name) },
      })),
    };
  }

  private async uniqueSlug(base: string): Promise<string> {
    const root = slugify(base);
    let slug = root;
    let n = 1;
    // eslint-disable-next-line no-await-in-loop
    while (await this.prisma.project.findUnique({ where: { slug } })) {
      slug = `${root}-${++n}`;
    }
    return slug;
  }
}
