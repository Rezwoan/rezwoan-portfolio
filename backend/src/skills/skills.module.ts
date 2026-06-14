import {
  Body, Controller, Delete, Get, Injectable, Param, Patch, Post, Query, UseGuards, Module,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class SkillDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsInt() proficiency?: number;
  @IsOptional() @IsString() iconName?: string;
  @IsOptional() @IsString() context?: string;
  @IsOptional() @IsInt() order?: number;
  @IsOptional() @IsBoolean() showOnHero?: boolean;
}

@Injectable()
class SkillsService {
  constructor(private readonly prisma: PrismaService) {}
  findPublic(hero?: boolean) {
    return this.prisma.skill.findMany({
      where: hero ? { showOnHero: true } : {},
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
    });
  }
  findAll() {
    return this.prisma.skill.findMany({ orderBy: [{ category: 'asc' }, { order: 'asc' }] });
  }
  create(dto: SkillDto) {
    return this.prisma.skill.create({ data: { name: dto.name || 'Skill', ...dto } });
  }
  update(id: string, dto: SkillDto) {
    return this.prisma.skill.update({ where: { id }, data: dto });
  }
  async remove(id: string) {
    await this.prisma.skill.delete({ where: { id } });
    return { ok: true };
  }
}

@ApiTags('skills')
@Controller()
class SkillsController {
  constructor(private readonly service: SkillsService) {}
  @Get('skills') list(@Query('hero') hero?: string) {
    return this.service.findPublic(hero === 'true');
  }
  @UseGuards(JwtAuthGuard) @Get('admin/skills') adminList() { return this.service.findAll(); }
  @UseGuards(JwtAuthGuard) @Post('admin/skills') create(@Body() dto: SkillDto) { return this.service.create(dto); }
  @UseGuards(JwtAuthGuard) @Patch('admin/skills/:id') update(@Param('id') id: string, @Body() dto: SkillDto) { return this.service.update(id, dto); }
  @UseGuards(JwtAuthGuard) @Delete('admin/skills/:id') remove(@Param('id') id: string) { return this.service.remove(id); }
}

@Module({ controllers: [SkillsController], providers: [SkillsService] })
export class SkillsModule {}
