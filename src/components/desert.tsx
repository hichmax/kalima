"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * « Fenêtres sur le désert ».
 *
 * Une seule vidéo est décodée (la boucle « purple desert », GetLayers). Chaque
 * <DesertWindow> est un canevas qui redessine la portion de la vidéo située derrière
 * lui, comme si la vidéo était fixée à l'écran : les cartes deviennent des fenêtres
 * et le paysage défile à travers elles. Un seul décodage, compatible iOS (pas de
 * background-attachment: fixed), et repli sur l'image fixe si le mouvement est réduit.
 */

type Registry = { canvases: Set<HTMLCanvasElement> };
const DesertContext = createContext<Registry | null>(null);

const POSTER = "/media/desert-poster.webp";

export function DesertStage({ children }: { children: ReactNode }) {
  const [registry] = useState<Registry>(() => ({ canvases: new Set() }));
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const poster = new Image();
    poster.src = POSTER;

    const syncPlayback = () => {
      if (!video) return;
      if (reduce.matches) video.pause();
      else void video.play().catch(() => undefined);
    };
    syncPlayback();
    reduce.addEventListener("change", syncPlayback);

    let frame = 0;
    let lastKey = "";
    const draw = () => {
      frame = requestAnimationFrame(draw);
      if (document.hidden) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const source: CanvasImageSource | null =
        video && video.readyState >= 2 ? video : poster.complete && poster.naturalWidth ? poster : null;
      if (!source) return;
      // Ne redessine que si l'image de la vidéo, le défilement ou la taille ont changé :
      // sur téléphone, redessiner 60 à 120 fois par seconde pour rien faisait ramer la page.
      const key = `${source === video ? video.currentTime : "poster"}|${window.scrollY}|${vw}x${vh}`;
      if (key === lastKey) return;
      lastKey = key;
      const sw = source instanceof HTMLVideoElement ? source.videoWidth : (source as HTMLImageElement).naturalWidth;
      const sh = source instanceof HTMLVideoElement ? source.videoHeight : (source as HTMLImageElement).naturalHeight;
      if (!sw || !sh) return;
      // « cover » de la source sur le viewport
      const scale = Math.max(vw / sw, vh / sh);
      const offsetX = (vw - sw * scale) / 2;
      const offsetY = (vh - sh * scale) / 2;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      for (const canvas of registry.canvases) {
        const rect = canvas.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh || rect.width === 0) continue;
        const width = Math.round(rect.width * dpr);
        const height = Math.round(rect.height * dpr);
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        ctx.drawImage(
          source,
          (rect.left - offsetX) / scale,
          (rect.top - offsetY) / scale,
          rect.width / scale,
          rect.height / scale,
          0,
          0,
          width,
          height,
        );
      }
    };
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      reduce.removeEventListener("change", syncPlayback);
    };
  }, [registry]);

  return (
    <DesertContext.Provider value={registry}>
      <video
        ref={videoRef}
        className="desert-video"
        muted
        loop
        playsInline
        autoPlay
        preload="auto"
        poster="/media/desert-poster.jpg"
        aria-hidden="true"
        tabIndex={-1}
      >
<source src="/media/desert-portrait.webm" type="video/webm" media="(orientation: portrait)" />
        <source src="/media/desert-portrait.mp4" type="video/mp4" media="(orientation: portrait)" />
        <source src="/media/desert-1920.webm" type="video/webm" />
        <source src="/media/desert-1920.mp4" type="video/mp4" />
      </video>
      {children}
    </DesertContext.Provider>
  );
}

export function DesertWindow({ className = "", children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  const registry = useContext(DesertContext);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!registry || !canvas) return;
    registry.canvases.add(canvas);
    return () => {
      registry.canvases.delete(canvas);
    };
  }, [registry]);

  return (
    <div className={`window ${className}`} {...rest}>
      <canvas ref={canvasRef} aria-hidden="true" />
      {children}
    </div>
  );
}
