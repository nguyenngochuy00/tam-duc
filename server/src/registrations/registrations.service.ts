/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { GoogleSheetsService } from '../google-sheets/google-sheets.service';

@Injectable()
export class RegistrationsService {
  constructor(private googleSheetsService: GoogleSheetsService) {}

  async create(createRegistrationDto: CreateRegistrationDto) {
    const now = new Date();
    const formattedSubmitTime = now.toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour12: false,
    });
    const formattedInterviewDate = createRegistrationDto.interviewDate;
    const formattedDob = createRegistrationDto.dob;
    const formattedIdIssueDate = createRegistrationDto.idIssueDate;
    // eslint-disable-next-line prettier/prettier

    const row = [
      // eslint-disable-next-line prettier/prettier
      formattedSubmitTime, // Thời gian nộp
      // eslint-disable-next-line prettier/prettier
      createRegistrationDto.factory, // Nhà máy
      // eslint-disable-next-line prettier/prettier
      formattedInterviewDate, // Ngày phỏng vấn
      // eslint-disable-next-line prettier/prettier
      createRegistrationDto.fullName, // Họ tên
      // eslint-disable-next-line prettier/prettier
      createRegistrationDto.gender, // Giới tính
      // eslint-disable-next-line prettier/prettier
      formattedDob, // Ngày sinh
      // eslint-disable-next-line prettier/prettier
      createRegistrationDto.phone, // Số điện thoại
      // eslint-disable-next-line prettier/prettier
      createRegistrationDto.ethnicity, // Dân tộc
      // eslint-disable-next-line prettier/prettier
      createRegistrationDto.address, // Địa chỉ
      // eslint-disable-next-line prettier/prettier
      createRegistrationDto.idCard, // CCCD
      // eslint-disable-next-line prettier/prettier
      formattedIdIssueDate, // Ngày cấp
      createRegistrationDto.maritalStatus, // Tình trạng hôn nhân
      // eslint-disable-next-line prettier/prettier
      createRegistrationDto.education, // Học vấn
      createRegistrationDto.notes || '', // Ghi chú
    ];

    await this.googleSheetsService.appendRow(row);
    return { success: true, message: 'Registration submitted successfully' };
  }

  getConfig(token: string) {
    // In a real app, you would look up the token in a DB or decode it.
    // For now, we'll return a mock config based on the token.
    // Example: base64 encoded JSON string
    try {
      if (token === 'tam-duc-demo') {
        return {
          factory: 'Nhà máy Tâm Đức 1',
          interviewDate: '2024-05-01',
        };
      }
      // eslint-disable-next-line prettier/prettier

      const decoded = Buffer.from(token, 'base64').toString();
      const config = JSON.parse(decoded);
      return {
        factory: config.factory || 'Chưa xác định',
        interviewDate: config.date || 'Chưa xác định',
      };
    } catch (e) {
      return {
        factory: 'Nhà máy mặc định',
        interviewDate: 'Theo lịch hẹn',
      };
    }
  }
}
