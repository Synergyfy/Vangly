import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class AnalyticsCardsEntity {
  @Expose() @ApiProperty() total_teams!: number;
  @Expose() @ApiProperty() total_members!: number;
  @Expose() @ApiProperty() total_forms!: number;
  @Expose() @ApiProperty() total_submissions!: number;
  @Expose() @ApiProperty() sms_credits_used!: number;
}

@Exclude()
export class OutreachGrowthPointEntity {
  @Expose() @ApiProperty() date!: string;
  @Expose() @ApiProperty() invited!: number;
  @Expose() @ApiProperty() attended!: number;
}

@Exclude()
export class OutreachGrowthEntity {
  @Expose()
  @ApiProperty({ type: [OutreachGrowthPointEntity] })
  @Type(() => OutreachGrowthPointEntity)
  points!: OutreachGrowthPointEntity[];
}

@Exclude()
export class TopPerformerEntity {
  @Expose() @ApiProperty() user_id!: string;
  @Expose() @ApiProperty() name!: string;
  @Expose() @ApiProperty() invites_count!: number;
  @Expose() @ApiProperty() attended_count!: number;
}

@Exclude()
export class RecentActivityEntity {
  @Expose() @ApiProperty() id!: string;
  @Expose() @ApiProperty() kind!: string;
  @Expose() @ApiProperty() actor_user_id!: string;
  @Expose()
  @ApiPropertyOptional({ nullable: true })
  description?: string;
  @Expose() @ApiProperty() at!: string;
}

@Exclude()
export class OrgAnalyticsEntity {
  @Expose()
  @ApiProperty({ type: AnalyticsCardsEntity })
  @Type(() => AnalyticsCardsEntity)
  cards!: AnalyticsCardsEntity;
  @Expose()
  @ApiProperty({ type: OutreachGrowthEntity })
  @Type(() => OutreachGrowthEntity)
  growth!: OutreachGrowthEntity;
  @Expose()
  @ApiProperty({ type: [TopPerformerEntity] })
  @Type(() => TopPerformerEntity)
  top_performers!: TopPerformerEntity[];
  @Expose()
  @ApiProperty({ type: [RecentActivityEntity] })
  @Type(() => RecentActivityEntity)
  recent_activity!: RecentActivityEntity[];
}
