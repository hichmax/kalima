/**
 * Normalise une URL publique saisie à la main (ex. « kalima-six.vercel.app » → « https://kalima-six.vercel.app »).
 * Renvoie undefined si la valeur est vide ou inutilisable : Better Auth déduit alors l'URL de la requête.
 */
export function normalizeBaseUrl(value: string | undefined): string | undefined {
  const raw = value?.trim().replace(/\/+$/, "");
  if (!raw) return undefined;
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `${/^(localhost|127\.0\.0\.1)(:|$)/.test(raw) ? "http" : "https"}://${raw}`;
  try {
    return new URL(withScheme).origin;
  } catch {
    return undefined;
  }
}
