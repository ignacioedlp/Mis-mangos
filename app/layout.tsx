import type { Metadata, Viewport } from "next";
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
  title: "Mis Mangos — Finanzas personales",
  description:
    "Gestión de gastos, presupuesto y fondos personales en un solo lugar.",
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
    title: "Mis Mangos — Finanzas personales",
    description:
      "Gestión clara de gastos, presupuesto y fondos personales.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mis Mangos — Finanzas personales",
    description:
      "Gestión clara de gastos, presupuesto y fondos personales.",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f0e8" },
    { media: "(prefers-color-scheme: dark)", color: "#090909" },
  ],
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
          defaultTheme="dark"
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
