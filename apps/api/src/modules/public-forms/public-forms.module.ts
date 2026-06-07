import { Module } from '@nestjs/common';
import { PublicFormsService } from './public-forms.service';
import { PublicFormsController } from './public-forms.controller';
import { FormsModule } from '../forms/forms.module';
import { ContactsModule } from '../contacts/contacts.module';

@Module({
  imports: [FormsModule, ContactsModule],
  providers: [PublicFormsService],
  controllers: [PublicFormsController],
})
export class PublicFormsModule {}
