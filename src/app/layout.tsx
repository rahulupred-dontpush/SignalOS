import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SignalOS - GTM Intelligence",
  description: "AI-native GTM intelligence for revenue teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
