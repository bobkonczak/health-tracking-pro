import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Sidebar } from "@/src/components/layout/Sidebar";
import { PWAWrapper } from "@/src/components/PWAWrapper";
import { ThemeProvider } from "@/src/contexts/ThemeContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Health Tracking Pro",
  description: "Track your health journey with Bob & Paula",
  manifest: "/manifest.json",
  themeColor: "#3b82f6",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HealthPro",
  },
  icons: {
    icon: [
      { url: "/icons/icon-32x32.svg", sizes: "32x32", type: "image/svg+xml" },
      { url: "/icons/icon-16x16.svg", sizes: "16x16", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/icon-180x180.svg", sizes: "180x180", type: "image/svg+xml" },
      { url: "/icons/icon-152x152.svg", sizes: "152x152", type: "image/svg+xml" },
      { url: "/icons/icon-120x120.svg", sizes: "120x120", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body className={`${inter.className} antialiased min-h-screen bg-background`}>
        <ThemeProvider>
          <PWAWrapper>
            <div className="flex min-h-screen">
              {/* Sidebar Navigation */}
              <div className="hidden md:flex md:w-64 md:flex-col">
                <Sidebar />
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col">
                {children}
              </div>
            </div>
          </PWAWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
