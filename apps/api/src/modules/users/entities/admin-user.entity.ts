import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class AdminUserEntity {
  @Expose() @ApiProperty() id!: string;
  @Expose() @ApiProperty() name!: string;
  @Expose() @ApiProperty() phone!: string;
  @Expose()
  @ApiPropertyOptional({ nullable: true })
  email?: string;
  @Expose() @ApiProperty() role!: string;
  @Expose() @ApiProperty() organization_id!: string;
  @Expose()
  @ApiPropertyOptional({ nullable: true })
  team_id?: string;
  @Expose()
  @ApiPropertyOptional({ nullable: true })
  branch_id?: string;
  @Expose() @ApiProperty() credits!: number;
  @Expose() @ApiProperty() invites_count!: number;
  @Expose() @ApiProperty() suspended!: boolean;
  @Expose() @ApiProperty() created_at!: string;
}
