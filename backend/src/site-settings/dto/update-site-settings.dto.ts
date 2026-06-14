import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateSiteSettingsDto {
  @IsOptional() @IsString() fullName?: string;
  @IsOptional() @IsString() shortName?: string;
  @IsOptional() @IsString() tagline?: string;
  @IsOptional() @IsString() roleLine?: string;
  @IsOptional() @IsString() bioShort?: string;
  @IsOptional() @IsString() bioLong?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsBoolean() availableForWork?: boolean;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() githubUrl?: string;
  @IsOptional() @IsString() linkedinUrl?: string;
  @IsOptional() @IsString() twitterUrl?: string;
  @IsOptional() @IsString() fiverrUrl?: string;
  @IsOptional() @IsString() resumeUrl?: string;
  @IsOptional() @IsString() ogImageUrl?: string;
  @IsOptional() @IsString() faviconUrl?: string;
  @IsOptional() @IsString() metaTitleSuffix?: string;
  @IsOptional() @IsString() googleAnalyticsId?: string;
}
