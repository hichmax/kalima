"use client";

import { createAuthClient } from "better-auth/react";

/** Client Better Auth (même origine : aucune URL à configurer). */
export const authClient = createAuthClient();
export const { useSession, signIn, signUp, signOut } = authClient;
