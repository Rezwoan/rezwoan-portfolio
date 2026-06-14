import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateProjectDto {
  @IsString() @MaxLength(200) title: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() shortDescription?: string;
  @IsOptional() @IsString() body?: string;
  @IsOptional() @IsString() coverImageUrl?: string;
  @IsOptional() @IsString() liveUrl?: string;
  @IsOptional() @IsString() githubUrl?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsBoolean() featured?: boolean;
  @IsOptional() @IsBoolean() published?: boolean;
  @IsOptional() @IsInt() order?: number;
  @IsOptional() @IsInt() repoStars?: number;
  @IsOptional() @IsInt() repoForks?: number;
  @IsOptional() @IsString() repoLanguage?: string;
  @IsOptional() @IsString() importedFrom?: string;
  @IsOptional() @IsString() seoTitle?: string;
  @IsOptional() @IsString() seoDescription?: string;
  @IsOptional() @IsString() seoOgImageUrl?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) tagNames?: string[];
}

export class UpdateProjectDto extends CreateProjectDto {
  @IsOptional() @IsString() @MaxLength(200) title: string;
}
