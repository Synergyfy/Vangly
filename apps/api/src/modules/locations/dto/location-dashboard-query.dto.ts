import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export class LocationDashboardQueryDto {
  @ApiPropertyOptional({
    enum: ['performance', 'teams', 'settings'],
    default: 'performance',
  })
  @IsOptional()
  @IsIn(['performance', 'teams', 'settings'])
  tab: 'performance' | 'teams' | 'settings' = 'performance';

  @ApiPropertyOptional({ enum: ['week', 'month', 'year'] })
  @IsOptional()
  @IsIn(['week', 'month', 'year'])
  timeframe?: 'week' | 'month' | 'year';
}
