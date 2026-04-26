import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRegistrationDto {
  @IsString()
  @IsNotEmpty()
  factory: string;

  @IsString()
  @IsNotEmpty()
  interviewDate: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsString()
  @IsNotEmpty()
  dob: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  idCard: string;

  @IsString()
  @IsNotEmpty()
  ethnicity: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  maritalStatus: string;

  @IsString()
  @IsNotEmpty()
  education: string;

  @IsString()
  @IsNotEmpty()
  idIssueDate: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
