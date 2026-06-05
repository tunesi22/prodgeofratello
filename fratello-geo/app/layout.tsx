import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fratello | Join Waitlist",
  description: "Bikin brand kamu direkomendasiin sama AI, dipilih sama manusia."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
