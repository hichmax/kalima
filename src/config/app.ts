export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "Kalima",
  description:
    "Apprendre à lire le Coran, les bases du tajwīd et l'arabe coranique en 30 jours, avec des sources vérifiables.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  repository: "https://github.com/hichmax/kalima",
} as const;
