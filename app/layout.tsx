import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Web Party — Screen Share & Control",
  description: "Create a party, share your screen, request control. Pure web prototype.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased bg-[#0a0a0f] text-slate-100">
        {children}
      </body>
    </html>
  );
}
