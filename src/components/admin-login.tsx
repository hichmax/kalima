"use client";

import { ArrowRight, LockKey, WarningCircle } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const response = await fetch("/api/admin/connexion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }).catch(() => null);
    if (response?.ok) {
      router.refresh();
      return;
    }
    const body = (await response?.json().catch(() => null)) as { error?: string } | null;
    setError(body?.error ?? "Connexion impossible.");
    setBusy(false);
  };

  return (
    <form className="glass float card stack admin-login" style={{ "--gap": "14px" } as React.CSSProperties} onSubmit={submit}>
      <span className="admin-login-icon" aria-hidden="true">
        <LockKey weight="duotone" />
      </span>
      <h1 className="h3">Espace réservé</h1>
      <label className="account-field">
        <span>Mot de passe</span>
        <input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} autoFocus />
      </label>
      {error ? (
        <p className="account-error" role="alert">
          <WarningCircle weight="fill" aria-hidden="true" /> {error}
        </p>
      ) : null}
      <button type="submit" className="btn primary" disabled={busy || !password} style={{ justifySelf: "start" }}>
        Entrer <ArrowRight aria-hidden="true" />
      </button>
    </form>
  );
}
