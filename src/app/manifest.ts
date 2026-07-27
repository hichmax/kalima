import type { MetadataRoute } from "next";
import { appConfig } from "@/config/app";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${appConfig.name} — l’arabe du Coran mot après mot`,
    short_name: appConfig.name,
    description: appConfig.description,
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#fbf8f1",
    theme_color: "#1e3a34",
    lang: "fr",
    dir: "ltr",
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
