import {
  Body, Controller, Delete, Get, Injectable, Param, Patch, Post, UseGuards, Module,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { slugify } from '../common/slug';

class ExperienceDto {
  @IsOptional() @IsString() company?: string;
  @IsOptional() @IsString() role?: string;
  @IsOptional() @IsString() employmentType?: string;
  @IsOptional() @IsString() companyUrl?: string;
  @IsOptional() @IsString() companyLogoUrl?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() startDate?: string;
  @IsOptional() @IsString() endDate?: string;
  @IsOptional() @IsBoolean() isCurrent?: boolean;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsInt() order?: number;
  @IsOptional() @IsArray() @IsString({ each: true }) tagNames?: string[];
}

@Injectable()
class ExperiencesService {
  constructor(private readonly prisma: PrismaService) {}
  private tagConnect(tagNames?: string[]) {
    if (!tagNames?.length) return {};
    const unique = Array.from(new Set(tagNames.map((t) => t.trim()).filter(Boolean)));
    return {
      connectOrCreate: unique.map((name) => ({
        where: { slug: slugify(name) },
        create: { name, slug: slugify(name) },
      })),
    };
  }
  private toData(dto: ExperienceDto) {
    const { tagNames, startDate, endDate, ...rest } = dto;
    return {
      data: {
        ...rest,
        ...(startDate ? { startDate: new Date(startDate) } : {}),
        ...(endDate ? { endDate: new Date(endDate) } : endDate === '' ? { endDate: null } : {}),
      },
      tagNames,
    };
  }
  list() {
    return this.prisma.experience.findMany({
      orderBy: [{ order: 'asc' }, { startDate: 'desc' }],
      include: { tags: { select: { name: true, color: true } } },
    });
  }
  async create(dto: ExperienceDto) {
    const { data, tagNames } = this.toData(dto);
    return this.prisma.experience.create({
      data: {
        company: dto.company || 'Company',
        role: dto.role || 'Role',
        startDate: data.startDate || new Date(),
        ...data,
        tags: this.tagConnect(tagNames),
      },
      include: { tags: true },
    });
  }
  async update(id: string, dto: ExperienceDto) {
    const { data, tagNames } = this.toData(dto);
    return this.prisma.experience.update({
      where: { id },
      data: { ...data, ...(tagNames ? { tags: { set: [], ...this.tagConnect(tagNames) } } : {}) },
      include: { tags: true },
    });
  }
  async remove(id: string) { await this.prisma.experience.delete({ where: { id } }); return { ok: true }; }
}

@ApiTags('experiences')
@Controller()
class ExperiencesController {
  constructor(private readonly service: ExperiencesService) {}
  @Get('experiences') publicList() { return this.service.list(); }
  @UseGuards(JwtAuthGuard) @Get('admin/experiences') adminList() { return this.service.list(); }
  @UseGuards(JwtAuthGuard) @Post('admin/experiences') create(@Body() dto: ExperienceDto) { return this.service.create(dto); }
  @UseGuards(JwtAuthGuard) @Patch('admin/experiences/:id') update(@Param('id') id: string, @Body() dto: ExperienceDto) { return this.service.update(id, dto); }
  @UseGuards(JwtAuthGuard) @Delete('admin/experiences/:id') remove(@Param('id') id: string) { return this.service.remove(id); }
}

@Module({ controllers: [ExperiencesController], providers: [ExperiencesService] })
export class ExperiencesModule {}
