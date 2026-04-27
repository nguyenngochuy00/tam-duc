"use client";

import React, { useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { vi } from "date-fns/locale/vi";
import { format } from "date-fns";
import { registrationSchema, RegistrationFormData } from "@/lib/schema";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Factory,
  Calendar,
  QrCode,
  X,
  Flashlight,
  Image as ImageIcon,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

registerLocale("vi", vi);

const FACTORIES = [
  "AAC QV-CT",
  "LENS",
  "HONHAI-FY",
  "HONHAI-FK",
  "HONHAI-FL",
  "LEXE QC2&3",
  "LUXE QC1",
  "LUXE VT",
  "GTK NAM SƠN",
  "NEWING",
  "BLUEWAY",
  "SHUN YUN",
  "COMPAL-CT",
  "COMPAL-TV",
  "FUSHAN-CT",
  "AAC VP-CT",
  "ASKEY",
  "VMEIJIA",
  "AAC VP-TV",
  "LUXE-NGHỆ AN-CT",
  "HP(SDV)",
  "ADTEK",
  "LUXE-NGHỆ AN-TV",
  "BYD-CT",
  "INNOVATION",
];

export default function RegistrationForm() {
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [scannerLoading, setScannerLoading] = useState(false);
  const [scanNotification, setScanNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Tự động ẩn thông báo sau 3 giây
  React.useEffect(() => {
    if (scanNotification) {
      const timer = setTimeout(() => setScanNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [scanNotification]);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setScannerLoading(true);
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("qr-reader-hidden");
      }

      // Chiến thuật quét đa tầng để tối ưu độ nhạy:
      // 1. Thử quét trực tiếp file gốc
      try {
        const result = await scannerRef.current.scanFile(file, true);
        handleScanSuccess(result);
        return;
      } catch (err) {
        console.log("Quét gốc thất bại, đang thử tiền xử lý ảnh...");
      }

      // 2. Nếu thất bại, tiền xử lý ảnh: Nén và chuẩn hóa kích thước
      const processedImage = await preprocessImage(file);
      const result = await scannerRef.current.scanFile(processedImage, true);
      handleScanSuccess(result);
    } catch (err) {
      console.error("Lỗi đọc QR:", err);
      setScanNotification({
        type: "error",
        message: "Không thể nhận diện mã QR. Mẹo: Hãy đưa camera lại gần hơn và tránh bị lóa đèn nhé!",
      });
    } finally {
      setScannerLoading(false);
      event.target.value = "";
    }
  };

  // Hàm tiền xử lý ảnh: Đưa ảnh về kích thước tối ưu để thuật toán dễ đọc hơn
  const preprocessImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const maxSide = 1000; // Kích thước vàng để quét QR

          if (width > maxSide || height > maxSide) {
            if (width > height) {
              height = (height / width) * maxSide;
              width = maxSide;
            } else {
              width = (width / height) * maxSide;
              height = maxSide;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            // Tăng độ tương phản nhẹ để QR nổi bật hơn
            ctx.filter = "contrast(1.2) brightness(1.1)";
            ctx.drawImage(img, 0, 0, width, height);
          }

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(new File([blob], file.name, { type: "image/jpeg" }));
              } else {
                resolve(file);
              }
            },
            "image/jpeg",
            0.9,
          );
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleScanSuccess = (data: string) => {
    // CCCD Format: Number|OldID|Name|DOB|Gender|Address|IssueDate
    const parts = data.split("|");
    if (parts.length >= 7) {
      const idCard = parts[0];
      const fullName = parts[2];
      const dobRaw = parts[3];
      const gender = parts[4];
      const address = parts[5];
      const idIssueDateRaw = parts[6];

      const parseCCCDDate = (raw: string) => {
        if (raw.length !== 8) return null;
        const d = parseInt(raw.substring(0, 2));
        const m = parseInt(raw.substring(2, 4)) - 1;
        const y = parseInt(raw.substring(4, 8));
        return new Date(y, m, d);
      };

      setValue("idCard", idCard);
      setValue("fullName", fullName);
      setValue("dob", parseCCCDDate(dobRaw) as any);
      setValue(
        "gender",
        gender === "Nam" ? "Nam" : gender === "Nữ" ? "Nữ" : "Khác",
      );
      setValue("address", address);
      setValue("idIssueDate", parseCCCDDate(idIssueDateRaw) as any);

      setScanNotification({
        type: "success",
        message: "Đã tự động điền thông tin từ CCCD thành công!",
      });
    } else {
      setScanNotification({
        type: "error",
        message: "Mã QR không đúng định dạng CCCD. Vui lòng thử lại!",
      });
    }
  };

  const onSubmit = async (data: RegistrationFormData) => {
    setSubmitting(true);
    setStatus("idle");
    try {
      // Format Date objects to dd/mm/yyyy strings before sending to server
      const formattedData = {
        ...data,
        dob: format(data.dob, "dd/MM/yyyy"),
        interviewDate: format(data.interviewDate, "dd/MM/yyyy"),
        idIssueDate: format(data.idIssueDate, "dd/MM/yyyy"),
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/registrations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formattedData),
        },
      );

      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch (err) {
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Gửi thành công!</h2>
        <p className="text-muted-foreground">
          Cảm ơn bạn đã đăng ký. Chúng tôi sẽ sớm liên hệ.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-8 btn-primary"
        >
          Quay lại
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto relative">
      {/* Thông báo quét QR chuyên nghiệp */}
      <AnimatePresence>
        {scanNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className={`fixed top-4 left-1/2 z-[100] w-[92%] max-w-sm p-4 rounded-2xl shadow-2xl border flex flex-col items-center text-center gap-2 backdrop-blur-md ${
              scanNotification.type === "success"
                ? "bg-green-500/95 border-green-400 text-white"
                : "bg-red-500/95 border-red-400 text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              {scanNotification.type === "success" ? (
                <CheckCircle2 className="w-6 h-6 shrink-0" />
              ) : (
                <AlertCircle className="w-6 h-6 shrink-0" />
              )}
              <p className="font-bold text-base leading-tight">
                {scanNotification.type === "success" ? "Thành công!" : "Thất bại!"}
              </p>
            </div>
            <p className="text-sm opacity-90">
              {scanNotification.message}
            </p>
            <button 
              onClick={() => setScanNotification(null)}
              className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scanner Overlay */}
      {/* Hidden Scanner Element & Native Camera Input */}
      <div id="qr-reader-hidden" className="hidden"></div>
      <input
        id="qr-input-native"
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileUpload}
      />

      {/* Processing Loader */}
      <AnimatePresence>
        {scannerLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm"
          >
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-white text-lg font-medium tracking-wide">
              Đang quét mã CCCD...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-4 flex items-center justify-between glass-card p-3 rounded-xl border-l-4 border-primary">
        <div>
          <h3 className="font-bold text-base text-primary">
            Tự động điền nhanh
          </h3>
          <p className="text-sm text-muted-foreground">
            Quét QR trên thẻ CCCD để điền thông tin
          </p>
        </div>
        <label
          htmlFor="qr-input-native"
          className="group relative flex flex-col items-center justify-center w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-primary/30 hover:border-primary hover:bg-primary/5 active:scale-90 transition-all duration-200 cursor-pointer"
          title="Quét mã CCCD"
        >
          <QrCode className="w-7 h-7 text-primary group-hover:scale-110 transition-transform" />
        </label>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Section: Job Info */}
          <div className="space-y-3 md:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-primary/20 pb-1">
              Thông tin ứng tuyển
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-3">
                <label className="w-[130px] text-sm font-bold text-slate-700 dark:text-slate-300 shrink-0">
                  Nhà máy
                </label>
                <div className="flex-1">
                  <select
                    {...register("factory")}
                    className={`w-full input-field ${errors.factory ? "border-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.1)]" : ""}`}
                  >
                    <option value="" disabled={!!watch("factory")}>
                      -- Chọn nhà máy --
                    </option>
                    {FACTORIES.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                  {errors.factory && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.factory.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="w-[130px] text-sm font-bold text-slate-700 dark:text-slate-300 shrink-0">
                  Ngày phỏng vấn
                </label>
                <div className="flex-1">
                  <Controller
                    control={control}
                    name="interviewDate"
                    render={({ field }) => (
                      <DatePicker
                        placeholderText="dd/mm/yyyy"
                        onChange={(date: any) => field.onChange(date)}
                        selected={field.value}
                        dateFormat="dd/MM/yyyy"
                        locale="vi"
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        className="w-full input-field"
                        autoComplete="off"
                      />
                    )}
                  />
                  {errors.interviewDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.interviewDate.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Personal Info */}
          <div className="space-y-3 md:col-span-2 mt-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-primary/20 pb-1">
              Thông tin cá nhân
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-3">
                <label className="w-[130px] text-sm font-bold text-slate-700 dark:text-slate-300 shrink-0">
                  Họ và tên
                </label>
                <div className="flex-1">
                  <input
                    {...register("fullName")}
                    className="w-full input-field"
                    placeholder="Nguyễn Văn A"
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="w-[130px] text-sm font-bold text-slate-700 dark:text-slate-300 shrink-0">
                  Giới tính
                </label>
                <div className="flex-1 flex items-center gap-6 p-2 bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-slate-400/20 rounded-lg shadow-sm transition-all hover:border-slate-400">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="radio"
                      value="Nam"
                      {...register("gender")}
                      className="w-5 h-5 text-primary accent-primary"
                    />
                    <span className="font-medium text-sm">Nam</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="radio"
                      value="Nữ"
                      {...register("gender")}
                      className="w-5 h-5 text-primary accent-primary"
                    />
                    <span className="font-medium text-sm">Nữ</span>
                  </label>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="w-[130px] text-sm font-bold text-slate-700 dark:text-slate-300 shrink-0">
                  Ngày sinh
                </label>
                <div className="flex-1">
                  <Controller
                    control={control}
                    name="dob"
                    render={({ field }) => (
                      <DatePicker
                        placeholderText="dd/mm/yyyy"
                        onChange={(date: any) => field.onChange(date)}
                        selected={field.value}
                        dateFormat="dd/MM/yyyy"
                        locale="vi"
                        peekNextMonth
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        className="w-full input-field"
                        autoComplete="off"
                      />
                    )}
                  />
                  {errors.dob && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.dob.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="w-[130px] text-sm font-bold text-slate-700 dark:text-slate-300 shrink-0">
                  Số điện thoại
                </label>
                <div className="flex-1">
                  <input
                    {...register("phone")}
                    className="w-full input-field"
                    placeholder="09xxxxxxxx"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="w-[130px] text-sm font-bold text-slate-700 dark:text-slate-300 shrink-0">
                  Dân tộc
                </label>
                <div className="flex-1">
                  <input
                    {...register("ethnicity")}
                    className="w-full input-field"
                    placeholder="Kinh"
                  />
                  {errors.ethnicity && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.ethnicity.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 md:col-span-2">
                <label className="w-[130px] text-sm font-bold text-slate-700 dark:text-slate-300 shrink-0">
                  Địa chỉ thường trú
                </label>
                <div className="flex-1">
                  <input
                    {...register("address")}
                    className="w-full input-field"
                    placeholder="Xã, Huyện, Tỉnh..."
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.address.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section: ID Card */}
          <div className="space-y-3 md:col-span-2 mt-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-primary/20 pb-1">
              Giấy tờ định danh
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-3">
                <label className="w-[130px] text-sm font-bold text-slate-700 dark:text-slate-300 shrink-0">
                  Số CCCD/CMND
                </label>
                <div className="flex-1">
                  <input
                    {...register("idCard")}
                    className="w-full input-field"
                    placeholder="12 chữ số"
                  />
                  {errors.idCard && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.idCard.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="w-[130px] text-sm font-bold text-slate-700 dark:text-slate-300 shrink-0">
                  Ngày cấp
                </label>
                <div className="flex-1">
                  <Controller
                    control={control}
                    name="idIssueDate"
                    render={({ field }) => (
                      <DatePicker
                        placeholderText="dd/mm/yyyy"
                        onChange={(date: any) => field.onChange(date)}
                        selected={field.value}
                        dateFormat="dd/MM/yyyy"
                        locale="vi"
                        peekNextMonth
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        className="w-full input-field"
                        autoComplete="off"
                      />
                    )}
                  />
                  {errors.idIssueDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.idIssueDate.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Other */}
          <div className="space-y-3 md:col-span-2 mt-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-primary/20 pb-1">
              Thông tin khác
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-3">
                <label className="w-[130px] text-sm font-bold text-slate-700 dark:text-slate-300 shrink-0 leading-tight">
                  Tình trạng hôn nhân
                </label>
                <div className="flex-1 flex flex-wrap items-center gap-4 p-2 bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-slate-400/20 rounded-lg shadow-sm transition-all hover:border-slate-400">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="radio"
                      value="Độc thân"
                      {...register("maritalStatus")}
                      className="w-5 h-5 text-primary accent-primary"
                    />
                    <span className="font-medium text-sm">Độc thân</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="radio"
                      value="Đã kết hôn"
                      {...register("maritalStatus")}
                      className="w-5 h-5 text-primary accent-primary"
                    />
                    <span className="font-medium text-sm">Đã kết hôn</span>
                  </label>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="w-[130px] text-sm font-bold text-slate-700 dark:text-slate-300 shrink-0">
                  Trình độ học vấn
                </label>
                <div className="flex-1">
                  <input
                    {...register("education")}
                    className="w-full input-field"
                    placeholder="12/12, Đại học..."
                  />
                  {errors.education && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.education.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 flex items-start gap-3 mt-1">
            <label className="w-[130px] text-sm font-medium shrink-0 pt-2">
              Ghi chú thêm
            </label>
            <div className="flex-1">
              <textarea
                {...register("notes")}
                className="input-field min-h-[60px]"
                placeholder="Nhập thêm thông tin nếu có..."
              />
            </div>
          </div>
        </div>

        {status === "error" && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500">
            <AlertCircle className="w-5 h-5" />
            <p>Đã có lỗi xảy ra. Vui lòng thử lại sau.</p>
          </div>
        )}

        <button
          disabled={submitting}
          type="submit"
          className="w-full relative overflow-hidden group btn-primary py-4 text-xl font-bold flex items-center justify-center gap-3 mt-4 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 className="w-7 h-7 animate-spin" />
              <span className="tracking-wider">ĐANG GỬI DỮ LIỆU...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="tracking-wider">XÁC NHẬN NỘP</span>
            </>
          )}
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </button>
      </form>
    </div>
  );
}
