import type { Metadata } from "next";
import "./globals.css";
import { DevTools } from "./DevTools";
import { ThemeProvider, ThemeSwitcher } from "@/components/theme";

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
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          {children}
          <ThemeSwitcher />
          <DevTools />
        </ThemeProvider>
      </body>
    </html>
  );
}
