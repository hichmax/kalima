/** Applique thème et taille de l'arabe au document (même logique que le script d'en-tête). */
export function applyAppearance(settings: { theme?: "nuit" | "papier"; arabicScale?: number; tajweed?: boolean }) {
  const root = document.documentElement;
  if (settings.tajweed === false) root.dataset.tajweed = "off";
  else if (settings.tajweed === true) delete root.dataset.tajweed;
  if (settings.theme === "papier") root.dataset.theme = "papier";
  else if (settings.theme === "nuit") delete root.dataset.theme;
  if (settings.arabicScale) root.style.setProperty("--arabic-scale", String(settings.arabicScale));
}
