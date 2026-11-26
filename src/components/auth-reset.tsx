"use client";

import { ArrowLeft, ArrowRight, CheckCircle, EnvelopeSimple, Eye, EyeSlash, WarningCircle } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";

function ErrorLine({ message }: { message: string | null }) {
  return (
    <AnimatePresence>
      {message ? (
        <motion.p key={message} className="auth-error" role="alert" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <WarningCircle weight="fill" aria-hidden="true" /> {message}
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}

/** Étape 1 : demander le lien par e-mail. La réponse est la même que le compte existe ou non. */
export function ForgotPassword({ initialEmail, onBack }: { initialEmail: string; onBack: () => void }) {
  const [email, setEmail] = useState(initialEmail);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Cette adresse e-mail n'a pas l'air valide.");
    setBusy(true);
    setError(null);
    const { error: failure } = await authClient.requestPasswordReset({ email: email.trim(), redirectTo: "/connexion/nouveau-mot-de-passe" });
    setBusy(false);
    if (failure) {
      setError(failure.status === 429 ? "Trop de demandes. Attends une minute." : "L'envoi a échoué. Réessaie dans un instant.");
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="auth-done" role="status">
        <span className="auth-done-icon">
          <EnvelopeSimple weight="fill" aria-hidden="true" />
        </span>
        <h2 id="auth-heading">Regarde ta boîte mail</h2>
        <p className="muted">
          Si un compte existe pour <strong>{email.trim()}</strong>, un lien vient de partir. Il est valable une heure. Pense aux courriers indésirables.
        </p>
        <button type="button" className="btn block" onClick={onBack}>
          <ArrowLeft aria-hidden="true" /> Retour à la connexion
        </button>
      </div>
    );
  }

  return (
    <div className="auth-step">
      <div className="auth-card-head">
        <h2 id="auth-heading">Mot de passe oublié</h2>
        <p className="muted">Indique ton e-mail : on t&apos;envoie un lien pour en choisir un nouveau.</p>
      </div>
      <form className="auth-form" onSubmit={submit} noValidate>
        <label className="auth-field">
          <span>E-mail</span>
          <input type="email" autoComplete="email" inputMode="email" placeholder="toi@exemple.fr" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <ErrorLine message={error} />
        <button type="submit" className="btn primary block auth-submit" disabled={busy}>
          {busy ? <span className="auth-spinner dark" aria-hidden="true" /> : null} Envoyer le lien {busy ? null : <ArrowRight aria-hidden="true" />}
        </button>
      </form>
      <button type="button" className="btn ghost block" onClick={onBack}>
        <ArrowLeft aria-hidden="true" /> Retour
      </button>
    </div>
  );
}

/** Étape 2 : depuis le lien reçu, choisir le nouveau mot de passe. */
export function NewPassword({ token, invalid }: { token: string | null; invalid: boolean }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (invalid || !token) {
    return (
      <div className="auth-done">
        <span className="auth-done-icon">
          <WarningCircle weight="fill" aria-hidden="true" />
        </span>
        <h2 id="auth-heading">Lien expiré</h2>
        <p className="muted">Ce lien n&apos;est plus valable (il dure une heure et ne sert qu&apos;une fois). Demande-en un nouveau.</p>
        <Link href="/connexion?oubli=1" className="btn primary block">
          Recevoir un nouveau lien <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="auth-done" role="status">
        <motion.span className="auth-done-icon" initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", bounce: 0.55, duration: 0.8 }}>
          <CheckCircle weight="fill" aria-hidden="true" />
        </motion.span>
        <h2 id="auth-heading">Mot de passe changé</h2>
        <p className="muted">Par sécurité, tes autres appareils ont été déconnectés. Connecte-toi avec ton nouveau mot de passe.</p>
        <Link href="/connexion" className="btn primary block">
          Se connecter <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    );
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (password.length < 8) return setError("Le mot de passe doit faire au moins 8 caractères.");
    if (password !== confirm) return setError("Les deux mots de passe ne sont pas identiques.");
    setBusy(true);
    setError(null);
    const { error: failure } = await authClient.resetPassword({ newPassword: password, token });
    setBusy(false);
    if (failure) {
      setError(failure.code === "INVALID_TOKEN" ? "Ce lien a expiré. Demande-en un nouveau." : "Le changement a échoué. Réessaie.");
      return;
    }
    setDone(true);
  };

  return (
    <div className="auth-step">
      <div className="auth-card-head">
        <h2 id="auth-heading">Nouveau mot de passe</h2>
        <p className="muted">Choisis-en un d&apos;au moins 8 caractères.</p>
      </div>
      <form className="auth-form" onSubmit={submit} noValidate>
        <label className="auth-field">
          <span>Nouveau mot de passe</span>
          <span className="auth-password">
            <input type={show ? "text" : "password"} autoComplete="new-password" maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} />
            <button type="button" className="auth-eye" aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"} aria-pressed={show} onClick={() => setShow((v) => !v)}>
              {show ? <EyeSlash aria-hidden="true" /> : <Eye aria-hidden="true" />}
            </button>
          </span>
        </label>
        <label className="auth-field">
          <span>Encore une fois</span>
          <input type={show ? "text" : "password"} autoComplete="new-password" maxLength={128} value={confirm} onChange={(event) => setConfirm(event.target.value)} />
        </label>
        <ErrorLine message={error} />
        <button type="submit" className="btn primary block auth-submit" disabled={busy}>
          {busy ? <span className="auth-spinner dark" aria-hidden="true" /> : null} Enregistrer {busy ? null : <ArrowRight aria-hidden="true" />}
        </button>
      </form>
    </div>
  );
}
