import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/layout/sidebar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WenLaunch Hub",
  description: "Project management for web design projects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex font-sans">
        <TooltipProvider>
          <Sidebar />
          <main className="flex-1 overflow-auto bg-background">
            <div className="mx-auto max-w-7xl px-8 py-8">{children}</div>
          </main>
          <Toaster theme="light" />
        </TooltipProvider>
      </body>
    </html>
  );
}
