"use client";

import { LockKey } from "@phosphor-icons/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLogin() {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (!response.ok) {
      setError("Accès refusé. Vérifie le mot de passe.");
      return;
    }
    router.refresh();
  };
  return (
    <div className="admin-lock card card-pad">
      <span className="admin-lock-icon"><LockKey size={28} /></span>
      <p className="eyebrow">Espace interne</p>
      <h1 className="page-title">Validation des contenus</h1>
      <p className="lead">
        Cet espace contient des données brutes, des brouillons et l’historique de relecture.
      </p>
      <form onSubmit={submit} className="stack">
        <label>
          <span className="field-label">Mot de passe administrateur</span>
          <input
            className="input"
            type="password"
            autoComplete="current-password"
            value={token}
            onChange={(event) => setToken(event.target.value)}
          />
        </label>
        {error ? <p role="alert" className="form-error">{error}</p> : null}
        <button className="btn btn-primary" type="submit">Accéder à la revue</button>
      </form>
    </div>
  );
}
