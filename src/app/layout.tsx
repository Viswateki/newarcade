import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientThemeProvider } from "@/components/ClientThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import NavigationWrapper from "@/components/NavigationWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DevTools Hub - Modern Development Platform",
  description: "A modern platform for developers to share tools, write blogs, and connect with the community",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="transition-colors duration-300">
      <body className={`${inter.className} antialiased transition-colors duration-300`}>
        <ClientThemeProvider>
          <NavigationWrapper />
          {children}
        </ClientThemeProvider>
      </body>
    </html>
  );
}
