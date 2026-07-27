import Link from "next/link";
import { CloudSlash } from "@phosphor-icons/react/dist/ssr";
import { Logo } from "@/components/logo";

export default function OfflinePage() {
  return (
    <main className="onboarding-page" id="main-content">
      <header className="onboarding-header"><Logo /></header>
      <section className="admin-lock card card-pad">
        <span className="admin-lock-icon"><CloudSlash size={28} /></span>
        <p className="eyebrow">Hors connexion</p>
        <h1 className="page-title">Le calme continue, même sans réseau.</h1>
        <p className="lead">
          Les pages déjà ouvertes, ta progression et les contenus choisis restent disponibles.
          Les nouvelles sourates et récitations se chargeront au retour de la connexion.
        </p>
        <Link className="btn btn-primary" href="/dashboard">Revenir à mon espace</Link>
      </section>
    </main>
  );
}
