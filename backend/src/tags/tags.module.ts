import {
  Body, Controller, Delete, Get, Injectable, Param, Patch, Post, UseGuards, Module,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { slugify } from '../common/slug';

class TagDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsString() iconName?: string;
}

@Injectable()
class TagsService {
  constructor(private readonly prisma: PrismaService) {}
  list() { return this.prisma.tag.findMany({ orderBy: { name: 'asc' } }); }
  create(dto: TagDto) {
    const name = dto.name || 'Tag';
    return this.prisma.tag.create({ data: { name, slug: slugify(name), color: dto.color, iconName: dto.iconName } });
  }
  update(id: string, dto: TagDto) {
    return this.prisma.tag.update({
      where: { id },
      data: { ...dto, ...(dto.name ? { slug: slugify(dto.name) } : {}) },
    });
  }
  async remove(id: string) { await this.prisma.tag.delete({ where: { id } }); return { ok: true }; }
}

@ApiTags('tags')
@Controller()
class TagsController {
  constructor(private readonly service: TagsService) {}
  @Get('tags') publicList() { return this.service.list(); }
  @UseGuards(JwtAuthGuard) @Get('admin/tags') adminList() { return this.service.list(); }
  @UseGuards(JwtAuthGuard) @Post('admin/tags') create(@Body() dto: TagDto) { return this.service.create(dto); }
  @UseGuards(JwtAuthGuard) @Patch('admin/tags/:id') update(@Param('id') id: string, @Body() dto: TagDto) { return this.service.update(id, dto); }
  @UseGuards(JwtAuthGuard) @Delete('admin/tags/:id') remove(@Param('id') id: string) { return this.service.remove(id); }
}

@Module({ controllers: [TagsController], providers: [TagsService] })
export class TagsModule {}
