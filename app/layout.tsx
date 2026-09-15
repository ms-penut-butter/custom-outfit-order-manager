import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Order Management App",
  description: "A Next.js order management dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
