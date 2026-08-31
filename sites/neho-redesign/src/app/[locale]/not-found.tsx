import { getDictionary } from "@/lib/i18n/get-dictionary";
import { defaultLocale } from "@/lib/i18n/config";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function LocaleNotFound() {
  // Le segment [locale] n'est pas résolu ici (not-found côté serveur ne
  // reçoit pas params) : on retombe sur la langue par défaut, ce qui reste
  // correct pour un message d'erreur générique.
  const dict = getDictionary(defaultLocale);
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="font-display text-6xl text-ivy-600">404</p>
      <h1 className="mt-4 text-2xl font-medium text-ink-900">{dict.notFound.title}</h1>
      <p className="mt-2 max-w-md text-ink-500">{dict.notFound.description}</p>
      <Button href={`/${defaultLocale}`} className="mt-8">
        {dict.notFound.cta}
      </Button>
    </Container>
  );
}
