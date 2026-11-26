# Kalima — Le Coran en 30 jours

Application web francophone pour apprendre à **lire** le texte du muṣḥaf, **mémoriser**
la Fātiḥa et sept courtes sourates, poser les **bases du tajwīd** et reconnaître les
**300 mots** qui couvrent 74 % des occurrences du Coran, en 30 séances d'environ 35 minutes.

Plan pédagogique et technique complet, avec les sources : [`docs/REFONTE.md`](docs/REFONTE.md).

## Démarrer

Prérequis : Node.js 24.

```bash
npm install
cp .env.example .env.local   # facultatif : identifiants Quran.Foundation
npm run dev
```

Sans identifiants Quran.Foundation, tout fonctionne avec le texte Tanzil ; seuls la
traduction des sens et l'audio sont indisponibles.

## Contrôles

```bash
npm run verify        # contenu + types + lint + tests
npm run build         # vérifie aussi l'intégrité du contenu avant de compiler
```

`npm run content:check` échoue si le texte Tanzil a été modifié (SHA-256), si l'alignement
Tanzil ↔ Quranic Arabic Corpus est rompu ou si les données générées ne sont plus à jour.
Les tests de contenu (`src/content/content.test.ts`) vérifient que chaque référence
coranique des leçons existe, qu'aucun verset n'est tapé à la main, que chaque lemme a un
sens et que chaque question a une seule bonne réponse.

## Architecture

| Dossier | Rôle |
|---|---|
| `content/sources/` | Sources verbatim : Tanzil (CC BY 3.0) et Quranic Arabic Corpus (GPL) |
| `scripts/build-content.mjs` | Contrôle d'intégrité, alignement mot à mot, génération de `src/generated/` |
| `src/content/` | Leçons, programme de 30 jours, lexique, phonétique, règles, sources (statut : à relire) |
| `src/lib/` | FSRS (`srs.ts`), stockage local sûr (`storage.ts`), exercices, données coraniques |
| `src/components/` | Séance du jour, exercices, mémorisation, lecteur, désert vidéo, dégradé Soffit |
| `src/app/` | Pages (App Router, rendu statique : 197 pages) et API (récitation, mots, banque de révision) |

- **Texte coranique** : uniquement Tanzil, résolu par référence `sourate:verset[:mot]`.
- **Traduction et audio** : Quran.Foundation, à l'exécution, jamais stockés dans le dépôt
  (Developer Terms du 20/11/2026), avec crédit du traducteur et du récitant.
- **Progression** : `localStorage` versionné, validé par Zod, export et import JSON.
  Aucun compte pour l'instant (voir la feuille de route dans `docs/REFONTE.md`).
- **Répétition espacée** : FSRS-7 (`ts-fsrs`), une carte par lettre, signe, règle, mot et verset.

## Relecture du contenu

Tout le contenu pédagogique est au statut `draft` tant qu'un enseignant **nommé** ne l'a
pas relu. La relecture se fait par pull request : modifier le statut et le champ
`reviewer` dans `src/content/`, avec le nom de la personne.

## Licences

Voir [`docs/LICENSING.md`](docs/LICENSING.md).
