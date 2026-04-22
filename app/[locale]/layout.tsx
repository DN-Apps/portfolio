import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { locales } from "@/i18n";
import "../globals.css";

// Alle Locale-Pfade werden statisch erzeugt, damit Next die Sprachseiten
// sauber vorkompilieren kann.
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "Daniel Nedic | Full Stack Developer",
  description:
    "A multilingual portfolio showcasing projects, skills, and professional journey",
  keywords: [
    "portfolio",
    "full-stack",
    "developer",
    "react",
    "typescript",
    "next.js",
  ],
  openGraph: {
    title: "Daniel Nedic | Full Stack Developer",
    description: "Discover my projects, skills, and professional expertise",
    type: "website",
  },
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/apple-icon.png", type: "image/png" }],
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}

export default async function RootLayout({
  children,
  params: { locale },
}: RootLayoutProps) {
  // Ungültige Locales führen bewusst auf 404 statt auf eine falsche Sprache.
  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        {/* Der Provider macht die geladenen Übersetzungen für alle Kinder
            verfügbar, damit jede Section nur ihren Namespace lesen muss. */}
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
