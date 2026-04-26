import { Module } from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { RegistrationsController } from './registrations.controller';
import { GoogleSheetsService } from '../google-sheets/google-sheets.service';

@Module({
  controllers: [RegistrationsController],
  providers: [RegistrationsService, GoogleSheetsService],
})
export class RegistrationsModule {}
