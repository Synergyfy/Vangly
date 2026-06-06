import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class TeamEntity {
  @Expose() @ApiProperty() id!: string;
  @Expose() @ApiProperty() organization_id!: string;
  @Expose() @ApiProperty() location_id!: string;
  @Expose() @ApiProperty() name!: string;
  @Expose()
  @ApiProperty({ required: false, nullable: true })
  description?: string;
  @Expose()
  @ApiProperty({ enum: ['admin', 'operational', 'outreach', 'custom'] })
  kind!: 'admin' | 'operational' | 'outreach' | 'custom';
  @Expose() @ApiProperty() is_public_joinable!: boolean;
  @Expose() @ApiProperty() allow_member_pin!: boolean;
  @Expose() @ApiProperty() sms_otp_required!: boolean;
  @Expose() @ApiProperty() member_count!: number;
  @Expose() @ApiProperty() form_count!: number;
  @Expose() @ApiProperty() created_at!: string;
  @Expose() @ApiProperty() updated_at!: string;
}

@Exclude()
export class TeamDetailMemberEntity {
  @Expose() @ApiProperty() id!: string;
  @Expose() @ApiProperty() name!: string;
  @Expose() @ApiProperty() phone!: string;
  @Expose() @ApiProperty({ required: false, nullable: true }) email?: string;
  @Expose()
  @ApiProperty({ enum: ['active', 'inactive', 'suspended'] })
  status!: 'active' | 'inactive' | 'suspended';
  @Expose() @ApiProperty({ type: [String] }) roles!: string[];
  @Expose() @ApiProperty({ type: [String] }) team_admins!: string[];
  @Expose() @ApiProperty() invites_count!: number;
  @Expose() @ApiProperty() is_team_admin!: boolean;
  @Expose() @ApiProperty() created_at!: string;
}

@Exclude()
export class TeamDetailFormEntity {
  @Expose() @ApiProperty() id!: string;
  @Expose() @ApiProperty() public_id!: string;
  @Expose() @ApiProperty() title!: string;
  @Expose()
  @ApiProperty({ enum: ['draft', 'published', 'archived'] })
  status!: 'draft' | 'published' | 'archived';
  @Expose() @ApiProperty() field_count!: number;
  @Expose() @ApiProperty() scans!: number;
  @Expose() @ApiProperty() submissions!: number;
  @Expose() @ApiProperty() updated_at!: string;
}

@Exclude()
export class TeamDetailEntity {
  @Expose()
  @ApiProperty({ type: TeamEntity })
  @Type(() => TeamEntity)
  team!: TeamEntity;
  @Expose()
  @ApiProperty({ type: [TeamDetailMemberEntity] })
  members!: TeamDetailMemberEntity[];
  @Expose()
  @ApiProperty({ type: [TeamDetailFormEntity] })
  forms!: TeamDetailFormEntity[];
  @Expose()
  @ApiProperty({ example: { page: 1, per_page: 50, total: 24 } })
  meta!: { page: number; per_page: number; total: number };
}

@Exclude()
export class CloneTeamResultEntity {
  @Expose()
  @ApiProperty({ type: TeamEntity })
  @Type(() => TeamEntity)
  team!: TeamEntity;
  @Expose() @ApiProperty({ example: 24 }) imported_members!: number;
  @Expose() @ApiProperty({ example: 3 }) imported_forms!: number;
}
