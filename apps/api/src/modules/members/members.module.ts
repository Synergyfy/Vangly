import { Module } from '@nestjs/common';
import { MembersService } from './members.service';
import {
  LocationMembersController,
  LocationBulkMembersController,
  MembersController,
} from './members.controller';

@Module({
  providers: [MembersService],
  controllers: [
    LocationMembersController,
    LocationBulkMembersController,
    MembersController,
  ],
  exports: [MembersService],
})
export class MembersModule {}
