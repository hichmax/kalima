import Link from "next/link";

/** Affiché partout où un contenu n'a pas encore été relu par une personne nommée. */
export function ReviewBanner() {
  return (
    <p className="review-banner" role="note">
      <span>
        <strong>Contenu en cours de relecture.</strong> Cette leçon a été rédigée par Kalima à partir des sources citées,
        mais n&apos;a pas encore été validée par un enseignant nommé. Fais toujours écouter ta récitation à une personne
        qualifiée. <Link href="/sources" className="link">Voir les sources</Link>
      </span>
    </p>
  );
}
