"use client";

import { MoonStars, Sun } from "@phosphor-icons/react";
import { useApp } from "@/components/providers";

export function ThemeToggle() {
  const { theme, toggleTheme } = useApp();
  return (
    <button
      className="btn btn-ghost btn-icon"
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "light" ? "Activer le thème sombre" : "Activer le thème clair"}
      title={theme === "light" ? "Thème sombre" : "Thème clair"}
    >
      {theme === "light" ? <MoonStars size={21} /> : <Sun size={21} />}
    </button>
  );
}
