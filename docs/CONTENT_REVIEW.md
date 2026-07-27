# Relecture des contenus

## Statuts

`imported` → `draft` → `needs_review` → `linguistically_reviewed` →
`religiously_reviewed` → `approved` → `published`

Un élément peut aussi passer à `rejected`. La publication n’est jamais déduite
automatiquement d’une importation.

## Contenu actuellement à valider

- toutes les traductions françaises de la fixture Al-Fātiḥa ;
- les phonétiques françaises ;
- les explications de construction des mots ;
- les rôles grammaticaux simplifiés ;
- les premières définitions françaises des cartes ;
- le texte des 26 leçons, de l’alphabet aux fondations du tajwīd ;
- les conseils de prononciation et de mémorisation.

Le texte arabe canonique n’est pas soumis à ce flux éditorial : il est importé
verbatim, contrôlé puis exposé en lecture seule.

## Espace interne

`/admin/validation` demande `INTERNAL_REVIEW_TOKEN`, stocké uniquement en
variable serveur. Le cookie de session est HTTP-only, SameSite strict et secure
en production. L’écran compare la source brute et la couche pédagogique, accepte
un commentaire, une décision et un export CSV.

Les décisions sont enregistrées dans SQLite avec le statut précédent, le
nouveau statut, le commentaire et l’horodatage. L’identité nominative du
relecteur devra être ajoutée avant un usage éditorial réel. Aucun badge public
de validation religieuse n’est affiché.

## Règles éditoriales

- expliquer une notion en français simple avant son nom technique ;
- ne jamais déduire une dérivation d’une racine partagée ;
- distinguer arabe coranique, arabe standard moderne et conseil pédagogique ;
- citer le champ source et le relecteur ;
- ne jamais générer, compléter ou corriger un verset avec un modèle d’IA ;
- ne jamais présenter une analyse audio automatique comme une certification.
