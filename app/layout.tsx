import type { Metadata } from "next";
import { DM_Sans, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const dmSans = DM_Sans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mis Mangos - Personal Finance Manager",
  description:
    "Complete personal finance management with budget tracking, expense management, and intelligent notifications",
  keywords: [
    "finance",
    "budget",
    "expenses",
    "personal finance",
    "money management",
    "Argentina",
    "ARS",
  ],
  authors: [{ name: "ToxeDev" }],
  creator: "Mis Mangos",
  publisher: "Mis Mangos",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mis Mangos",
  },
  openGraph: {
    type: "website",
    siteName: "Mis Mangos",
    title: "Mis Mangos - Personal Finance Manager",
    description:
      "Complete personal finance management with budget tracking, expense management, and intelligent notifications",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mis Mangos - Personal Finance Manager",
    description:
      "Complete personal finance management with budget tracking, expense management, and intelligent notifications",
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
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${dmSans.variable} ${bricolage.variable}`}
      suppressHydrationWarning
    >
      <body className={`${dmSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextTopLoader showSpinner={false} height={3} color="var(--primary)" />
          <Toaster richColors position="top-right" />
          <main className="min-h-screen">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
