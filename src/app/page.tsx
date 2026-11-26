import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { DesertStage, DesertWindow } from "@/components/desert";
import { Reveal } from "@/components/reveal";
import { WEEKS } from "@/content/program";
import { QuranText } from "@/components/quran";
import { lexiconSummary } from "@/lib/learning-data";
import { resolveRef, surahIndex } from "@/lib/quran-data";
import lexiconStats from "@/generated/lexicon-stats.json";

const coverage300 = lexiconStats.lemmas.find((l) => l.rank === 300)?.coverage ?? 74;

const RITUAL = [
  ["Réviser", "les cartes du jour (FSRS)", "5 min"],
  ["Apprendre", "une leçon, 15 à 30 questions", "10 min"],
  ["Mémoriser", "écouter, répéter, réciter", "15 min"],
  ["Comprendre", "10 mots fréquents", "5 min"],
  ["Défi", "5 questions express", "2 min"],
] as const;

const CORE_SURAHS = [1, 112, 113, 114, 108, 103, 110, 106];

export default async function Home() {
  // Texte coranique toujours issu de Tanzil, jamais saisi à la main.
  const basmala = await resolveRef("1:1:1-2");
  const surahNames = CORE_SURAHS.map((n) => surahIndex[n - 1].ar);
  return (
    <DesertStage>
      <div className="desert-veil" aria-hidden="true" />
      <header className="landing-top container">
        <Link href="/" className="brand">
          <span className="brand-mark" lang="ar">كَلِمَة</span>
          <span>Kalima</span>
        </Link>
        <nav className="row" style={{ "--gap": "6px" } as React.CSSProperties} aria-label="Navigation">
          <Link href="/programme" className="btn small ghost">Programme</Link>
          <Link href="/sources" className="btn small ghost">Sources</Link>
          <Link href="/aujourdhui" className="btn small">Ouvrir l&apos;app</Link>
        </nav>
      </header>

      <main id="contenu">
        <section className="hero container">
          <Reveal className="hero-copy stack" style={{ "--gap": "20px" } as React.CSSProperties}>
            <span className="eyebrow">Le Coran en 30 jours</span>
            <h1 className="hero-title">
              Lis le Coran.
              <br />
              Comprends ses mots.
              <br />
              <span className="hero-accent">En trente jours.</span>
            </h1>
            <p className="lead">
              Trente minutes par jour pour lire le texte du muṣḥaf, mémoriser huit sourates, poser les bases du tajwīd et
              reconnaître les 300 mots qui forment {Math.round(coverage300)} % du Coran.
            </p>
            <div className="row">
              <Link href="/programme/1" className="btn primary">
                Commencer le jour 1 <ArrowRight aria-hidden="true" />
              </Link>
              <Link href="/programme" className="btn dashed">
                Voir le programme
              </Link>
            </div>
          </Reveal>
        </section>

        <div className="mat">
          <section className="container landing-intro">
            <div className="intro-grid">
              <h2>Un rituel court, chaque jour, plutôt que de longues heures une fois.</h2>
              <p className="muted">
                Kalima applique ce que la recherche montre de plus solide : se tester plutôt que relire, espacer les
                révisions, mélanger les questions. Le texte coranique vient de Tanzil, la récitation d&apos;un récitant
                humain. Ce qui n&apos;est pas encore relu est signalé.
              </p>
              <Link href="/sources" className="btn dashed intro-cta">
                Nos sources <ArrowUpRight aria-hidden="true" />
              </Link>
            </div>
          </section>

          <section className="container bento" aria-label="Kalima en bref">
            <DesertWindow className="span-4 tall tile-pad tile-ritual">
              <h3 className="eyebrow tile-head">Chaque jour</h3>
              <ul className="ritual">
                {RITUAL.map(([name, detail, time]) => (
                  <li key={name}>
                    <span className="ritual-time num">{time}</span>
                    <span className="ritual-name">{name}</span>
                    <span className="ritual-detail">{detail}</span>
                  </li>
                ))}
              </ul>
            </DesertWindow>

            <div className="solid-tile span-4 tile-pad tile-center">
              <h3 className="eyebrow tile-head">Le vocabulaire</h3>
              <p className="big-number num">{coverage300.toFixed(0)} %</p>
              <p className="muted center">
                des occurrences du Coran sont couvertes par ses 300 mots les plus fréquents.
              </p>
              <p className="faint center">
                Calcul Kalima sur {lexiconSummary.totalStems.toLocaleString("fr-FR")} mots du Quranic Arabic Corpus
                ({lexiconSummary.distinctLemmas.toLocaleString("fr-FR")} lemmes distincts).
              </p>
            </div>

            <DesertWindow className="span-4 tile-pad tile-center tile-word">
              <h3 className="eyebrow tile-head">Un mot</h3>
              <p className="ar tile-arabic" lang="ar">كَلِمَة</p>
              <p className="center tile-word-fr">kalima · une parole, un mot</p>
            </DesertWindow>

            <div className="solid-tile span-4 tile-pad">
              <h3 className="eyebrow tile-head">Huit sourates</h3>
              <ul className="surah-cloud" dir="rtl">
                {surahNames.map((name) => (
                  <li key={name} className="ar" lang="ar">{name}</li>
                ))}
              </ul>
              <p className="faint center">Et trois sourates bonus (105, 107, 109) pour celles et ceux qui lisent déjà.</p>
            </div>

            <div className="solid-tile span-8 tile-pad">
              <h3 className="eyebrow tile-head">Quatre semaines</h3>
              <ol className="weeks">
                {WEEKS.slice(0, 4).map((week) => (
                  <li key={week.week}>
                    <span className="week-no num">S{week.week}</span>
                    <span className="week-title">{week.title}</span>
                    <span className="week-sub">{week.subtitle}</span>
                  </li>
                ))}
              </ol>
            </div>

            <DesertWindow className="span-4 tile-pad tile-honest">
              <h3 className="eyebrow tile-head">Ce qu&apos;on ne promet pas</h3>
              <p>
                Une application ne certifie pas une récitation. Fais-toi écouter par une personne qualifiée : Kalima te
                prépare à ce moment, elle ne le remplace pas.
              </p>
            </DesertWindow>

            <div className="solid-tile span-4 tile-pad">
              <h3 className="eyebrow tile-head">Les sources</h3>
              <ul className="source-list">
                <li><strong>Texte</strong> Tanzil, Uthmani 1.1</li>
                <li><strong>Mots</strong> Quranic Arabic Corpus</li>
                <li><strong>Traduction des sens</strong> M. Hamidullah</li>
                <li><strong>Récitation</strong> M. R. al-ʿAfāsī</li>
                <li><strong>Tajwīd</strong> Tuḥfat al-Aṭfāl, al-Jazariyya</li>
              </ul>
            </div>

            <DesertWindow className="span-8 tile-pad tile-cta">
              <div className="stack" style={{ "--gap": "14px" } as React.CSSProperties}>
                <span className="eyebrow plain">Jour 1</span>
                <h2>Le premier mot du Coran commence par un bāʾ.</h2>
                <QuranText words={basmala.words} className="cta-basmala" />
                <Link href="/programme/1" className="btn primary">
                  Commencer maintenant <ArrowRight aria-hidden="true" />
                </Link>
              </div>
            </DesertWindow>
          </section>

          <footer className="container landing-footer">
            <p className="faint">
              Texte coranique : Tanzil Project (CC BY 3.0, tanzil.net). Morphologie : Quranic Arabic Corpus (GPL).
              Traduction et récitation : Quran.Foundation. Police : Amiri Quran (OFL). Vidéo : GetLayers.
            </p>
            <div className="row">
              <Link href="/sources" className="link faint">Sources et licences</Link>
              <Link href="/reglages" className="link faint">Exporter ma progression</Link>
            </div>
          </footer>
        </div>
      </main>
    </DesertStage>
  );
}
