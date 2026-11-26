import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { AdminLogin } from "@/components/admin-login";
import { AdminView } from "@/components/admin-view";
import { ADMIN_COOKIE, adminEnabled, isValidAdminToken } from "@/lib/admin-auth";
import { listUsers } from "@/lib/admin-users";

export const metadata: Metadata = { title: "Administration", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** Page cachée : aucun lien n'y mène. Sans MDP_KALIMA, elle n'existe pas (404). */
export default async function AdminPage() {
  if (!adminEnabled()) notFound();
  if (!isValidAdminToken((await cookies()).get(ADMIN_COOKIE)?.value)) {
    return (
      <main className="container page narrow stack" style={{ "--gap": "14px" } as React.CSSProperties}>
        <AdminLogin />
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
