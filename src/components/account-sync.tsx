"use client";

import { useEffect } from "react";
import { startSync } from "@/lib/account-sync";
import { useSession } from "@/lib/auth-client";

/** Monté une fois dans l'application : synchronise tant qu'un compte est connecté. */
export function AccountSync() {
  const { data } = useSession();
  const userId = data?.user.id;
  useEffect(() => {
    if (!userId) return;
    return startSync();
  }, [userId]);
  return null;
}
