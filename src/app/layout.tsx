import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daily Pulse",
  description: "Your personalized morning briefing with calendar, emails, and AI insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
