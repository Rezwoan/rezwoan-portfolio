import {
  Body, Controller, Delete, Get, Injectable, Param, Patch, Post, Query, UseGuards, Module,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class TestimonialDto {
  @IsOptional() @IsString() clientName?: string;
  @IsOptional() @IsString() clientTitle?: string;
  @IsOptional() @IsString() clientCompany?: string;
  @IsOptional() @IsString() avatarUrl?: string;
  @IsOptional() @IsString() quote?: string;
  @IsOptional() @IsInt() rating?: number;
  @IsOptional() @IsString() source?: string;
  @IsOptional() @IsString() sourceUrl?: string;
  @IsOptional() @IsBoolean() featured?: boolean;
  @IsOptional() @IsInt() order?: number;
}

@Injectable()
class TestimonialsService {
  constructor(private readonly prisma: PrismaService) {}
  findPublic(featured?: boolean) {
    return this.prisma.testimonial.findMany({
      where: featured ? { featured: true } : {},
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  }
  findAll() { return this.prisma.testimonial.findMany({ orderBy: [{ order: 'asc' }] }); }
  create(dto: TestimonialDto) {
    return this.prisma.testimonial.create({
      data: { clientName: dto.clientName || 'Client', quote: dto.quote || '', ...dto },
    });
  }
  update(id: string, dto: TestimonialDto) { return this.prisma.testimonial.update({ where: { id }, data: dto }); }
  async remove(id: string) { await this.prisma.testimonial.delete({ where: { id } }); return { ok: true }; }
}

@ApiTags('testimonials')
@Controller()
class TestimonialsController {
  constructor(private readonly service: TestimonialsService) {}
  @Get('testimonials') list(@Query('featured') featured?: string) {
    return this.service.findPublic(featured === 'true');
  }
  @UseGuards(JwtAuthGuard) @Get('admin/testimonials') adminList() { return this.service.findAll(); }
  @UseGuards(JwtAuthGuard) @Post('admin/testimonials') create(@Body() dto: TestimonialDto) { return this.service.create(dto); }
  @UseGuards(JwtAuthGuard) @Patch('admin/testimonials/:id') update(@Param('id') id: string, @Body() dto: TestimonialDto) { return this.service.update(id, dto); }
  @UseGuards(JwtAuthGuard) @Delete('admin/testimonials/:id') remove(@Param('id') id: string) { return this.service.remove(id); }
}

@Module({ controllers: [TestimonialsController], providers: [TestimonialsService] })
export class TestimonialsModule {}
