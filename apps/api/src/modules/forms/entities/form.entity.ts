import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import type { FormFieldDto, FormDistributionDto } from '../dto/form.dto';

@Exclude()
export class FormEntity {
  @Expose() @ApiProperty() id!: string;
  @Expose() @ApiProperty() public_id!: string;
  @Expose() @ApiProperty() title!: string;
  @Expose() @ApiPropertyOptional({ nullable: true }) description?: string;
  @Expose()
  @ApiProperty({ enum: ['draft', 'published', 'archived'] })
  status!: 'draft' | 'published' | 'archived';
  @Expose()
  @ApiProperty({ type: [Object], additionalProperties: true })
  fields!: FormFieldDto[];
  @Expose()
  @ApiProperty({ type: () => Object, additionalProperties: true })
  distribution!: FormDistributionDto;
  @Expose() @ApiProperty() schema_version!: number;
  @Expose() @ApiProperty() analytics_scans!: number;
  @Expose() @ApiProperty() analytics_submissions!: number;
  @Expose() @ApiProperty() team_id!: string;
  @Expose() @ApiProperty() location_id!: string;
  @Expose() @ApiProperty() created_at!: string;
  @Expose() @ApiPropertyOptional({ nullable: true }) published_at?: string;
  @Expose() @ApiPropertyOptional({ nullable: true }) updated_at?: string;
  @Expose() @ApiProperty() public_url!: string;
  @Expose() @ApiProperty() qr_payload!: string;
}

@Exclude()
export class FormResponseEntity {
  @Expose() @ApiProperty() id!: string;
  @Expose() @ApiProperty() form_id!: string;
  @Expose() @ApiProperty() form_schema_version!: number;
  @Expose() @ApiProperty() submitted_at!: string;
  @Expose() @ApiProperty() submitted_by?: string;
  @Expose()
  @ApiProperty({ type: () => Object, additionalProperties: true })
  answers!: Record<string, unknown>;
}

@Exclude()
export class FormVersionEntity {
  @Expose() @ApiProperty() id!: string;
  @Expose() @ApiProperty() form_id!: string;
  @Expose() @ApiProperty() schema_version!: number;
  @Expose() @ApiProperty() archived_at!: string;
}
