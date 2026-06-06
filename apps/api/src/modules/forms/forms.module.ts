import { Module } from '@nestjs/common';
import { FormsService } from './forms.service';
import { FormsController, TeamFormsController } from './forms.controller';

@Module({
  providers: [FormsService],
  controllers: [FormsController, TeamFormsController],
  exports: [FormsService],
})
export class FormsModule {}
