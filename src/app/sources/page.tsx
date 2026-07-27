import type { Metadata } from "next";
import { ArrowLeft, ArrowSquareOut, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { contentSources } from "@/data/sources";

export const metadata: Metadata = {
  title: "Sources et validation",
};

export default function SourcesPage() {
  return (
    <main className="sources-page" id="main-content">
      <header className="sources-header">
        <Logo />
        <div className="row">
          <ThemeToggle />
          <Link className="btn btn-secondary" href="/"><ArrowLeft size={18} /> Accueil</Link>
        </div>
      </header>
      <section className="sources-hero">
        <p className="eyebrow">Transparence éditoriale</p>
        <h1 className="display">Savoir d’où vient chaque mot.</h1>
        <p className="lead">
          {`Kalima sépare le texte canonique des traductions, phonétiques,
          audios et annotations linguistiques utilisées pour apprendre.`}
        </p>
      </section>
      <section className="sources-list">
        {contentSources.map((source, index) => (
          <article className="source-card card" key={source.id}>
            <span className="source-number">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <p className="eyebrow">{source.version}</p>
              <h2>{source.label}</h2>
              <p className="muted">{source.license}</p>
              <span className="chip">Consulté le {source.accessedAt}</span>
            </div>
            <a className="btn btn-secondary btn-icon" href={source.url} target="_blank" rel="noreferrer" aria-label={`Ouvrir ${source.label}`}>
              <ArrowSquareOut size={20} />
            </a>
          </article>
        ))}
      </section>
      <section className="source-principle card card-pad">
        <ShieldCheck size={36} color="var(--gold)" />
        <div>
          <h2>Le texte arabe canonique est en lecture seule.</h2>
          <p className="muted">
            L’administration peut corriger une traduction ou une phonétique,
            ajouter une source ou rejeter une fiche. Elle ne peut pas modifier
            le texte, les numéros, l’ordre ou les signes du Coran.
          </p>
        </div>
      </section>
    </main>
  );
}
