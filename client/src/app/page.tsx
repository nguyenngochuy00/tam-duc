"use client";

import RegistrationForm from "@/components/RegistrationForm";

export default function Home() {
  return (
    <main className="min-h-screen py-6 px-4 md:px-8 bg-slate-50 dark:bg-[#050505]">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-6">
          <div className="inline-block mb-2">
            <img
              src="/logo.jpg"
              alt="Tâm Đức"
              className="h-16 w-auto rounded-xl shadow-md"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
            ĐĂNG KÝ ỨNG VIÊN
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
            Vui lòng điền đầy đủ thông tin bên dưới để hoàn tất thủ tục đăng ký.
          </p>
        </header>

        <RegistrationForm />

        <footer className="mt-16 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Văn phòng Tâm Đức. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
