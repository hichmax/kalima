"use client";

import { useEffect, useRef } from "react";

/**
 * Fond animé des pages de l'application : la vidéo du désert, pré-floutée et assombrie à
 * l'encodage (640 px, 24 i/s, ~30–55 Ko), pour que le verre ait quelque chose de vivant à
 * réfracter sans coûter cher. Pause automatique : onglet caché, « réduire les animations »,
 * mode économie de données, thème papier.
 */
export function AmbientBackdrop() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;

    const sync = () => {
      const paper = document.documentElement.dataset.theme === "papier";
      if (document.hidden || reduce.matches || saveData || paper) video.pause();
      else void video.play().catch(() => undefined);
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    reduce.addEventListener("change", sync);
    const themeObserver = new MutationObserver(sync);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      document.removeEventListener("visibilitychange", sync);
      reduce.removeEventListener("change", sync);
      themeObserver.disconnect();
    };
  }, []);

  return (
    <div className="app-backdrop" aria-hidden="true">
      <video ref={ref} className="ambient-video" muted loop playsInline autoPlay preload="auto" poster="/media/desert-poster.webp" tabIndex={-1}>
        <source src="/media/desert-ambient.webm" type="video/webm" />
        <source src="/media/desert-ambient.mp4" type="video/mp4" />
      </video>
      <div className="ambient-veil" />
    </div>
  );
}
