import { redirect } from "next/navigation";

interface PageProps {
  params: {
    locale: string;
  };
}

export default function Page({ params: { locale } }: PageProps) {
  // Die Startseite leitet direkt auf "about" weiter, damit es einen klaren
  // Einstiegspunkt gibt und keine leere Locale-Root gepflegt werden muss.
  redirect(`/${locale}/about`);
}
