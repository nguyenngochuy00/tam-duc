"use client";

import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, ExternalLink, QrCode, FileSpreadsheet, Check, Copy } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminPage() {
  const [baseUrl, setBaseUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const downloadQR = () => {
    const svg = document.getElementById("main-qr");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = "QR-DangKy-TamDuc.png";
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-slate-50 dark:bg-[#050505] flex items-center justify-center">
      <div className="max-w-3xl w-full">
        <header className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-center md:text-left">
              ADMIN DASHBOARD
            </h1>
            <p className="text-muted-foreground text-center md:text-left">
              Quản lý mã QR đăng ký Tâm Đức
            </p>
          </div>
          <a
            href="https://docs.google.com/spreadsheets/d/1FU48UvzTDRStaraZ0ZOt_1smfLdQLUZDU2-omOF2C5o/edit?gid=0#gid=0"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-green-600 font-bold hover:underline bg-green-500/10 px-6 py-3 rounded-full"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Mở Google Sheets</span>
          </a>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 md:p-12 bg-white dark:bg-white/5 shadow-2xl rounded-3xl flex flex-col items-center text-center border-t-4 border-t-primary"
        >
          <div className="mb-8 p-4 bg-white rounded-3xl shadow-xl border border-slate-100">
            {baseUrl ? (
              <QRCodeSVG
                id="main-qr"
                value={baseUrl}
                size={250}
                level="H"
                includeMargin={true}
              />
            ) : (
              <div className="w-[250px] h-[250px] flex items-center justify-center bg-slate-50 animate-pulse rounded-xl">
                <QrCode className="w-12 h-12 text-slate-300" />
              </div>
            )}
          </div>

          <h2 className="text-2xl font-bold mb-2">Mã QR Đăng Ký</h2>
          <p className="text-muted-foreground mb-8 max-w-lg">
            Sử dụng mã QR duy nhất này cho tất cả các nhà máy. Ứng viên khi quét
            mã sẽ tự chọn Nhà máy và nhập thông tin trên form đăng ký.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <button
              onClick={downloadQR}
              className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 py-4 px-8 text-lg"
            >
              <Download className="w-6 h-6" />
              Tải Mã QR
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(baseUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className={`p-4 px-8 rounded-2xl transition-all font-bold w-full sm:w-auto text-lg flex items-center justify-center gap-2 ${
                copied 
                  ? "bg-green-500 text-white shadow-green-200" 
                  : "bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-6 h-6" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
