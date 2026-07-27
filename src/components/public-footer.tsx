import Link from "next/link";
import { Logo } from "@/components/logo";

export function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="container grid-3">
        <div className="stack">
          <Logo />
          <p className="muted">
            Cinq mots par jour. Lire, prononcer et apprendre avec calme.
          </p>
        </div>
        <div className="stack">
          <strong>Explorer</strong>
          <Link href="/coran">Lire le Coran</Link>
          <Link href="/defi">Défi de 5 mots</Link>
          <Link href="/apprendre">Parcours débutant</Link>
          <Link href="/reviser">Réviser</Link>
        </div>
        <div className="stack">
          <strong>Transparence</strong>
          <Link href="/sources">Sources et validation</Link>
          <span className="muted">Les traductions, phonétiques et audios gardent une provenance vérifiable.</span>
        </div>
      </div>
    </footer>
  );
}
