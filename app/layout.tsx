import type { Metadata } from "next";
import { Noto_Sans_KR } from 'next/font/google';
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "@/components/ui/sonner";

const notoSansKR = Noto_Sans_KR({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-noto-sans-kr',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Better Auth - Personal Finance Manager",
  description: "Complete personal finance management with budget tracking, expense management, and intelligent notifications",
  keywords: ["finance", "budget", "expenses", "personal finance", "money management", "Argentina", "ARS"],
  authors: [{ name: "Better Auth Team" }],
  creator: "Better Auth",
  publisher: "Better Auth",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Better Auth",
  },
  openGraph: {
    type: "website",
    siteName: "Better Auth",
    title: "Better Auth - Personal Finance Manager",
    description: "Complete personal finance management with budget tracking, expense management, and intelligent notifications",
  },
  twitter: {
    card: "summary_large_image",
    title: "Better Auth - Personal Finance Manager",
    description: "Complete personal finance management with budget tracking, expense management, and intelligent notifications",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  icons: {
    icon: '/logo.png',
    apple: '/logo.png'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${notoSansKR.variable}`} suppressHydrationWarning>
      <body
        className={` antialiased`}
      >
        <NextTopLoader showSpinner={false} height={6} color="#000000" />
        <Toaster richColors position="top-right" />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
