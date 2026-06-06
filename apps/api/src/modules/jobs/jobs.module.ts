import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsModule as InfraJobsModule } from '../../infra/jobs/jobs.module';

@Module({
  imports: [InfraJobsModule],
  controllers: [JobsController],
})
export class JobsModule {}
