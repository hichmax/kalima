# Licences et conditions

## Données incluses dans le dépôt

| Fichier | Source | Licence | Obligations |
|---|---|---|---|
| `content/sources/tanzil/quran-uthmani.txt` | Tanzil Project, Uthmani 1.1 | CC BY 3.0 | Copie verbatim (aucune modification), bloc de copyright conservé, attribution et lien vers tanzil.net. Contrôlé par SHA-256. |
| `content/sources/tanzil/quran-data.xml` | Tanzil Project, métadonnées | CC BY | Attribution. |
| `content/sources/qac/quran-morphology.txt` | Quranic Arabic Corpus 0.4, miroir `mustafa0x/quran-morphology` (commit 8f38b39) | GNU GPL | Attribution, licence conservée ; les fichiers dérivés (`src/generated/morph/`, `lexicon-stats.json`) restent sous GPL. |
| `src/generated/**` | Dérivés des deux sources ci-dessus | Licence de leur source | La notice de chaque source est recopiée dans chaque fichier généré. |
| `src/app/AmiriQuran.woff2` | Amiri Quran 1.003, Khaled Hosny | SIL OFL 1.1 | Licence dans `public/fonts/AMIRI-OFL.txt`. |
| `public/media/desert-*` | Vidéo « purple desert », GetLayers | Licence de l'utilisateur | ❓ À confirmer : la licence GetLayers autorise-t-elle des fichiers servis depuis un dépôt public ? |

## Données non incluses (chargées à l'exécution)

- **Quran.Foundation** (traduction Hamidullah, récitation al-ʿAfāsī) : Developer Terms
  du 20/11/2026. Leur contenu ne doit pas figurer dans un dépôt public, un fichier
  téléchargeable ou un bundle figé ; cache limité à une semaine (Kalima : 24 h) ; crédit
  de Quran.Foundation et du récitant dans l'interface.
- **Historique Git** : l'ancien fichier `src/data/vocabulary.generated.json` (gloses et
  liens audio QF) reste dans l'historique du dépôt. Le retirer exige une réécriture de
  l'historique (force-push), à décider par le propriétaire du dépôt.

## Code

Le dépôt n'a pas encore de fichier `LICENSE` pour le code. Point d'attention : la
présence de données GPL (QAC) dans le dépôt est compatible avec n'importe quelle licence
de code tant que ces données restent des fichiers séparés, sous leur propre licence.
Ce point est à valider par le propriétaire du projet.

## Dépendances

Next.js, React (MIT) ; ts-fsrs (MIT) ; Motion (MIT) ; anime.js (MIT) ; Phosphor Icons
(MIT) ; Zod (MIT) ; Geist (OFL, via `next/font`).
