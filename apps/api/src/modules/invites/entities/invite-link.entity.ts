import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class InviteLinkEntity {
  @Expose() @ApiProperty() id!: string;
  @Expose() @ApiProperty() organization_id!: string;
  @Expose()
  @ApiPropertyOptional({ nullable: true })
  location_id?: string;
  @Expose()
  @ApiPropertyOptional({ nullable: true })
  team_id?: string;
  @Expose() @ApiProperty() owner_user_id!: string;
  @Expose()
  @ApiPropertyOptional({ nullable: true })
  form_id?: string;
  @Expose() @ApiProperty() code!: string;
  @Expose()
  @ApiPropertyOptional({ nullable: true })
  expires_at?: string;
  @Expose() @ApiProperty() max_uses!: number;
  @Expose() @ApiProperty() uses!: number;
  @Expose()
  @ApiProperty({ enum: ['active', 'revoked'] })
  status!: string;
  @Expose() @ApiProperty() url!: string;
  @Expose() @ApiProperty() qr_payload!: string;
  @Expose() @ApiProperty() created_at!: string;
  @Expose() @ApiProperty() updated_at!: string;
}
