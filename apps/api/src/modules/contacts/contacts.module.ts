import { Module } from '@nestjs/common';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { ContactMatchService } from './contact-match.service';

@Module({
  controllers: [ContactsController],
  providers: [ContactsService, ContactMatchService],
  exports: [ContactsService, ContactMatchService],
})
export class ContactsModule {}
