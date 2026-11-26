import Link from "next/link";

export default function NotFound() {
  return (
    <main className="narrow page stack" style={{ "--gap": "16px", minHeight: "70vh", alignContent: "center" } as React.CSSProperties}>
      <span className="eyebrow plain">Erreur 404</span>
      <h1>Cette page n&apos;existe pas.</h1>
      <p className="lead">Le chemin s&apos;est perdu dans le sable. Reprenons là où tu en étais.</p>
      <div className="row">
        <Link href="/aujourdhui" className="btn primary">Aujourd&apos;hui</Link>
        <Link href="/" className="btn">Accueil</Link>
      </div>
    </main>
  );
}
