# Kalima

Web app francophone pour apprendre progressivement l’arabe à travers le Coran.
Le nom public est centralisé dans `src/config/app.ts` et peut être remplacé avec
`NEXT_PUBLIC_APP_NAME`.

## Démarrage

Prérequis : Node.js 24+ (SQLite est fourni directement par Node).

```bash
npm install
cp .env.example .env.local
npm run dev
```

L’application fonctionne immédiatement en mode local, sans compte, sur
`http://localhost:3000`. Le navigateur conserve la progression hors connexion.
En développement, SQLite peut également synchroniser cette progression dans
`data/kalima.db`. Seuls les identifiants Quran Foundation sont nécessaires pour
charger les contenus distants.

## Commandes de contrôle

```bash
npm run typecheck
npm run lint
npm test
npm run verify:quran
npm run build
npm run test:e2e
```

## Parcours livrés

- `/` : accueil public premium avec aperçu interactif ;
- `/onboarding` : évaluation progressive et objectif quotidien ;
- `/dashboard` : séance du jour, reprise, révisions et repères ;
- `/defi` : cinq mots quotidiens avec progression et série locales ;
- `/coran` : les 114 sourates, traduction française et récitation ;
- `/coran/:sourate/:verset/etude` : étude et audio mot à mot ;
- `/apprendre` : 26 leçons, de l’alphabet aux fondations du tajwīd ;
- `/reviser` : séance de 5 à 50 mots, poursuivie jusqu’à la maîtrise ;
- `/vocabulaire` : recherche parmi 1 000 unités issues du corpus ;
- `/progression` : suivi manuel des sourates apprises ;
- `/sources` : provenance publique ;
- `/admin/validation` : espace protégé de comparaison et décision.

## Contenu coranique

Les métadonnées des 114 sourates sont locales. Lorsque `QF_CLIENT_ID` et
`QF_CLIENT_SECRET` sont renseignés, le serveur charge le texte uthmani, la
traduction française Hamidullah (ressource 31), la récitation Mishary Alafasy
(ressource 7), ainsi que le mot-à-mot français et son audio. Le cache est limité
à 24 heures. Aucun secret n’est envoyé au navigateur. La fixture locale
d’Al-Fātiḥa reste disponible en cas d’indisponibilité temporaire.

La bibliothèque contient 1 000 unités réelles classées par nombre d’occurrences
à partir du Quranic Arabic Corpus v0.4 et de son miroir public. Chaque unité
affichée possède un sens français et une phonétique ; les statuts internes
permettent de poursuivre leur relecture sans exposer de texte provisoire aux
apprenants.

## Stockage local SQLite

La migration SQLite crée :

- le texte canonique en lecture seule ;
- la provenance des sources ;
- les contenus pédagogiques et leur historique ;
- les statuts de validation ;
- la progression par appareil ;
- les états FSRS distincts par compétence.

```bash
npm run db:init
```

Le chemin est configurable avec `KALIMA_DATABASE_PATH`. `localStorage` garde la
progression immédiatement dans le navigateur ; en mode `hybrid`,
`GET/POST /api/progress` la synchronise ensuite avec SQLite grâce à un UUID
d’appareil généré localement. Aucune base cloud et aucun compte tiers ne sont
nécessaires.

## Déploiement Vercel

Vercel ne fournit pas de disque SQLite persistant. La production utilise donc
`NEXT_PUBLIC_STORAGE_MODE=browser` : chaque visiteur garde sa progression dans
son propre navigateur, sans compte. Les identifiants Quran.Foundation et le mot
de passe d’administration doivent être configurés comme variables
d’environnement Vercel et ne doivent jamais être ajoutés au dépôt Git.

L’administration SQLite reste destinée au travail local. Un chemin
`KALIMA_DATABASE_PATH=/tmp/kalima.db` permet d’ouvrir l’outil sur Vercel pour une
vérification ponctuelle, mais les décisions qui y sont prises ne sont pas
persistantes entre les instances serveur.

## PWA

Le manifest, les icônes, le service worker, l’écran hors connexion et la stratégie
de cache sont inclus. Le service worker ne met pas en cache les routes API ou
administratives.

## Documentation

- `docs/SOURCES.md`
- `docs/DATA_PROVENANCE.md`
- `docs/CONTENT_REVIEW.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/LICENSING.md`
- `docs/BENCHMARK.md`
