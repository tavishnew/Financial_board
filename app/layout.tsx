import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider, themeInitScript } from "@/components/ThemeProvider";
import { Providers } from "@/components/Providers";
import ClickSpark from "@/components/ClickSpark";

export const metadata: Metadata = {
  metadataBase: new URL("https://moneytrail.app"),
  title: {
    default: "MoneyTrail — your money, finally legible",
    template: "%s — MoneyTrail",
  },
  description: "A bold, legible bento-grid personal finance tracker. Track income, expenses, budgets and goals with clarity, not spreadsheet fatigue.",
  keywords: ["personal finance", "budgeting", "expense tracker", "dashboard", "money management", "financial planner"],
  authors: [{ name: "MoneyTrail" }],
  creator: "MoneyTrail",
  publisher: "MoneyTrail",
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
    url: false,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/",
    },
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: true,
    viewportFit: "cover",
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f7f2" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a08" },
  ],
  // Open Graph
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://moneytrail.app",
    title: "MoneyTrail — your money, finally legible",
    description: "A bold, legible bento-grid personal finance tracker. Track income, expenses, budgets and goals with clarity, not spreadsheet fatigue.",
    siteName: "MoneyTrail",
    images: [
     {
        url: "https://moneytrail.app/og.png",
        width: 1200,
        height: 630,
        alt: "MoneyTrail dashboard preview",
      },
    ],
  },
  // Twitter Cards
  twitter: {
    card: "summary_large_image",
    title: "MoneyTrail — your money, finally legible",
    description: "A bold, legible bento-grid personal finance tracker. Track income, expenses, budgets and goals with clarity.",
    images: ["https://moneytrail.app/og.png"],
    creator: "@moneytrail",
    site: "@moneytrail",
  },
  // Icons
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-16x16.svg", type: "image/svg+xml", sizes: "16x16" },
      { url: "/icon-32x32.svg", type: "image/svg+xml", sizes: "32x32" },
    ],
    shortcut: "/favicon.ico",
    apple: {
      url: "/apple-touch-icon.svg",
      sizes: "180x180",
    },
  },
  manifest: "/site.webmanifest",
  other: {
    "application/ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "MoneyTrail",
      description: "A bold, legible bento-grid personal finance tracker. Track income, expenses, budgets and goals with clarity.",
      url: "https://moneytrail.app",
      applicationCategory: "FinanceApplication",
      operatingSystem: "All",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    }),
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700;12..96,800&family=Hanken+Grotesque:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ClickSpark
          sparkColor="#D9A93C"
          sparkSize={10}
          sparkRadius={15}
          sparkCount={8}
          duration={400}
          easing="ease-out"
          extraScale={1}
        >
          <Providers>{children}</Providers>
        </ClickSpark>
      </body>
    </html>
  );
}

