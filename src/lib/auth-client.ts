"use client";

import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "@/lib/auth";
import { normalizeBaseUrl } from "@/lib/base-url";

/** Client Better Auth (même origine : aucune URL à configurer). */
// Navigateur : même origine. Rendu serveur (pré-rendu) : URL normalisée, jamais une valeur invalide.
const baseURL =
  typeof window !== "undefined" ? window.location.origin : (normalizeBaseUrl(process.env.BETTER_AUTH_URL) ?? "http://localhost:3000");

export const authClient = createAuthClient({ baseURL, plugins: [inferAdditionalFields<typeof auth>()] });
export const { useSession, signIn, signUp, signOut } = authClient;
