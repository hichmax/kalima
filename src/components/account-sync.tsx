"use client";

import { useEffect } from "react";
import { startSync } from "@/lib/account-sync";
import { authClient, useSession } from "@/lib/auth-client";

/** Monté une fois dans l'application : synchronise tant qu'un compte est connecté. */
export function AccountSync() {
  const { data } = useSession();
  const userId = data?.user.id;
  useEffect(() => {
    if (!userId) return;
    // Consentement coché avant un aller-retour Google : on l'enregistre maintenant.
    try {
      if (sessionStorage.getItem("kalima:newsletter") === "1") {
        sessionStorage.removeItem("kalima:newsletter");
        void authClient.updateUser({ newsletter: true });
      }
    } catch {}
    return startSync();
  }, [userId]);
  return null;
}
