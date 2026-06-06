import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class DashboardStatEntity {
  @Expose() @ApiProperty() label!: string;
  @Expose() @ApiProperty() value!: number | string;
  @Expose() @ApiProperty({ required: false, nullable: true }) meta?: string;
  @Expose()
  @ApiProperty({ required: false, nullable: true })
  change_pct?: number;
  @Expose() @ApiProperty() is_up!: boolean;
}

@Exclude()
export class AttendanceBucketEntity {
  @Expose() @ApiProperty() label!: string;
  @Expose() @ApiProperty() value!: number;
}

@Exclude()
export class AttendanceEntity {
  @Expose() @ApiProperty({ enum: ['week', 'month', 'year'] }) timeframe!:
    | 'week'
    | 'month'
    | 'year';
  @Expose()
  @ApiProperty({ type: [AttendanceBucketEntity] })
  buckets!: AttendanceBucketEntity[];
}

@Exclude()
export class MilestoneEntity {
  @Expose() @ApiProperty() label!: string;
  @Expose() @ApiProperty() value!: string;
  @Expose() @ApiProperty() date!: string;
  @Expose() @ApiProperty() icon!: 'calendar' | 'users' | 'target';
}

@Exclude()
export class PerformanceTabEntity {
  @Expose()
  @ApiProperty({ type: [DashboardStatEntity] })
  stats!: DashboardStatEntity[];
  @Expose()
  @ApiProperty({ type: AttendanceEntity })
  attendance!: AttendanceEntity;
  @Expose()
  @ApiProperty({ type: [MilestoneEntity] })
  milestones!: MilestoneEntity[];
}

@Exclude()
export class TeamPreviewMemberEntity {
  @Expose() @ApiProperty() id!: string;
  @Expose() @ApiProperty() name!: string;
}

@Exclude()
export class DashboardTeamEntity {
  @Expose() @ApiProperty() id!: string;
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
  @Expose()
  @ApiProperty({ type: [TeamPreviewMemberEntity] })
  preview_members!: TeamPreviewMemberEntity[];
}

@Exclude()
export class TeamsTabEntity {
  @Expose()
  @ApiProperty({ type: [DashboardTeamEntity] })
  teams!: DashboardTeamEntity[];
}

@Exclude()
export class SettingsTabEntity {
  @Expose() @ApiProperty({ enum: ['active', 'paused', 'archived'] }) status!:
    | 'active'
    | 'paused'
    | 'archived';
  @Expose()
  @ApiProperty({ required: false, nullable: true, type: () => Object })
  primary_admin?: { id: string; name: string } | null;
  @Expose() @ApiProperty() security_protocol!: string;
  @Expose() @ApiProperty() created_at!: string;
}

@Exclude()
export class LocationDashboardEntity {
  @Expose()
  @ApiProperty({ enum: ['performance', 'teams', 'settings'] })
  tab!: string;
  @Expose() @ApiProperty() data!:
    | PerformanceTabEntity
    | TeamsTabEntity
    | SettingsTabEntity;
}
