import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Confidentialité",
  description: "Quelles données Kalima garde, pourquoi, combien de temps, et comment les effacer.",
};

/** Mise à jour de cette politique (à changer à chaque modification du contenu). */
const UPDATED = "26 novembre 2026";

/**
 * Politique de confidentialité. Elle décrit exactement ce que fait le code (src/lib/auth.ts,
 * src/app/api/compte, src/lib/admin-auth.ts) : à mettre à jour si le traitement change.
 * Adresse de contact : variable d'environnement CONTACT_EMAIL.
 */
export default function ConfidentialitePage() {
  const contact = process.env.CONTACT_EMAIL?.trim();
  return (
    <main className="container page stack narrow privacy" style={{ "--gap": "18px" } as React.CSSProperties}>
      <header className="stack" style={{ "--gap": "10px" } as React.CSSProperties}>
        <span className="eyebrow plain">Confidentialité</span>
        <h1>Tes données, simplement</h1>
        <p className="lead">
          Kalima est gratuit, sans publicité et sans traceur. Voici exactement ce que le site garde, pourquoi, et comment tout
          effacer. Mise à jour : {UPDATED}.
        </p>
      </header>

      <section className="glass card stack" style={{ "--gap": "10px" } as React.CSSProperties}>
        <h2 className="h3">En bref</h2>
        <ul className="privacy-list">
          <li>Sans compte, ta progression reste <strong>uniquement sur ton appareil</strong> : rien n&apos;est envoyé.</li>
          <li>Le compte est <strong>facultatif</strong> : il sert seulement à retrouver ta progression sur tes appareils.</li>
          <li>Aucune publicité, aucun outil de mesure d&apos;audience, aucune revente ni location de données.</li>
          <li>Tu peux <strong>supprimer ton compte en un clic</strong>, et exporter ta progression à tout moment.</li>
        </ul>
      </section>

      <section className="glass card stack" style={{ "--gap": "10px" } as React.CSSProperties}>
        <h2 className="h3">Sans compte</h2>
        <p className="muted">
          Ta progression (jours terminés, cartes de révision, réglages) est enregistrée dans le stockage local de ton
          navigateur. Elle ne quitte pas ton appareil. Tu peux l&apos;exporter ou l&apos;effacer dans les{" "}
          <Link href="/reglages" className="inline-link">Réglages</Link>.
        </p>
      </section>

      <section className="glass card stack" style={{ "--gap": "10px" } as React.CSSProperties}>
        <h2 className="h3">Avec un compte</h2>
        <p className="muted">Si tu crées un compte, Kalima garde :</p>
        <ul className="privacy-list">
          <li>ton adresse e-mail et ton prénom ;</li>
          <li>ton mot de passe, jamais en clair : seulement une empreinte chiffrée (algorithme scrypt) ;</li>
          <li>si tu te connectes avec Google : ton nom, ton adresse e-mail et l&apos;adresse de ta photo de profil, transmis par Google ;</li>
          <li>ta progression (le même contenu que sur ton appareil), pour la synchroniser ;</li>
          <li>
            pour chaque connexion active : l&apos;adresse IP et le type de navigateur, afin de sécuriser ton compte ; la
            session expire au bout de 60 jours sans utilisation ;
          </li>
          <li>ton choix de recevoir ou non les nouvelles de Kalima par e-mail (non par défaut).</li>
        </ul>
        <p className="muted">
          Pour limiter les abus (essais de mots de passe en série), le site compte aussi brièvement les requêtes par adresse
          IP. Un lien de réinitialisation de mot de passe expire au bout d&apos;une heure.
        </p>
      </section>

      <section className="glass card stack" style={{ "--gap": "10px" } as React.CSSProperties}>
        <h2 className="h3">Pourquoi</h2>
        <ul className="privacy-list">
          <li><strong>Faire fonctionner ton compte</strong> (connexion, synchronisation) : c&apos;est le service que tu demandes.</li>
          <li><strong>Sécurité</strong> (adresses IP, limitation des essais) : intérêt légitime à protéger les comptes.</li>
          <li>
            <strong>Nouvelles par e-mail</strong> : uniquement si tu as coché la case, retirable à tout moment dans{" "}
            <Link href="/compte" className="inline-link">Mon compte</Link>. Si tu as moins de 15 ans, demande l&apos;accord
            d&apos;un parent avant de t&apos;y inscrire.
          </li>
        </ul>
        <p className="muted">Les adresses e-mail ne servent qu&apos;à Kalima : jamais vendues, jamais partagées à des fins commerciales.</p>
      </section>

      <section className="glass card stack" style={{ "--gap": "10px" } as React.CSSProperties}>
        <h2 className="h3">Où sont les données</h2>
        <ul className="privacy-list">
          <li><strong>Base de données</strong> : Neon (PostgreSQL), hébergée à Francfort, dans l&apos;Union européenne.</li>
          <li><strong>Hébergement du site</strong> : Vercel ; le serveur qui traite les comptes fonctionne à Francfort.</li>
          <li><strong>E-mails</strong> (réinitialisation du mot de passe) : envoyés par un service d&apos;envoi d&apos;e-mails.</li>
          <li><strong>Connexion Google</strong> (si tu la choisis) : Google sait que tu te connectes à Kalima.</li>
          <li>
            <strong>Récitation</strong> : les fichiers audio sont chargés par ton navigateur depuis les serveurs de
            Quran.Foundation, qui voient donc ton adresse IP comme pour tout site. La traduction et le texte passent par notre
            serveur, sans aucune donnée te concernant.
          </li>
        </ul>
      </section>

      <section className="glass card stack" style={{ "--gap": "10px" } as React.CSSProperties}>
        <h2 className="h3">Cookies</h2>
        <p className="muted">
          Seulement les cookies indispensables à la connexion (garder ta session ouverte). Aucun cookie de publicité ni de
          mesure d&apos;audience : c&apos;est pourquoi il n&apos;y a pas de bandeau à accepter.
        </p>
      </section>

      <section className="glass card stack" style={{ "--gap": "10px" } as React.CSSProperties}>
        <h2 className="h3">Combien de temps</h2>
        <p className="muted">
          Tant que ton compte existe. Quand tu le supprimes, ton compte, tes sessions et la copie en ligne de ta progression
          sont effacés immédiatement et définitivement. La copie sur ton appareil n&apos;est pas touchée.
        </p>
      </section>

      <section className="glass card stack" style={{ "--gap": "10px" } as React.CSSProperties}>
        <h2 className="h3">Tes droits</h2>
        <p className="muted">
          Selon le RGPD, tu peux accéder à tes données, les corriger, les effacer, en obtenir une copie, t&apos;opposer à leur
          utilisation et retirer ton consentement. Le plus simple :
        </p>
        <ul className="privacy-list">
          <li>
            <strong>Effacer</strong> : <Link href="/compte" className="inline-link">Mon compte</Link> → « Supprimer mon compte ».
          </li>
          <li>
            <strong>Obtenir une copie</strong> de ta progression : <Link href="/reglages" className="inline-link">Réglages</Link> → « Exporter ».
          </li>
          <li>
            <strong>Ne plus recevoir de nouvelles</strong> : <Link href="/compte" className="inline-link">Mon compte</Link> → décocher « Recevoir les nouvelles ».
          </li>
        </ul>
        <p className="muted">
          {contact ? (
            <>
              Pour toute autre demande : <a className="inline-link" href={`mailto:${contact}`}>{contact}</a>.{" "}
            </>
          ) : (
            <>Pour toute autre demande, utilise l&apos;adresse de contact indiquée sur cette page dès qu&apos;elle sera publiée. </>
          )}
          Tu peux aussi adresser une réclamation à la CNIL (
          <a className="inline-link" href="https://www.cnil.fr/fr/plaintes" rel="noopener noreferrer" target="_blank">
            cnil.fr
          </a>
          ).
        </p>
      </section>

      <p className="faint">
        Kalima est un projet personnel, gratuit, fait pour aider à apprendre. Cette page sera mise à jour si quelque chose
        change, avec une nouvelle date.
      </p>
    </main>
  );
}
