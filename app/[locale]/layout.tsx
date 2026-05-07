import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { locales, type Locale } from "@/i18n";
import "../globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
  "https://portfolio.ned-it.de";

// Alle Locale-Pfade werden statisch erzeugt, damit Next die Sprachseiten
// sauber vorkompilieren kann.
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const descriptions: Record<Locale, string> = {
  de: "Mehrsprachiges Portfolio von Daniel Nedic – Full Stack Developer mit Fokus auf React, TypeScript und Next.js.",
  en: "Multilingual portfolio of Daniel Nedic – Full Stack Developer specialising in React, TypeScript and Next.js.",
  fr: "Portfolio multilingue de Daniel Nedic – développeur Full Stack spécialisé en React, TypeScript et Next.js.",
  sr: "Višejezični portfolio Daniela Nedića – Full Stack developer sa fokusom na React, TypeScript i Next.js.",
};

export function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Metadata {
  const lang = locales.includes(locale as Locale) ? (locale as Locale) : "de";
  const description = descriptions[lang];
  const canonical = `${siteUrl}/${lang}/about`;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: "Daniel Nedic | Full Stack Developer",
      template: "%s | Daniel Nedic",
    },
    description,
    keywords: [
      "portfolio",
      "full-stack",
      "developer",
      "react",
      "typescript",
      "next.js",
      "Daniel Nedic",
      "Ned-IT",
    ],
    alternates: {
      canonical,
      languages: Object.fromEntries(
        locales.map((l) => [l, `${siteUrl}/${l}/about`]),
      ) as Record<string, string>,
    },
    openGraph: {
      title: "Daniel Nedic | Full Stack Developer",
      description,
      type: "website",
      url: canonical,
      siteName: "Daniel Nedic Portfolio",
      locale: lang,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: "Daniel Nedic – Full Stack Developer Portfolio",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Daniel Nedic | Full Stack Developer",
      description,
      images: ["/opengraph-image"],
    },
    icons: {
      icon: [{ url: "/favicon.ico" }, { url: "/icon.png", type: "image/png" }],
      apple: [{ url: "/apple-icon.png", type: "image/png" }],
    },
  };
}

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
