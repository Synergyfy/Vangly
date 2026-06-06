import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import type {
  FormFieldDto,
  FormDistributionDto,
} from '../../forms/dto/form.dto';

@Exclude()
export class PublicFormEntity {
  @Expose() @ApiProperty() public_id!: string;
  @Expose() @ApiProperty() title!: string;
  @Expose() @ApiPropertyOptional({ nullable: true }) description?: string;
  @Expose() @ApiProperty() organization_name!: string;
  @Expose() @ApiProperty() location_name!: string;
  @Expose() @ApiPropertyOptional({ nullable: true }) logo_url?: string;
  @Expose() @ApiPropertyOptional({ nullable: true }) primary_color?: string;
  @Expose() @ApiProperty() fields!: FormFieldDto[];
  @Expose() @ApiProperty() distribution!: FormDistributionDto;
  @Expose() @ApiProperty() schema_version!: number;
}

@Exclude()
export class PublicSubmitResultEntity {
  @Expose() @ApiProperty() response_id!: string;
  @Expose() @ApiProperty() submitted_at!: string;
  @Expose() @ApiPropertyOptional({ nullable: true }) message?: string;
}

@Exclude()
export class PublicScanEntity {
  @Expose() @ApiProperty() scan_token!: string;
  @Expose() @ApiProperty() public_id!: string;
  @Expose() @ApiProperty() form_id!: string;
}
