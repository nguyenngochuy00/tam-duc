import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RegistrationsModule } from './registrations/registrations.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), RegistrationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
