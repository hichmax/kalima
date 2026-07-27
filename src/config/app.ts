export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "Kalima",
  description:
    "Apprendre l’arabe du Coran mot après mot grâce à un rituel simple de 5 mots par jour.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  locale: "fr-FR",
  direction: "ltr" as const,
  nav: {
    public: [
      { label: "Méthode", href: "/#methode" },
      { label: "Découvrir", href: "/#decouvrir" },
      { label: "Sources", href: "/#sources" },
    ],
  },
} as const;
