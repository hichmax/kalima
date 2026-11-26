"use client";

import { ArrowClockwise, ArrowRight, ChartLineUp, CheckCircle, CloudArrowUp, EnvelopeSimple, SignOut, Trash, WarningCircle } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { syncNow, useSyncStatus } from "@/lib/account-sync";
import { authClient, signOut, useSession } from "@/lib/auth-client";

function since(iso: string | null) {
  if (!iso) return null;
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

export function AccountView() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { data: session, isPending } = useSession();
  const sync = useSyncStatus();
  const [leaving, setLeaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [password, setPassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [hasPassword, setHasPassword] = useState(true);
  const [savingNews, setSavingNews] = useState(false);
  const userId = session?.user.id;

  useEffect(() => {
    if (!userId) return;
    let alive = true;
    void authClient.listAccounts().then(({ data }) => {
      if (alive && data) setHasPassword(data.some((account) => account.providerId === "credential"));
    });
    return () => {
      alive = false;
    };
  }, [userId]);

  if (isPending) return <div className="dashboard-skeleton" aria-busy="true" />;

  if (!session) {
    return (
      <section className="glass card stack account-empty" style={{ "--gap": "12px" } as React.CSSProperties}>
        <span className="eyebrow plain">Mon compte</span>
        <h1>Tu n&apos;es pas connecté·e</h1>
        <p className="muted">Ta progression est sur cet appareil. Connecte-toi pour la sauvegarder et la retrouver partout.</p>
        <div className="row">
          <Link href="/connexion?suite=/compte" className="btn primary">
            Se connecter <ArrowRight aria-hidden="true" />
          </Link>
          <Link href="/connexion?mode=inscription&suite=/compte" className="btn">
            Créer un compte
          </Link>
        </div>
      </section>
    );
  }

  const { user } = session;
  const initial = (user.name || user.email).trim().charAt(0).toUpperCase();
  const statusText =
    sync.state === "syncing"
      ? "Synchronisation…"
      : sync.state === "error"
        ? "Échec de la synchronisation, nouvel essai automatique"
        : sync.state === "ok"
          ? `Synchronisé${since(sync.at) ? ` à ${since(sync.at)}` : ""}`
          : "En attente";

  const leave = async () => {
    setLeaving(true);
    await signOut();
    router.push("/aujourdhui");
    router.refresh();
  };

  const remove = async (event: FormEvent) => {
    event.preventDefault();
    setDeleting(true);
    setDeleteError(null);
    const { error } = await authClient.deleteUser(hasPassword ? { password } : {});
    if (error) {
      setDeleting(false);
      setDeleteError(
        error.code === "SESSION_EXPIRED"
          ? "Par sécurité, reconnecte-toi avec Google puis recommence (connexion de moins d'un jour exigée)."
          : error.code === "INVALID_PASSWORD"
            ? "Mot de passe incorrect."
            : "Suppression impossible pour l'instant. Réessaie plus tard.",
      );
      return;
    }
    router.push("/aujourdhui");
    router.refresh();
  };

  return (
    <>
      <motion.section
        className="glass float card account-hero"
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={reduce ? { duration: 0.15 } : { type: "spring", bounce: 0.15, duration: 0.6 }}
      >
        <span className="account-avatar" aria-hidden="true">
          {initial}
        </span>
        <div className="account-id">
          <span className="eyebrow plain">Mon compte</span>
          <h1>{user.name || "Bienvenue"}</h1>
          <p className="muted account-email">{user.email}</p>
        </div>
      </motion.section>

      <section className="glass card stack" style={{ "--gap": "14px" } as React.CSSProperties}>
        <div className="account-sync" data-state={sync.state} role="status">
          <span className="account-sync-icon" aria-hidden="true">
            {sync.state === "error" ? <WarningCircle weight="fill" /> : sync.state === "ok" ? <CheckCircle weight="fill" /> : <CloudArrowUp weight="duotone" />}
          </span>
          <div>
            <strong>{statusText}</strong>
            <p className="faint">Chaque changement est envoyé quelques secondes plus tard. Plusieurs appareils peuvent servir en même temps : leurs progrès s&apos;additionnent.</p>
          </div>
        </div>
        <div className="row">
          <button type="button" className="btn small" onClick={() => void syncNow()} disabled={sync.state === "syncing"}>
            <ArrowClockwise aria-hidden="true" /> Synchroniser maintenant
          </button>
          <Link href="/progression" className="btn small ghost">
            <ChartLineUp aria-hidden="true" /> Voir ma progression
          </Link>
        </div>
      </section>

      <section className="glass card stack" style={{ "--gap": "10px" } as React.CSSProperties}>
        <h2 className="h3">Nouvelles de Kalima</h2>
        <label className="account-toggle">
          <span className="account-toggle-text">
            <EnvelopeSimple weight="duotone" aria-hidden="true" />
            <span>
              <strong>Recevoir les nouvelles par e-mail</strong>
              <span className="faint">Nouveaux défis, nouvelles leçons. Jamais de publicité, jamais revendu.</span>
            </span>
          </span>
          <input
            type="checkbox"
            role="switch"
            checked={Boolean(user.newsletter)}
            disabled={savingNews}
            onChange={async (event) => {
              setSavingNews(true);
              await authClient.updateUser({ newsletter: event.target.checked });
              setSavingNews(false);
            }}
          />
          <span className="account-switch" aria-hidden="true" />
        </label>
      </section>

      <section className="glass card stack" style={{ "--gap": "10px" } as React.CSSProperties}>
        <h2 className="h3">Se déconnecter</h2>
        <p className="muted">Ta progression reste aussi sur cet appareil. Tu pourras la retrouver en te reconnectant.</p>
        <button type="button" className="btn small" style={{ justifySelf: "start" }} onClick={leave} disabled={leaving}>
          <SignOut aria-hidden="true" /> {leaving ? "Déconnexion…" : "Se déconnecter"}
        </button>
      </section>

      <section className="glass card stack account-danger" style={{ "--gap": "10px" } as React.CSSProperties}>
        <h2 className="h3">Supprimer mon compte</h2>
        <p className="muted">Ton compte et la copie en ligne de ta progression sont effacés définitivement. La copie sur cet appareil n&apos;est pas touchée.{" "}
          <Link href="/confidentialite" className="inline-link">Ce que Kalima garde</Link>
        </p>
        <AnimatePresence initial={false} mode="wait">
          {confirmDelete ? (
            <motion.form
              key="confirm"
              className="stack"
              style={{ "--gap": "10px" } as React.CSSProperties}
              onSubmit={remove}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {hasPassword ? (
                <label className="account-field">
                  <span>Confirme avec ton mot de passe</span>
                  <input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
                </label>
              ) : (
                <p className="faint">Compte Google : aucune saisie demandée. Cette action est définitive.</p>
              )}
              {deleteError ? (
                <p className="account-error" role="alert">
                  {deleteError}
                </p>
              ) : null}
              <div className="row">
                <button type="submit" className="btn small danger" disabled={deleting || (hasPassword && !password)}>
                  <Trash aria-hidden="true" /> {deleting ? "Suppression…" : "Supprimer définitivement"}
                </button>
                <button type="button" className="btn small ghost" onClick={() => setConfirmDelete(false)}>
                  Annuler
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.div key="ask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <button type="button" className="btn small ghost danger-text" onClick={() => setConfirmDelete(true)}>
                <Trash aria-hidden="true" /> Supprimer mon compte…
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </>
  );
}
