import { ArrowUpRight, CheckCircle, Question } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { LEXICON_STATUS } from "@/content/lexicon";
import { sources } from "@/content/sources";
import { tanzilNotice } from "@/lib/quran-data";
import { appConfig } from "@/config/app";

export const metadata: Metadata = { title: "Sources et relecture" };

const KIND_LABEL = {
  texte: "Texte",
  données: "Données",
  audio: "Audio",
  tajwid: "Tajwīd",
  pédagogie: "Pédagogie",
  police: "Police",
} as const;

export default function SourcesPage() {
  return (
    <main className="narrow page stack" style={{ "--gap": "26px" } as React.CSSProperties}>
      <header className="stack" style={{ "--gap": "12px" } as React.CSSProperties}>
        <span className="eyebrow plain">Transparence</span>
        <h1>D&apos;où vient chaque mot</h1>
        <p className="lead">
          Un site qui enseigne le Coran doit dire d&apos;où vient son contenu, ce qui a été vérifié et ce qui ne l&apos;a pas
          encore été.
        </p>
      </header>

      <section className="glass card stack" style={{ "--gap": "10px" } as React.CSSProperties}>
        <h2 className="h3">Ce qui est garanti</h2>
        <ul className="checklist">
          <li>Le texte arabe de chaque verset est une copie verbatim de Tanzil, contrôlée par empreinte SHA-256 à chaque mise en ligne.</li>
          <li>Aucun verset n&apos;est saisi à la main : leçons et exercices citent des références (sourate:verset:mot), vérifiées par des tests automatiques.</li>
          <li>La récitation vient d&apos;un récitant humain, jamais d&apos;une voix de synthèse.</li>
          <li>La traduction est présentée comme une traduction des sens, avec le nom de son auteur.</li>
        </ul>
      </section>

      <section className="review-banner" role="note">
        <span>
          <strong>Ce qui est en cours de relecture.</strong> Les leçons, les sens du lexique (rédigés par{" "}
          {LEXICON_STATUS.author}) et les transcriptions phonétiques n&apos;ont pas encore été validés par un enseignant
          nommé. Relecteur actuel : {LEXICON_STATUS.reviewer ?? "aucun pour l'instant"}. Tu peux signaler une erreur sur{" "}
          <a className="link" href={`${appConfig.repository}/issues`} target="_blank" rel="noreferrer">
            GitHub
          </a>
          .
        </span>
      </section>

      <section className="stack" style={{ "--gap": "10px" } as React.CSSProperties}>
        <h2>Références</h2>
        <ul className="source-cards">
          {sources.map((source) => (
            <li key={source.id} className="glass thin source-card tilt">
              <div className="row between">
                <span className="chip">{KIND_LABEL[source.kind]}</span>
                {source.verified ? (
                  <span className="chip ok"><CheckCircle weight="fill" aria-hidden="true" /> vérifiée</span>
                ) : (
                  <span className="chip draft"><Question weight="fill" aria-hidden="true" /> à confirmer</span>
                )}
              </div>
              <h3>{source.label}</h3>
              <p className="muted">{source.detail}</p>
              {source.license ? <p className="faint">Licence : {source.license}</p> : null}
              {source.url ? (
                <a className="link faint" href={source.url} target="_blank" rel="noreferrer">
                  {source.url.replace(/^https?:\/\//u, "")} <ArrowUpRight aria-hidden="true" />
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="glass card stack" style={{ "--gap": "8px" } as React.CSSProperties}>
        <h2 className="h3">Mention Tanzil</h2>
        <p className="faint">{tanzilNotice}</p>
      </section>
    </main>
  );
}
