import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navigation } from "@/src/components/layout/Navigation";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Health Tracking Pro",
  description: "Track your health journey with Bob & Paula",
  manifest: "/manifest.json",
  themeColor: "#000000",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
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
        <div className="flex flex-col md:flex-row min-h-screen">
          <Navigation />
          <div className="flex-1 flex flex-col pb-16 md:pb-0">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
