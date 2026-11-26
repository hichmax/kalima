import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { AdminView } from "@/components/admin-view";
import { listUsers } from "@/lib/admin-users";
import { auth, isAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Administration", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers(), query: { disableCookieCache: true } });
  if (!isAdmin(session?.user)) {
    return (
      <main className="container page narrow stack" style={{ "--gap": "14px" } as React.CSSProperties}>
        <section className="glass card stack" style={{ "--gap": "10px" } as React.CSSProperties}>
          <span className="eyebrow plain">Administration</span>
          <h1>Accès réservé</h1>
          <p className="muted">Cette page est réservée aux administrateurs de Kalima, connectés avec Google.</p>
          <Link href="/connexion?suite=/admin" className="btn primary" style={{ justifySelf: "start" }}>
            Se connecter
          </Link>
        </section>
      </main>
    );
  }
  const users = await listUsers();
  // eslint-disable-next-line react-hooks/purity -- rendu serveur à la demande : l'heure courante est voulue
  const weekAgo = Date.now() - 7 * 864e5;
  const active = users.filter((user) => user.lastSync && Date.parse(user.lastSync) > weekAgo).length;
  return (
    <main className="container page stack" style={{ "--gap": "20px" } as React.CSSProperties}>
      <header className="stack" style={{ "--gap": "8px" } as React.CSSProperties}>
        <span className="eyebrow plain">Administration</span>
        <h1>Les inscrits</h1>
        <p className="lead">Toutes les adresses e-mail, à copier ou télécharger en CSV (Excel, Google Sheets, Brevo…).</p>
      </header>
      <AdminView users={users} active={active} />
    </main>
  );
}
