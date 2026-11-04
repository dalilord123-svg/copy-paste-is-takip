"use client";

import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
      <div className="text-center">

        <div className="text-8xl font-black tracking-tight">
          <span className="text-blue-600">C</span>
          <span className="text-black">P</span>
        </div>

        <h1 className="mt-5 text-3xl font-extrabold tracking-wider">
          COPY <span className="text-blue-600">PASTE</span>
        </h1>

        <p className="mt-2 text-lg tracking-[0.25em] text-gray-600">
          REKLAM FACTORY
        </p>

        <p className="mt-8 text-sm text-gray-500">
          İş Takip Sistemi
        </p>

      </div>
    </div>
  );
}