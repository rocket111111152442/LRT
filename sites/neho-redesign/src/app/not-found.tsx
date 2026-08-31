import Link from "next/link";

export default function RootNotFound() {
  return (
    <html lang="fr">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "4rem", textAlign: "center" }}>
        <p style={{ fontSize: "3rem", margin: 0 }}>404</p>
        <p>Page introuvable.</p>
        <Link href="/fr">Retour à l&rsquo;accueil</Link>
      </body>
    </html>
  );
}
