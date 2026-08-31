import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] items-center bg-paper pt-28">
      <Container className="text-center">
        <p className="font-feature-numeric text-sm uppercase tracking-[0.2em] text-clay">404</p>
        <h1 className="mt-4 font-serif text-3xl text-ink sm:text-4xl">Cette page n&rsquo;existe pas.</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
          Le contenu que vous cherchez a peut-être changé d&rsquo;adresse. Retrouvez nos biens ou revenez à
          l&rsquo;accueil.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button href="/">Retour à l&rsquo;accueil</Button>
          <Button href="/tous-nos-biens" variant="secondary">
            Voir nos biens
          </Button>
        </div>
      </Container>
    </section>
  );
}
