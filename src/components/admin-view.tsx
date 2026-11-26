"use client";

import { Check, Copy, DownloadSimple, EnvelopeSimple, GoogleLogo, MagnifyingGlass, Users } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { Segmented } from "@/components/segmented";
import type { AdminUser } from "@/lib/admin-users";

type Filter = "tous" | "nouvelles";

const day = (iso: string) => new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));

export function AdminView({ users, active }: { users: AdminUser[]; active: number }) {
  const [filter, setFilter] = useState<Filter>("tous");
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((user) => (filter === "tous" || user.newsletter) && (!q || user.email.toLowerCase().includes(q) || user.name.toLowerCase().includes(q)));
  }, [users, filter, query]);

  const subscribers = users.filter((user) => user.newsletter).length;
  const viaGoogle = users.filter((user) => user.methods.includes("google")).length;

  const copy = async () => {
    await navigator.clipboard.writeText(shown.map((user) => user.email).join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <>
      <section className="stats">
        <div className="glass thin stat">
          <span className="stat-icon" aria-hidden="true"><Users weight="duotone" /></span>
          <span className="stat-value num">{users.length}</span>
          <span className="stat-label">inscrits</span>
        </div>
        <div className="glass thin stat">
          <span className="stat-icon" aria-hidden="true"><EnvelopeSimple weight="duotone" /></span>
          <span className="stat-value num">{subscribers}</span>
          <span className="stat-label">acceptent les nouvelles</span>
        </div>
        <div className="glass thin stat">
          <span className="stat-icon" aria-hidden="true"><GoogleLogo weight="bold" /></span>
          <span className="stat-value num">{viaGoogle}</span>
          <span className="stat-label">via Google</span>
        </div>
        <div className="glass thin stat">
          <span className="stat-icon" aria-hidden="true"><Check weight="bold" /></span>
          <span className="stat-value num">{active}</span>
          <span className="stat-label">actifs cette semaine</span>
        </div>
      </section>

      <section className="glass card stack" style={{ "--gap": "14px" } as React.CSSProperties}>
        <div className="admin-tools">
          <Segmented<Filter>
            label="Quels inscrits afficher"
            value={filter}
            onChange={setFilter}
            size="sm"
            options={[
              { value: "tous", label: `Tous (${users.length})` },
              { value: "nouvelles", label: `Nouvelles (${subscribers})` },
            ]}
          />
          <label className="admin-search">
            <MagnifyingGlass aria-hidden="true" />
            <input type="search" placeholder="Chercher un e-mail ou un prénom" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Chercher un inscrit" />
          </label>
        </div>
        <div className="row">
          <button type="button" className="btn small primary" onClick={copy} disabled={shown.length === 0}>
            {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />} {copied ? "Copié !" : shown.length === 1 ? "Copier l'adresse" : `Copier les ${shown.length} adresses`}
          </button>
          <a className="btn small" href={`/api/admin/inscrits${filter === "nouvelles" ? "?filtre=nouvelles" : ""}`} download>
            <DownloadSimple aria-hidden="true" /> Télécharger en CSV
          </a>
        </div>
        <p className="faint admin-note">
          Pour une lettre d&apos;information, n&apos;écris qu&apos;aux personnes de l&apos;onglet « Nouvelles » : elles l&apos;ont accepté (RGPD). Les autres
          ne doivent recevoir que des messages liés à leur compte.
        </p>

        {shown.length === 0 ? (
          <p className="muted">Personne pour l&apos;instant.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">E-mail</th>
                  <th scope="col">Prénom</th>
                  <th scope="col">Inscription</th>
                  <th scope="col">Nouvelles</th>
                  <th scope="col">Méthode</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((user) => (
                  <tr key={user.email}>
                    <td className="admin-email">{user.email}</td>
                    <td>{user.name}</td>
                    <td className="num">{day(user.createdAt)}</td>
                    <td>{user.newsletter ? <span className="admin-pill yes">oui</span> : <span className="admin-pill">non</span>}</td>
                    <td>{user.methods.join(" + ") || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
