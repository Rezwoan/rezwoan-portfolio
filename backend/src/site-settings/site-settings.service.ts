import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

const ID = 'singleton';

@Injectable()
export class SiteSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Always returns the singleton row, creating it with defaults if missing. */
  async get() {
    const existing = await this.prisma.siteSettings.findUnique({ where: { id: ID } });
    if (existing) return existing;
    return this.prisma.siteSettings.create({ data: { id: ID } });
  }

  /** Public view — strips nothing sensitive (settings are all public-ish), but keep a seam. */
  async getPublic() {
    return this.get();
  }

  async update(data: Prisma.SiteSettingsUpdateInput) {
    await this.get(); // ensure exists
    return this.prisma.siteSettings.update({ where: { id: ID }, data });
  }
}
