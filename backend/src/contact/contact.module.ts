import {
  Body, Controller, Delete, Get, Injectable, Ip, Param, Patch, Post, Req, UseGuards, Module,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { MailModule } from '../mail/mail.module';
import { MailService } from '../mail/mail.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class ContactDto {
  @IsString() @MaxLength(120) name: string;
  @IsEmail() email: string;
  @IsOptional() @IsString() @MaxLength(200) subject?: string;
  @IsString() @MinLength(5) @MaxLength(5000) message: string;
  // Honeypot — real users never fill this hidden field.
  @IsOptional() @IsString() website?: string;
}

@Injectable()
class ContactService {
  constructor(private readonly prisma: PrismaService, private readonly mail: MailService) {}

  async submit(dto: ContactDto, ip: string) {
    // Honeypot: silently accept + drop bots.
    if (dto.website && dto.website.trim() !== '') return { ok: true };

    const row = await this.prisma.contactSubmission.create({
      data: {
        name: dto.name,
        email: dto.email,
        subject: dto.subject || '',
        message: dto.message,
        ipAddress: ip || '',
      },
    });
    // Best-effort email; never fail the request if email errors (row is saved).
    await this.mail.sendContact({ name: dto.name, email: dto.email, subject: dto.subject, message: dto.message });
    return { ok: true, id: row.id };
  }

  list() { return this.prisma.contactSubmission.findMany({ orderBy: { createdAt: 'desc' } }); }
  markRead(id: string, read: boolean) { return this.prisma.contactSubmission.update({ where: { id }, data: { read } }); }
  async remove(id: string) { await this.prisma.contactSubmission.delete({ where: { id } }); return { ok: true }; }
}

@ApiTags('contact')
@Controller()
class ContactController {
  constructor(private readonly service: ContactService) {}

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('contact')
  submit(@Body() dto: ContactDto, @Ip() ip: string, @Req() req: Request) {
    const realIp = (req.headers['cf-connecting-ip'] as string) || ip;
    return this.service.submit(dto, realIp);
  }

  @UseGuards(JwtAuthGuard) @Get('admin/contact') list() { return this.service.list(); }
  @UseGuards(JwtAuthGuard) @Patch('admin/contact/:id') markRead(@Param('id') id: string, @Body('read') read: boolean) {
    return this.service.markRead(id, read !== false);
  }
  @UseGuards(JwtAuthGuard) @Delete('admin/contact/:id') remove(@Param('id') id: string) { return this.service.remove(id); }
}

@Module({ imports: [MailModule], controllers: [ContactController], providers: [ContactService] })
export class ContactModule {}
