import {
  Body, Controller, Delete, Get, Injectable, NotFoundException, Param, Patch, Post, Query, UseGuards, Module,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { readingTimeMinutes, slugify } from '../common/slug';

class BlogDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() excerpt?: string;
  @IsOptional() @IsString() body?: string;
  @IsOptional() @IsString() coverImageUrl?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsBoolean() published?: boolean;
  @IsOptional() @IsString() seoTitle?: string;
  @IsOptional() @IsString() seoDescription?: string;
}

@Injectable()
class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublic(page = 1, limit = 12) {
    const skip = (Math.max(1, page) - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where: { published: true },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.blogPost.count({ where: { published: true } }),
    ]);
    return { items: items.map(this.parseTags), total, page, limit };
  }

  async bySlugPublic(slug: string) {
    const p = await this.prisma.blogPost.findFirst({ where: { slug, published: true } });
    if (!p) throw new NotFoundException('Post not found');
    return this.parseTags(p);
  }

  async findAll() {
    const items = await this.prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } });
    return items.map(this.parseTags);
  }
  async findOne(id: string) {
    const p = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('Post not found');
    return this.parseTags(p);
  }

  async create(dto: BlogDto) {
    const slug = await this.uniqueSlug(dto.slug || dto.title || 'post');
    return this.prisma.blogPost.create({
      data: {
        title: dto.title || 'Untitled',
        slug,
        excerpt: dto.excerpt || '',
        body: dto.body || '',
        coverImageUrl: dto.coverImageUrl || '',
        tags: JSON.stringify(dto.tags || []),
        readingTime: readingTimeMinutes(dto.body || ''),
        published: dto.published || false,
        publishedAt: dto.published ? new Date() : null,
        seoTitle: dto.seoTitle || '',
        seoDescription: dto.seoDescription || '',
      },
    }).then(this.parseTags);
  }

  async update(id: string, dto: BlogDto) {
    const current = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Post not found');
    const willPublish = dto.published === true && !current.published;
    return this.prisma.blogPost.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.slug ? { slug: slugify(dto.slug) } : {}),
        ...(dto.excerpt !== undefined ? { excerpt: dto.excerpt } : {}),
        ...(dto.body !== undefined ? { body: dto.body, readingTime: readingTimeMinutes(dto.body) } : {}),
        ...(dto.coverImageUrl !== undefined ? { coverImageUrl: dto.coverImageUrl } : {}),
        ...(dto.tags !== undefined ? { tags: JSON.stringify(dto.tags) } : {}),
        ...(dto.seoTitle !== undefined ? { seoTitle: dto.seoTitle } : {}),
        ...(dto.seoDescription !== undefined ? { seoDescription: dto.seoDescription } : {}),
        ...(dto.published !== undefined ? { published: dto.published } : {}),
        ...(willPublish ? { publishedAt: new Date() } : {}),
      },
    }).then(this.parseTags);
  }

  async remove(id: string) { await this.prisma.blogPost.delete({ where: { id } }); return { ok: true }; }

  private parseTags = (p: any) => ({ ...p, tags: safeParse(p.tags) });

  private async uniqueSlug(base: string): Promise<string> {
    const root = slugify(base);
    let slug = root;
    let n = 1;
    // eslint-disable-next-line no-await-in-loop
    while (await this.prisma.blogPost.findUnique({ where: { slug } })) slug = `${root}-${++n}`;
    return slug;
  }
}

function safeParse(s: string): string[] {
  try { const v = JSON.parse(s || '[]'); return Array.isArray(v) ? v : []; } catch { return []; }
}

@ApiTags('blog')
@Controller()
class BlogController {
  constructor(private readonly service: BlogService) {}
  @Get('blog') list(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.listPublic(Number(page) || 1, Number(limit) || 12);
  }
  @Get('blog/:slug') bySlug(@Param('slug') slug: string) { return this.service.bySlugPublic(slug); }
  @UseGuards(JwtAuthGuard) @Get('admin/blog') adminList() { return this.service.findAll(); }
  @UseGuards(JwtAuthGuard) @Get('admin/blog/:id') adminOne(@Param('id') id: string) { return this.service.findOne(id); }
  @UseGuards(JwtAuthGuard) @Post('admin/blog') create(@Body() dto: BlogDto) { return this.service.create(dto); }
  @UseGuards(JwtAuthGuard) @Patch('admin/blog/:id') update(@Param('id') id: string, @Body() dto: BlogDto) { return this.service.update(id, dto); }
  @UseGuards(JwtAuthGuard) @Delete('admin/blog/:id') remove(@Param('id') id: string) { return this.service.remove(id); }
}

@Module({ controllers: [BlogController], providers: [BlogService] })
export class BlogModule {}
