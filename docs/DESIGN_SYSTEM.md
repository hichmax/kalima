# Design system Kalima

## Intention

Une interface éditoriale, chaude et calme : moins « tableau SaaS », davantage
compagnon de lecture. Les surfaces ivoire, le vert profond et l’or mat créent
une hiérarchie discrète. La texture papier est purement décorative et ne réduit
pas le contraste.

## Tokens principaux

| Token | Clair | Sombre | Usage |
|---|---|---|---|
| `--paper` | `#fbf8f1` | `#10251f` | fond global |
| `--surface-solid` | `#fffdf8` | `#1d312a` | cartes |
| `--ink` | `#24342f` | `#f2eddf` | texte |
| `--forest` | `#1e3a34` | `#d9e5d7` | action principale |
| `--sage-100` | `#dfe8e1` | `#29453a` | sélection |
| `--gold` | `#c79a3b` | `#d4b57f` | repère et accent |
| `--border` | vert à 14 % | crème à 11 % | séparateurs |

Rayons : 12, 20, 28 et 38 px. Les actions tactiles mesurent au moins 44 px.
Les ombres restent diffuses et rares.

## Typographie

- interface : pile système `Avenir Next`, `Segoe UI`, sans-serif ;
- titres : `Iowan Old Style`, `Palatino`, serif ;
- texte coranique : préférence locale `KFGQPC Uthmanic Script HAFS`, puis
  `Geeza Pro` et `Noto Naskh Arabic`.

L’installation automatisée d’Amiri Quran (SIL OFL) a été bloquée par
l’autorisation réseau. Avant production, intégrer une distribution vérifiée de
la police coranique choisie et conserver sa licence dans le dépôt. Aucun rendu
de production ne doit dépendre uniquement d’une police arabe générique.

## RTL et texte sacré

Chaque bloc arabe porte `lang="ar"`, `dir="rtl"`, `translate="no"` lorsqu’il
contient le texte canonique, et `unicode-bidi: isolate`. La traduction reste LTR.
Dans le lecteur, aucun mot n’est un contrôle. En étude, les mots deviennent de
véritables boutons avec nom accessible.

## Mouvement

Transitions entre 150 et 300 ms, sans animation de largeur ou hauteur.
`prefers-reduced-motion` annule transitions et animations. Le retournement de
flashcard est représenté par une continuité verticale légère, sans rotation 3D.

## Responsive

- bureau : navigation latérale, lecteur + liste de sourates, étude + fiche ;
- téléphone : navigation inférieure à cinq entrées, listes horizontales,
  fiche de mot sous le verset et lecteur compact ;
- breakpoints contrôlés : 760 et 1000 px ;
- cibles visées : 1440×900, 1280×800, 430×932, 390×844 et 360×800.

Le fichier généré par le skill UI se trouve aussi dans
`design-system/kalima/MASTER.md`; les choix du présent document remplacent ses
recommandations génériques lorsqu’elles contredisent le brief.
