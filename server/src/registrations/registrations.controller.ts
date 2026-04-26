import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';

@Controller()
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Get('apply/config')
  getConfig(@Query('token') token: string) {
    return this.registrationsService.getConfig(token);
  }

  @Post('registrations')
  create(@Body() createRegistrationDto: CreateRegistrationDto) {
    console.log('--- Nhận được yêu cầu đăng ký mới ---');
    console.log('Dữ liệu:', JSON.stringify(createRegistrationDto));
    return this.registrationsService.create(createRegistrationDto);
  }
}
