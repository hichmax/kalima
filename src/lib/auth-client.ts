"use client";

import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "@/lib/auth";

/** Client Better Auth (même origine : aucune URL à configurer). */
export const authClient = createAuthClient({ plugins: [inferAdditionalFields<typeof auth>()] });
export const { useSession, signIn, signUp, signOut } = authClient;
