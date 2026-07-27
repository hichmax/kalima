# Sources

Date de consultation : 25 juillet 2026.

## Tanzil Quran Text

- URL exacte : https://tanzil.net/docs/download
- Licence exacte : https://tanzil.net/docs/text_license
- Organisme : Tanzil Project
- Contenu : texte coranique canonique, fixture locale d’Al-Fātiḥa
- Version : 1.1
- Licence : Creative Commons Attribution 3.0
- Attribution : Tanzil Project avec lien vers tanzil.net
- Contrainte : copies strictement verbatim ; aucune modification permise
- Import : fixture locale séparée, manifeste et contrôle SHA-256
- Champs : référence, texte uthmânien
- Transformations : aucune sur le texte canonique
- Confiance : élevée pour le texte téléchargé officiellement
- Limite actuelle : le dépôt ne contient que la fixture Al-Fātiḥa ; l’import complet reste à exécuter depuis la distribution officielle

## Quran Foundation Content API

- URL exacte : https://api-docs.quran.foundation/docs/quickstart/
- Référence API : https://api-docs.quran.foundation/docs/api-reference/
- Conditions : https://api-docs.quran.foundation/legal/developer-terms/
- Organisme : Quran.Foundation
- Contenu prévu : sourates, versets, mots, récitations, minutages et ressources de traduction autorisées
- Version : Content API v4
- Authentification : OAuth2 Client Credentials, scope `content`
- Import : adaptateur serveur `src/lib/quran-foundation.ts`
- Champs : identifiants de sourate, nombre de versets, texte, mots, audio selon les endpoints activés
- Transformations : validation de schéma, cache contrôlé, aucune exposition des secrets
- Confiance : élevée
- Limite : identifiants de production non fournis ; le mode local reste actif

## Quranic Arabic Corpus

- URL officielle : https://corpus.quran.com/download/default.jsp
- Documentation : https://corpus.quran.com/documentation/
- Miroir public utilisé : https://github.com/mustafa0x/quran-morphology
- Organisme : Language Research Group, University of Leeds ; miroir maintenu par mustafa0x
- Contenu : segmentation morphologique, lemmes, racines, catégories et références
- Version officielle de base : 0.4
- Commit du miroir : `8f38b39016824284f9ed16ae15069ff9102c4acf`
- Licence : GNU GPL avec obligations d’attribution indiquées par le corpus
- Checksum du brut : `742bfac59941b2cb09736d5b7aae694af50792261fb8450cbf6afafcc340645f`
- Import : lecture du brut immuable, regroupement par lemme et catégorie, tri par fréquence
- Champs : référence, segment arabe, catégorie, lemme, racine
- Transformations : regroupement des segments non préfixes/suffixes ; normalisation uniquement dans un champ de recherche séparé
- Confiance : élevée pour la provenance brute, moyenne pour les corrections propres au miroir
- Limites : le fichier source signale lui-même des lemmes restant à revoir ; la couche française est indépendante

## FSRS

- URL exacte : https://github.com/open-spaced-repetition/ts-fsrs
- Documentation : https://open-spaced-repetition.github.io/ts-fsrs/
- Organisme : Open Spaced Repetition
- Contenu : ordonnanceur de répétition espacée
- Version installée : 5.4.1
- Licence : MIT
- Import : dépendance npm `ts-fsrs`
- Transformations : rétention cible de 0,90 ; fuzz désactivé dans les tests
- Confiance : élevée

## SQLite

- Documentation : https://nodejs.org/api/sqlite.html
- Organisme : SQLite Consortium ; intégration fournie par Node.js
- Contenu : progression locale, états FSRS, provenance et historique de revue
- Version d’exécution : API `node:sqlite` de Node.js 24+
- Import : migration SQL versionnée dans `database/migrations`
- Stockage : fichier local configurable avec `KALIMA_DATABASE_PATH`
- Transformations : JSON validé par Zod avant insertion
- Confiance : élevée
