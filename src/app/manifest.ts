import type { MetadataRoute } from "next";
import { appConfig } from "@/config/app";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${appConfig.name} — Le Coran en 30 jours`,
    short_name: appConfig.name,
    description: appConfig.description,
    start_url: "/aujourdhui",
    display: "standalone",
    background_color: "#07060c",
    theme_color: "#07060c",
    lang: "fr",
    icons: [
      { src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icons/maskable.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
