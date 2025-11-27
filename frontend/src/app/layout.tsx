// app/layout.tsx
import Sidebar from "@/components/Sidebar";
import { ThemeProvider } from "@/lib/ThemeContext";
import { UserProvider } from "@/lib/UserContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Circuit Sage",
  description:
    "Manage your repair business - tickets, inventory, invoices and customers",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`min-h-screen bg-background font-sans antialiased ${inter.variable}`}
      >
        <ThemeProvider>
          <div className="relative flex min-h-screen bg-background">
            <UserProvider>
              <Sidebar />
              <main className="flex-1 p-4 lg:p-8 lg:ml-64 bg-background">{children}</main>
            </UserProvider>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
