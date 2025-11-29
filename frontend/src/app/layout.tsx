// app/layout.tsx
import Sidebar from "@/components/Sidebar";
import MainContent from "@/components/MainContent";
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
              <MainContent>{children}</MainContent>
            </UserProvider>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
