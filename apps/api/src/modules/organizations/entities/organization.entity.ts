import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class OrganizationEntity {
  @Expose() @ApiProperty() id!: string;
  @Expose() @ApiProperty() name!: string;
  @Expose() @ApiProperty() subdomain!: string;
  @Expose()
  @ApiPropertyOptional({ nullable: true })
  primary_color?: string;
  @Expose()
  @ApiPropertyOptional({ nullable: true })
  logo_url?: string;
  @Expose()
  @ApiPropertyOptional({ nullable: true })
  settings?: Record<string, unknown>;
  @Expose()
  @ApiPropertyOptional({ nullable: true })
  brand?: Record<string, unknown>;
  @Expose() @ApiProperty() created_at!: string;
}

@Exclude()
export class OrganizationSettingsEntity {
  @Expose()
  @ApiPropertyOptional({
    description: 'Free-form settings object',
    type: Object,
    additionalProperties: true,
  })
  @Type(() => Object)
  settings?: Record<string, unknown>;
}

@Exclude()
export class OrganizationBrandEntity {
  @Expose()
  @ApiPropertyOptional({
    description: 'Free-form brand object',
    type: Object,
    additionalProperties: true,
  })
  @Type(() => Object)
  brand?: Record<string, unknown>;
}
