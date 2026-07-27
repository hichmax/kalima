# Provenance des données

## Séparation des couches

```text
Source canonique immuable
        ↓ référence
Annotations linguistiques brutes
        ↓ copie pédagogique indépendante
Contenu français à relire
        ↓ historique de revue
Contenu publié
```

Le texte canonique ne partage pas de colonne éditable avec la traduction, les
explications ou les exercices. Une correction pédagogique ne peut donc pas
modifier un caractère du texte arabe.

## Vocabulaire initial

Le script `scripts/generate-vocabulary.mjs` lit le fichier brut du Quranic Arabic
Corpus, exclut les segments explicitement marqués comme préfixes ou suffixes,
regroupe les occurrences par lemme et catégorie, puis conserve les 1 000 unités
les plus fréquentes. Chaque unité conserve jusqu’à trois références
`sourate:verset:position`, sa racine éventuelle et son nombre d’occurrences.

Les unités ne sont pas des cartes artificielles dupliquées. Les sens français
non disponibles dans la source sont complétés avant publication et conservés
dans la file interne tant que leur relecture éditoriale n’est pas terminée.

## Intégrité

`npm run verify:quran` contrôle :

- le nombre de versets de la fixture ;
- l’ordre des références ;
- les références dupliquées ;
- l’absence de blancs ajoutés ;
- le SHA-256 caractère par caractère de la représentation canonique.

L’import complet devra appliquer les mêmes contrôles aux 6 236 versets et faire
échouer la transaction au premier écart.

## Synchronisation

La progression locale est horodatée. Après authentification, `POST /api/progress`
valide le schéma et effectue un `upsert` par utilisateur. Un conflit futur devra
comparer `client_updated_at` et `server_updated_at` plutôt que fusionner des
tableaux aveuglément.
