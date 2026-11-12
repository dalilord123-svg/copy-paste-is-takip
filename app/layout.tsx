import type { Metadata, Viewport } from "next";
import "./globals.css";

import RegisterSW from "@/app/components/RegisterSW";
import InstallPWA from "@/app/components/InstallPWA";

export const metadata: Metadata = {
  title: "COPY PASTE İş Takip",
  description: "COPY PASTE Reklam Factory İş Takip Sistemi",
  manifest: "/manifest.json",

  icons: {
    icon: "/icons/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0066ff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>
        <RegisterSW />
        <InstallPWA />
        {children}
      </body>
    </html>
  );
}