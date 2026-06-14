import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('projects')
@Controller()
export class ProjectsController {
  constructor(private readonly service: ProjectsService) {}

  // ---------- Public ----------
  @Get('projects')
  list(@Query('featured') featured?: string, @Query('category') category?: string) {
    return this.service.findPublished({
      featured: featured === undefined ? undefined : featured === 'true',
      category,
    });
  }

  @Get('projects/:slug')
  bySlug(@Param('slug') slug: string) {
    return this.service.findOnePublished(slug);
  }

  // ---------- Admin ----------
  @UseGuards(JwtAuthGuard)
  @Get('admin/projects')
  adminList() {
    return this.service.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/projects/:id')
  adminOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/projects')
  create(@Body() dto: CreateProjectDto) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/projects/:id')
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/projects/:id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
