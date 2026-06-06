import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsController, LocationTeamsController } from './teams.controller';

@Module({
  providers: [TeamsService],
  controllers: [TeamsController, LocationTeamsController],
  exports: [TeamsService],
})
export class TeamsModule {}
