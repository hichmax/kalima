import {
  ArrowRight,
  BookOpenText,
  CheckCircle,
  Headphones,
  ShieldCheck,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { AyahCard } from "@/components/ayah-card";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { featuredAyah } from "@/data/quran-fixtures";

export default function LandingPage() {
  return (
    <>
      <PublicHeader />
      <main id="main-content">
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">Lire · prononcer · mémoriser</p>
              <h1 className="display">
                Kalima, apprends l’arabe du Coran mot après mot.
              </h1>
              <p className="lead">
                Un rituel simple de 5 mots par jour : découvre leur sens,
                écoute leur prononciation, retrouve-les dans le Coran et avance
                sans jargon ni pression.
              </p>
              <div className="hero-actions">
                <Link className="btn btn-primary" href="/onboarding">
                  Apprendre mes 5 premiers mots <ArrowRight size={18} />
                </Link>
                <Link className="btn btn-secondary" href="/coran">
                  Découvrir le lecteur
                </Link>
              </div>
              <p className="hero-note">
                <CheckCircle size={17} />
                Sans compte · gratuit · progression conservée sur l’appareil
              </p>
            </div>
            <div className="hero-study-card">
              <AyahCard ayah={featuredAyah} preview />
              <div className="floating-word" aria-label="Aperçu d’une fiche de mot">
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <span className="quran-text" lang="ar" dir="rtl">رَحْمَٰن</span>
                  <Headphones size={18} aria-hidden="true" />
                </div>
                <p><strong>Le Tout Miséricordieux</strong></p>
                <p className="muted" style={{ fontSize: ".76rem" }}>
                  Phonétique : ar-Raḥmān
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="trust-strip">
          <div className="container trust-strip-inner">
            <span className="trust-item"><BookOpenText size={18} /> Texte canonique séparé</span>
            <span className="trust-item"><ShieldCheck size={18} /> Provenance visible</span>
            <span className="trust-item"><Sparkle size={18} /> Pédagogie progressive</span>
            <span className="trust-item"><Headphones size={18} /> Écoute et répétition</span>
          </div>
        </div>

        <section className="landing-section" id="methode">
          <div className="container">
            <div className="landing-section-head">
              <p className="eyebrow">Une méthode douce et structurée</p>
              <h2 className="section-title">
                Chaque rencontre avec un verset devient une petite victoire.
              </h2>
              <p className="lead">
                Tu lis d’abord avec calme. Quand tu le souhaites, tu ouvres
                l’étude, découvres les mots, puis les retrouves au bon moment.
              </p>
            </div>
            <div className="method-rail">
              {[
                ["01", "Découvrir", "Chaque jour, cinq mots fréquents et utiles forment un objectif clair et atteignable."],
                ["02", "Prononcer", "La phonétique et l’audio de chaque mot t’aident à le lire à voix haute."],
                ["03", "Retrouver", "Les mots réapparaissent dans leurs versets pour relier vocabulaire et révélation."],
                ["04", "Retenir", "Ils reviennent grâce à une répétition espacée calme et personnalisée."],
              ].map(([number, title, text]) => (
                <article className="method-step" key={number}>
                  <span className="method-step-number">{number}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-section" id="decouvrir">
          <div className="container product-showcase">
            <div className="lesson-path-preview" aria-label="Aperçu du parcours débutant">
              {[
                ["1", "Le sens de lecture", "4 min", true],
                ["ب", "Tes trois premières lettres", "7 min", false],
                ["ـ", "Les lettres se rejoignent", "8 min", false],
                ["َ", "Les petites voyelles", "9 min", false],
              ].map(([mark, title, duration, active]) => (
                <div className={`lesson-node ${active ? "active" : ""}`} key={title as string}>
                  <span className="lesson-node-mark quran-text">{mark}</span>
                  <span>
                    <strong>{title}</strong>
                    <small>{duration}</small>
                  </span>
                </div>
              ))}
            </div>
            <div className="stack" style={{ gap: 22 }}>
              <p className="eyebrow">Débutant signifie vraiment débutant</p>
              <h2 className="section-title">
                Tu peux commencer sans connaître une seule lettre.
              </h2>
              <p className="lead">
                Le parcours introduit d’abord les gestes simples : où poser les
                yeux, comment reconnaître une forme, puis comment lui donner un
                son. Les noms techniques viennent seulement quand ils aident.
              </p>
              <Link className="btn btn-primary" href="/apprendre" style={{ justifySelf: "start" }}>
                Voir le parcours <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        <section className="landing-section">
          <div className="container stack" style={{ gap: 34 }}>
            <div className="landing-section-head">
              <p className="eyebrow">Réviser sans pression</p>
              <h2 className="section-title">Une seule carte. Un seul souvenir à retrouver.</h2>
              <p className="lead">
                Les exercices commencent simplement, puis évoluent vers l’écoute,
                la prononciation et les mots rencontrés dans leurs versets.
              </p>
            </div>
            <div className="review-preview-card">
              <p className="quran-text" lang="ar" dir="rtl">ٱلْحَمْدُ</p>
              <div>
                <p className="muted">Que signifie ce mot dans le verset ?</p>
                <strong>La louange</strong>
              </div>
              <div className="review-preview-actions" aria-hidden="true">
                <span>Difficile</span>
                <span>À revoir</span>
                <span>Correct</span>
                <span>Facile</span>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-section" id="sources">
          <div className="container product-showcase">
            <div className="stack" style={{ gap: 22 }}>
              <p className="eyebrow">Confiance par la transparence</p>
              <h2 className="section-title">
                Le texte du Coran et les aides d’apprentissage restent clairement séparés.
              </h2>
              <p className="lead">
                Le texte canonique demeure immuable. Les traductions,
                phonétiques et audios indiquent leurs sources, tandis que les
                vérifications internes restent dans l’administration.
              </p>
              <Link className="btn btn-secondary" href="/sources" style={{ justifySelf: "start" }}>
                Consulter les sources
              </Link>
            </div>
            <div className="card card-pad stack">
              <span className="chip chip-success"><ShieldCheck size={16} /> Séparation stricte des données</span>
              <hr className="divider" />
              <div>
                <p className="eyebrow">Texte arabe</p>
                <h3 style={{ margin: 0 }}>Source canonique, lecture seule</h3>
              </div>
              <div>
                <p className="eyebrow">Traduction & pédagogie</p>
                <h3 style={{ margin: 0 }}>Provenance et validation indépendantes</h3>
              </div>
              <div>
                <p className="eyebrow">Historique</p>
                <h3 style={{ margin: 0 }}>Chaque modification reste traçable</h3>
              </div>
            </div>
          </div>
        </section>

        <section className="final-cta">
          <div className="container final-cta-card">
            <p className="eyebrow">Ton premier défi prend moins de cinq minutes</p>
            <h2 className="section-title">Cinq mots aujourd’hui. Un texte de moins en moins inconnu demain.</h2>
            <p>
              Le parcours s’adapte à ton niveau, à ton objectif et au temps que
              tu veux consacrer aujourd’hui.
            </p>
            <Link className="btn btn-secondary" href="/onboarding">
              Créer mon parcours <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
