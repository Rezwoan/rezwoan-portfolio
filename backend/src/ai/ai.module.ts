import {
  Body, Controller, Post, Req, Res, UseGuards, Module,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';
import { Response } from 'express';
import { GeminiService, ChatTurn } from './gemini.service';
import { GithubImportService } from './github-import.service';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class ImportDto {
  @IsString() repoUrl: string;
}
class ChatDto {
  @IsOptional() @IsString() sessionId?: string;
  @IsString() @MaxLength(2000) message: string;
  @IsOptional() @IsArray() history?: ChatTurn[];
}

@ApiTags('ai')
@Controller()
class AiController {
  constructor(
    private readonly importer: GithubImportService,
    private readonly chat: ChatService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('admin/import/github')
  importGithub(@Body() dto: ImportDto) {
    return this.importer.importFromUrl(dto.repoUrl);
  }

  // Public, rate-limited, streamed (Server-Sent-Events style chunks).
  @Throttle({ default: { limit: 20, ttl: 10 * 60_000 } })
  @Post('chat')
  async chatStream(@Body() dto: ChatDto, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('X-Accel-Buffering', 'no');
    const history = Array.isArray(dto.history) ? dto.history : [];
    try {
      for await (const chunk of this.chat.stream(dto.message, history)) {
        res.write(chunk);
      }
    } finally {
      res.end();
    }
  }
}

@Module({
  controllers: [AiController],
  providers: [GeminiService, GithubImportService, ChatService],
  exports: [GeminiService],
})
export class AiModule {}
