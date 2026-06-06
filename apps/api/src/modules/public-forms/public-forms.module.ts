import { Module } from '@nestjs/common';
import { PublicFormsService } from './public-forms.service';
import { PublicFormsController } from './public-forms.controller';
import { FormsModule } from '../forms/forms.module';

@Module({
  imports: [FormsModule],
  providers: [PublicFormsService],
  controllers: [PublicFormsController],
})
export class PublicFormsModule {}
