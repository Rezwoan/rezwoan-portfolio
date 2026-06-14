import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SiteSettingsService } from './site-settings.service';
import { UpdateSiteSettingsDto } from './dto/update-site-settings.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('site-settings')
@Controller()
export class SiteSettingsController {
  constructor(private readonly service: SiteSettingsService) {}

  // Public
  @Get('site-settings')
  getPublic() {
    return this.service.getPublic();
  }

  // Admin
  @UseGuards(JwtAuthGuard)
  @Get('admin/site-settings')
  getAdmin() {
    return this.service.get();
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/site-settings')
  update(@Body() dto: UpdateSiteSettingsDto) {
    return this.service.update(dto);
  }
}
