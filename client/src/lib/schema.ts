import { z } from "zod";

export const registrationSchema = z.object({
  factory: z.string().min(1, "Vui lòng chọn nhà máy"),
  interviewDate: z.date({ required_error: "Vui lòng chọn ngày phỏng vấn" }),
  fullName: z.string().min(2, "Vui lòng nhập đầy đủ họ tên"),
  gender: z.enum(["Nam", "Nữ", "Khác"], { required_error: "Vui lòng chọn giới tính" }),
  dob: z.date({ required_error: "Vui lòng chọn ngày sinh" }),
  phone: z.string().regex(/^[0-9]{10}$/, "Số điện thoại phải có đúng 10 chữ số"),
  idCard: z.string().regex(/^[0-9]{12}$/, "Số CCCD phải có đúng 12 chữ số"),
  ethnicity: z.string().min(1, "Vui lòng nhập dân tộc"),
  address: z.string().min(1, "Vui lòng nhập địa chỉ thường trú"),
  maritalStatus: z.enum(["Độc thân", "Đã kết hôn", "Khác"], { required_error: "Vui lòng chọn tình trạng hôn nhân" }),
  education: z.string().min(1, "Vui lòng nhập học vấn"),
  idIssueDate: z.date({ required_error: "Vui lòng chọn ngày cấp" }),
  notes: z.string().optional(),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;
