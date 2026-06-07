import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional } from 'class-validator';

export class UpdateOrganizationDto {
  @ApiPropertyOptional()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  primary_color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  logo_url?: string;
}

export class UpdateOrganizationSettingsDto {
  @ApiPropertyOptional({
    description:
      'Free-form settings JSON. Recognized keys: messaging, branding, security, locale.',
    type: Object,
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>;
}

export class UpdateOrganizationBrandDto {
  @ApiPropertyOptional({
    description:
      'Free-form brand JSON. Recognized keys: primary_color, secondary_color, logo_url, favicon_url, tagline, custom_css.',
    type: Object,
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  brand?: Record<string, unknown>;
}

export class CreateOrganizationDto {
  @ApiProperty()
  name!: string;
}
