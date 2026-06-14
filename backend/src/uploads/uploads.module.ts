import {
  Controller, Delete, Get, Injectable, Param, Post, UploadedFile, UseGuards, UseInterceptors, BadRequestException, Module,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import { v4 as uuid } from 'uuid';
import imageSize from 'image-size';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const UPLOAD_DIR = join(__dirname, '..', '..', 'uploads');
const ALLOWED = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.pdf', '.ico'];

if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });

@Injectable()
class UploadsService {
  list() {
    if (!existsSync(UPLOAD_DIR)) return [];
    return readdirSync(UPLOAD_DIR)
      .filter((f) => f !== '.gitkeep')
      .map((f) => ({ name: f, url: `/uploads/${f}` }));
  }
  remove(name: string) {
    const safe = name.replace(/[^a-zA-Z0-9._-]/g, '');
    const p = join(UPLOAD_DIR, safe);
    if (existsSync(p)) unlinkSync(p);
    return { ok: true };
  }
}

@ApiTags('uploads')
@Controller('admin/uploads')
@UseGuards(JwtAuthGuard)
class UploadsController {
  constructor(private readonly service: UploadsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOAD_DIR,
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname).toLowerCase();
          cb(null, `${Date.now()}-${uuid().slice(0, 8)}${ext}`);
        },
      }),
      limits: { fileSize: 15 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        if (!ALLOWED.includes(ext)) return cb(new BadRequestException('Unsupported file type'), false);
        cb(null, true);
      },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file');
    let width: number | undefined;
    let height: number | undefined;
    try {
      const dim = imageSize(join(UPLOAD_DIR, file.filename));
      width = dim.width;
      height = dim.height;
    } catch {
      // non-image (e.g. pdf) — fine
    }
    return { url: `/uploads/${file.filename}`, name: file.filename, width, height };
  }

  @Get() list() { return this.service.list(); }
  @Delete(':name') remove(@Param('name') name: string) { return this.service.remove(name); }
}

@Module({ controllers: [UploadsController], providers: [UploadsService] })
export class UploadsModule {}
