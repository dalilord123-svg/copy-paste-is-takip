import type { Metadata } from "next";
import "./globals.css";
import RegisterSW from "@/app/components/RegisterSW";
import InstallPWA from "@/app/components/InstallPWA";
import SplashScreen from "@/app/components/SplashScreen";

export const metadata: Metadata = {
  title: "COPY PASTE İş Takip",

  description: "COPY PASTE Reklam Factory",

  manifest: "/manifest.json",

  icons: {
    icon: "/icons/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },

  themeColor: "#111111",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>
         <SplashScreen />
        <RegisterSW />
        <InstallPWA />
        {children}
      </body>
    </html>
  );
}