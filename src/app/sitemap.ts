import type { MetadataRoute } from "next";
import { appConfig } from "@/config/app";
import { allLessons, program } from "@/content/program";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = appConfig.url;
  const fixed = ["", "/programme", "/coran", "/lecons", "/mots", "/sources", "/confidentialite"].map((path) => ({ url: `${base}${path}` }));
  const days = program.map((d) => ({ url: `${base}/programme/${d.day}` }));
  const lessons = allLessons.map((l) => ({ url: `${base}/lecons/${l.id}` }));
  const surahs = Array.from({ length: 114 }, (_, i) => ({ url: `${base}/coran/${i + 1}` }));
  return [...fixed, ...days, ...lessons, ...surahs];
}
