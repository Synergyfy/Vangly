import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional } from 'class-validator';

export class UpdateLocationBrandDto {
  @ApiPropertyOptional({
    description:
      'Free-form brand JSON. Recognized keys: primary_color, secondary_color, logo_url, tagline.',
    type: Object,
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  brand?: Record<string, unknown>;
}
