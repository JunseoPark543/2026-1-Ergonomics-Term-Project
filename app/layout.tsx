import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "논문 독해 헬퍼",
  description: "생산적 저항 기반 학술 논문 독해 프로토타입"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
