import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider, themeInitScript } from "@/components/ThemeProvider";
import { Providers } from "@/components/Providers";
import ClickSpark from "@/components/ClickSpark";

export const metadata: Metadata = {
  title: "MoneyTrail — your money, finally legible",
  description:
    "A maximalist bento-grid personal finance tracker. Track income, expenses, budgets and goals with clarity.",
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
        sparkColor="#C2883B"
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

