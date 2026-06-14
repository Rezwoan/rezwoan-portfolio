import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health/health.controller';
import { SiteSettingsModule } from './site-settings/site-settings.module';
import { ProjectsModule } from './projects/projects.module';
import { ExperiencesModule } from './experiences/experiences.module';
import { SkillsModule } from './skills/skills.module';
import { TestimonialsModule } from './testimonials/testimonials.module';
import { BlogModule } from './blog/blog.module';
import { TagsModule } from './tags/tags.module';
import { ContactModule } from './contact/contact.module';
import { MailModule } from './mail/mail.module';
import { UploadsModule } from './uploads/uploads.module';
import { AiModule } from './ai/ai.module';
import { MetaModule } from './meta/meta.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    PrismaModule,
    AuthModule,
    SiteSettingsModule,
    ProjectsModule,
    ExperiencesModule,
    SkillsModule,
    TestimonialsModule,
    BlogModule,
    TagsModule,
    ContactModule,
    MailModule,
    UploadsModule,
    AiModule,
    MetaModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
