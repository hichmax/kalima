# Kalima — refonte complète : « Le Coran en 30 jours »

Date : 26 novembre 2026. Branche : `refonte-30-jours`.
Ce document remplace l'ancienne architecture pédagogique. Il part de l'audit
du même jour (`AUDIT_KALIMA.md`) et ne garde que l'intention : **apprendre à
lire le Coran, à le réciter avec les bases du tajwīd et à comprendre son
arabe, en français, avec des sources vérifiables**.

Légende de fiabilité utilisée dans tout le document :

- ✅ **vérifié** : contrôlé pendant la refonte (calcul, lecture de la source, test automatique) ;
- 🟡 **consensus / à confirmer** : point classique et largement enseigné, mais la formulation doit être relue par un enseignant qualifié ;
- ❓ **incertain** : hypothèse ou donnée dont la source n'est pas établie.

---

## 1. La promesse, honnêtement formulée

> En 30 jours, à raison de 30 à 40 minutes par jour, tu sauras **lire** le
> texte vocalisé du muṣḥaf lettre par lettre, tu auras **mémorisé** la
> Fātiḥa et 7 courtes sourates (35 versets), tu connaîtras les **règles de
> base du tajwīd** et tu reconnaîtras les **300 mots** les plus fréquents du
> Coran, qui représentent environ 74 % de ses occurrences.

Ce qui **n'est pas** promis, et qui est dit clairement dans l'application :

- une récitation validée : seule une personne qualifiée peut corriger une
  récitation (principe du *talaqqī* et de la *mushāfaha*) 🟡 ;
- la compréhension du Coran : connaître des mots n'est pas comprendre un
  texte, et la traduction des sens n'est pas le Coran ;
- un rythme identique pour tous : le rythme est indicatif, chaque jour peut
  être refait et la suite reste disponible.

### Pourquoi « 300 mots ≈ 74 % » ✅

Calcul fait sur le Quranic Arabic Corpus (miroir `mustafa0x/quran-morphology`,
commit `8f38b39`, SHA-256 `742bfac5…645f`, identique à celui documenté dans
`docs/SOURCES.md`) :

| Lemmes les plus fréquents | Couverture des occurrences* |
|---|---|
| 50 | 47,9 % |
| 100 | 58,0 % |
| 200 | 67,9 % |
| **300** | **74,0 %** |
| 500 | 81,1 % |
| 1 000 | 89,1 % |

\* 74 685 segments « tige » portant un lemme, préfixes (و، ف، ب، ال…) et
suffixes pronominaux exclus. 4 771 lemmes distincts, 1 651 racines, 1 960
lemmes n'apparaissent qu'une fois. **Nuance importante** : connaître le lemme
كَانَ ne suffit pas à reconnaître كَانُوا۟. C'est pourquoi le programme
enseigne aussi les préfixes, les pronoms suffixes et la conjugaison de base.

---

## 2. Sources et statut

### 2.1 Texte, données, audio

| Source | Usage dans Kalima | Licence / conditions | Statut |
|---|---|---|---|
| **Tanzil Quran Text, Uthmani 1.1** — https://tanzil.net/download | Texte arabe de **tous** les versets affichés, y compris dans les leçons. Fichier verbatim versionné, en-tête de copyright conservé, SHA-256 contrôlé au build. | CC BY 3.0, copie verbatim uniquement, attribution + lien vers tanzil.net — https://tanzil.net/docs/text_license | ✅ téléchargé le 26/11/2026, SHA-256 `6933e133…ec5f` |
| **Quranic Arabic Corpus 0.4** (miroir corrigé `mustafa0x/quran-morphology`) — https://corpus.quran.com | Découpage morphologique, lemmes, racines, fréquences. Alignement mot à mot avec Tanzil vérifié (même nombre de mots par verset ; écarts uniquement d'encodage de la hamza et du petit yāʾ). | GNU GPL + attribution — https://corpus.quran.com/download/ | ✅ |
| **Quran.Foundation Content API v4** — https://api-docs.quran.foundation | Traduction française et récitation, **à l'exécution uniquement**. | Developer Terms (mis à jour le 20/11/2026) : affichage dans l'app autorisé ; **interdit** de mettre leurs contenus dans un dépôt public, un fichier téléchargeable ou un bundle figé ; cache ≤ 1 semaine ; créditer QF et le récitant. — https://api-docs.quran.foundation/legal/developer-terms/ | ✅ lu le 26/11/2026 |
| Traduction des sens : **Muhammad Hamidullah**, révision du Complexe du Roi Fahd (ressource QF n° 31) | Traduction française des versets, présentée comme « traduction des sens ». | Œuvre protégée (auteur décédé en 2002) ; accès via QF uniquement. | 🟡 droits exacts à confirmer auprès de QF |
| Récitation : **Mishary Rāshid al-ʿAfāsī**, riwāya Ḥafṣ ʿan ʿĀṣim (ressource QF n° 7) | Audio des versets et des mots. | Conditions QF (crédit QF + récitant, pas de réhébergement). | ✅ crédité dans l'interface |
| **Amiri Quran** (Khaled Hosny) — https://github.com/aliftype/amiri | Police du texte coranique, auto-hébergée. | SIL Open Font License 1.1 | ✅ |
| Vidéo « purple desert » — GetLayers | Fond de l'accueil. | Licence de l'utilisateur. | ❓ vérifier que la licence autorise un fichier servi depuis un dépôt public |

**Conséquence de la mise à jour des conditions QF** ✅ : l'ancien fichier
`src/data/vocabulary.generated.json` contenait des gloses françaises et des
liens audio issus de QF, versionnés dans un dépôt public. C'est désormais
explicitement de la « redistribution ». La refonte le supprime. Il reste dans
l'**historique Git** : le réécrire (force-push) est une décision à prendre par
le propriétaire du dépôt.

### 2.2 Références de tajwīd et de lecture

Les règles enseignées sont celles de la **riwāya de Ḥafṣ ʿan ʿĀṣim par la voie
de la Shāṭibiyya**, celle du muṣḥaf de Médine 🟡.

| Référence | Ce qu'elle fonde |
|---|---|
| Sulaymān al-Jamzūrī, *Tuḥfat al-Aṭfāl* (poème didactique, XIIᵉ s. H.) | Nūn sākina et tanwīn (iẓhār, idghām, iqlāb, ikhfāʾ), mīm sākina, madd. |
| Ibn al-Jazarī (m. 833 H.), *al-Muqaddima al-Jazariyya* | Makhārij (17 points dans 5 zones), ṣifāt, tafkhīm et tarqīq, qalqala, waqf. |
| Muṣḥaf de Médine (Complexe du Roi Fahd), postface « تعريف بهذا المصحف » et « اصطلاحات الضبط » | Conventions graphiques : sukūn en forme de tête de ḥāʾ, petit cercle ۟ (lettre muette), petit rectangle ۠, petit mīm ۢ (iqlāb), tanwīn superposé ou décalé, signes de pause. |
| Nūr Muḥammad Ḥaqqānī, *al-Qāʿida an-Nūrāniyya* | Progression lettres → voyelles → signes → lecture continue. |
| ʿAbd al-Fattāḥ al-Marṣafī, *Hidāyat al-Qārī ilā Tajwīd Kalām al-Bārī* | Ouvrage de référence détaillé, pour trancher les cas limites. |

Ces ouvrages sont cités comme **fondement** de la présentation. Les textes de
Kalima sont des rédactions pédagogiques originales en français. Elles portent
toutes le statut « rédigé — relecture requise » tant qu'un enseignant nommé
ne les a pas validées (voir §8).

Points où les écoles divergent, signalés dans les leçons 🟡 :

- la durée du madd munfaṣil et du madd muttaṣil : 4 ou 5 temps par la voie de
  la Shāṭibiyya ; d'autres voies de Ḥafṣ autorisent 2 temps pour le munfaṣil ;
- les niveaux de qalqala : deux niveaux (ṣughrā / kubrā) le plus souvent,
  trois dans certaines présentations ;
- le classement de certains cas de rāʾ, présenté ici en version simplifiée.

### 2.3 Références pédagogiques

| Principe | Référence | Application dans Kalima |
|---|---|---|
| Effet de test (récupération active) | Roediger & Karpicke (2006), *Psychological Science* 17(3) | Chaque leçon se termine par 15 à 30 questions ; la révision demande toujours une réponse avant d'afficher la solution. |
| Répétition espacée | Cepeda et al. (2006), *Psychological Bulletin* 132(3) | Ordonnancement FSRS par carte. |
| Ordonnanceur FSRS | Ye, Su & Cao (2022), KDD — *A Stochastic Shortest Path Algorithm for Optimizing Spaced Repetition Scheduling* ; bibliothèque `ts-fsrs` (MIT) | État FSRS stocké par carte, rétention cible 0,9. |
| Techniques efficaces | Dunlosky et al. (2013), *Psychological Science in the Public Interest* 14(1) | Pratique distribuée et tests fréquents (utilité « élevée ») ; relecture passive et surlignage évités. |
| Pratique entrelacée | Kornell & Bjork (2008), *Psychological Science* 19(6) | Les révisions mélangent lettres, règles et mots au lieu de les grouper. |
| Ancrage orthographique (lecture) | Ehri (2014), *Scientific Studies of Reading* 18(1) | On fait décoder la lettre et le son ensemble, puis on retire la phonétique pour forcer la lecture du graphème. |
| Rôle des voyelles en arabe | Abu-Rabia (2001), *Reading and Writing* 14 | Le muṣḥaf est entièrement vocalisé : on apprend les ḥarakāt dès le jour 6. |

---

## 3. Principes de la refonte

1. **Un seul bouton « Continuer ».** L'application dit toujours quoi faire
   maintenant : la séance du jour enchaîne révision → leçon → mémorisation →
   mots → défi.
2. **On apprend en répondant, pas en lisant.** 2 à 4 écrans d'explication
   au plus, puis la pratique.
3. **Pas un seul verset tapé à la main.** Tout texte coranique est une
   référence `sourate:verset[:mot]` résolue depuis Tanzil au build. Un test
   échoue si une chaîne arabe d'exemple contient un verset non référencé.
4. **La phonétique est une béquille temporaire.** Convention française
   expliquée au jour 1 ; affichée de J1 à J7, à la demande de J8 à J14,
   masquée ensuite (révélée seulement après une tentative). Aucune phonétique
   générée automatiquement : seules des transcriptions écrites à la main.
5. **L'audio vient d'un récitant humain.** Plus de synthèse vocale. Les
   lettres sont illustrées par un mot coranique récité (ex. ب → بِسْمِ, 1:1:1).
   Enregistrer les lettres et syllabes isolées par un récitant qualifié est
   une initiative à mener (§9).
6. **Tout ce qui n'est pas relu est marqué.** Un bandeau « contenu rédigé,
   relecture en cours » apparaît partout où c'est vrai.
7. **Le vocabulaire part du lemme.** Fiche = forme de dictionnaire + sens
   général. Le sens en contexte vient dans l'exemple, avec sa référence.
8. **Bienveillance.** Une série peut être protégée un jour par semaine.
   Refaire un jour n'efface rien. Pas de classement entre utilisateurs.

---

## 4. Le programme de 30 jours

Chaque jour : **révision** (5–10 min) → **leçon** (5–10 min, 15–30 exercices)
→ **mémorisation** (10–15 min) → **mots** (5 min, 10 nouveaux) → **défi** (2 min).
Les jours 7, 14, 21 et 28 sont des **bilans** avec un défi de semaine.

Méthode de mémorisation pour chaque nouveau segment (inspirée des méthodes
de ḥifẓ par répétition et enchaînement 🟡) :

1. écouter 3 fois en suivant le texte ;
2. écouter et répéter, verset en boucle, vitesse réglable ;
3. lire seul 3 fois ;
4. réciter de mémoire avec masquage progressif (mots entiers → premières
   lettres → rien) ;
5. enchaîner avec les versets de la veille (le « chapelet ») ;
6. s'enregistrer (le fichier reste sur l'appareil) et comparer au récitant.

### Semaine 1 — Les lettres (Fātiḥa à l'écoute)

| Jour | Lecture / tajwīd | Comprendre | Mémoriser |
|---|---|---|---|
| 1 | Convention phonétique, sens de lecture, famille ب ت ث ن ي + ا | — | 1:1 (basmala) |
| 2 | ج ح خ · د ذ · ر ز | — | 1:2 |
| 3 | س ش · ص ض · ط ظ | La phrase nominale, l'article ال | 1:3–4 |
| 4 | ع غ · ف ق · ك ل م · ه و ء | — | 1:5 |
| 5 | Formes liées ; les 6 lettres qui ne se lient pas à gauche (ا د ذ ر ز و) | — | 1:6 |
| 6 | Voyelles brèves : fatḥa, kasra, ḍamma ; syllabes | Pronoms suffixes : ـهُ ـهُمْ ـنَا ـكَ | 1:7 |
| 7 | **Bilan** : 28 lettres, 3 voyelles | — | **Défi** : réciter la Fātiḥa entière et s'enregistrer |

### Semaine 2 — Les signes (sourates 112, 113, 114)

| Jour | Lecture / tajwīd | Comprendre | Mémoriser |
|---|---|---|---|
| 8 | Sukūn (forme du muṣḥaf de Médine) | — | 112:1–2 |
| 9 | Voyelles longues (madd ṭabīʿī, 2 temps) ; petit alif ٰ, petit wāw ۥ, petit yāʾ ۦ | — | 112:3–4 |
| 10 | Shadda | Préfixes و ف ب ل ك | 113:1–2 |
| 11 | Tanwīn ; tāʾ marbūṭa ة ; alif maqṣūra ى | — | 113:3–5 |
| 12 | Hamza ; hamzat al-waṣl (ٱ) et comment commencer | — | 114:1–3 |
| 13 | Lettres solaires et lunaires ; le lām du nom d'Allah | Le verbe au passé (قَالَ، كَانَ) | 114:4–6 |
| 14 | **Bilan** : lire sans phonétique | — | **Défi** : enchaîner 1, 112, 113, 114 |

### Semaine 3 — Le tajwīd essentiel (sourates 108, 103, 110, 106)

| Jour | Lecture / tajwīd | Comprendre | Mémoriser |
|---|---|---|---|
| 15 | Makhārij : 5 zones, 17 points ; lettres emphatiques (خص ضغط قظ) | — | 108 |
| 16 | Nūn sākina et tanwīn (1) : iẓhār et iqlāb | — | 103 |
| 17 | Nūn sākina et tanwīn (2) : idghām avec et sans ghunna, ikhfāʾ | Le verbe à l'inaccompli (نَعْبُدُ، يَقُولُ) | 110:1–2 |
| 18 | Mīm sākina ; ghunna sur نّ et مّ | — | 110:3 |
| 19 | Qalqala | — | 106:1–2 |
| 20 | Le rāʾ : tafkhīm et tarqīq (bases) | La négation : لَا، مَا، لَمْ، لَنْ | 106:3–4 |
| 21 | **Bilan** : repérer les règles | — | **Défi** : réciter 108, 103, 110, 106 |

### Semaine 4 — Prolonger, s'arrêter, lire le muṣḥaf (105, 107, 109 en bonus)

| Jour | Lecture / tajwīd | Comprendre | Mémoriser |
|---|---|---|---|
| 22 | Madd muttaṣil et munfaṣil (signe ٓ) | L'annexion : رَبِّ ٱلْعَـٰلَمِينَ | 105:1–2 |
| 23 | Madd lāzim, ʿāriḍ li-s-sukūn, madd al-līn | — | 105:3–5 |
| 24 | Le waqf : s'arrêter (3 cas) ; signes de pause | — | 107:1–3 |
| 25 | Conventions du muṣḥaf de Médine : ۟ ۠ ۢ ۜ, tanwīn décalé, ۩ ۞ | — | 107:4–7 |
| 26 | Istiʿādha, basmala et adab de la récitation | Racines et schèmes (فَاعِل، مَفْعُول) | 109:1–3 |
| 27 | Lecture d'un passage inconnu, avec repérage | — | 109:4–6 |
| 28 | **Bilan** : lire sourate 87 sans phonétique | — | **Défi** : réciter tout le parcours |
| 29 | Révision générale | Synthèse de grammaire | Enchaînement complet |
| 30 | **Évaluation finale** et plan pour la suite | — | **Défi final** : récitation enregistrée, à faire écouter |

Les jours 22 à 27 marquent les sourates 105, 107 et 109 comme **bonus**. Un
débutant complet peut consacrer ce temps à consolider les 35 versets de base.

---

## 5. Types d'exercices

| Exercice | Ce qu'il entraîne | Audio requis |
|---|---|---|
| Lettre → nom (QCM, distracteurs de même forme) | Reconnaissance visuelle | non |
| Forme liée → lettre isolée | Lecture en contexte | non |
| Syllabe → phonétique | Décodage | non |
| Mot → nombre de lettres / quelle lettre manque | Analyse graphique | non |
| « Quelle règle ici ? » sur un mot réel du Coran | Repérage du tajwīd | non |
| « Combien de temps ce madd ? » | Durées | non |
| Écoute → quelle lettre (ح/ه, ع/ء, س/ص, ذ/ز/ظ, ت/ط, ك/ق, د/ض) | Discrimination auditive | oui (mot récité QF) |
| Mot arabe → sens / sens → mot arabe | Vocabulaire dans les deux sens | non |
| Mot récité → mot écrit | Lien son–écrit | oui |
| Verset suivant / mot manquant | Mémorisation | optionnel |
| Récitation avec masquage progressif + auto-évaluation | Mémorisation | oui |
| Enregistrement et comparaison | Production orale | micro |

Toutes les réponses alimentent FSRS : une carte par lettre, par règle, par
lemme et par verset mémorisé.

---

## 6. Rituels, défis et motivation

- **Séance du jour** : un seul parcours, chronométré à titre indicatif.
- **Défi express** (2 min) : 5 questions tirées de ce qui a **déjà** été vu.
  Le jour est calculé sur le fuseau horaire de l'appareil.
- **Défi de la semaine** (J7, J14, J21, J28) : une épreuve de lecture et une
  récitation enregistrée.
- **Série** : un jour « repos » par semaine protège la série.
- **Jalons** : une sourate mémorisée, 100 mots, toutes les règles de la
  semaine 3 vues. Pas de points, pas de classement.
- **Flashcards libres** : révision FSRS à tout moment, filtrable par type
  (lettres, règles, mots, versets).

---

## 7. Architecture technique

- **Next.js 16.4.6**, React 19.3, TypeScript, dépendances **épinglées**
  (fin des `"latest"`). `npm audit` doit être propre.
- **Contenu en dépôt** :
  - `content/sources/tanzil/quran-uthmani.txt`, verbatim, en-tête conservé ;
  - `content/sources/qac/`, fichiers dérivés du corpus avec leur notice GPL ;
  - `src/content/` : leçons, programme, lexique et phonétique, en TypeScript.
- **Build de contenu** (`npm run content:build`) : vérifie le SHA-256 de
  Tanzil, aligne Tanzil et QAC mot à mot, génère un JSON par sourate,
  résout chaque référence des leçons et échoue en cas d'incohérence.
- **Rendu statique** des 114 sourates et des 30 jours. La traduction et
  l'audio QF sont chargés côté serveur à l'exécution (cache 24 h ≤ 1 semaine),
  jamais écrits dans le dépôt.
- **Progression locale** dans `localStorage` sous une clé versionnée, avec un
  accès protégé par `try/catch`, un export et un import JSON. Plus de base
  SQLite, d'API `/api/progress` ou d'espace admin éphémère.
- **Sécurité** : en-têtes CSP, HSTS, Permissions-Policy (micro autorisé pour
  l'enregistrement local seulement).
- **Police** : Amiri Quran auto-hébergée via `next/font/local`.
- **Design** : nuit du désert. Vidéo en fond, vue à travers une grille de
  cartes en verre (*liquid glass*) ; dégradé WebGL « Soffit » pour la
  séance du jour ; thème clair « papier » pour la lecture longue ;
  `prefers-reduced-motion` respecté (vidéo et dégradé figés).
- **Accessibilité** : un `<h1>` par page, `lang="ar"` et `dir="rtl"` sur
  l'arabe, cibles tactiles de 44 px, focus visible, taille du texte arabe
  réglable.

---

## 8. Gouvernance du contenu

- Chaque leçon, glose et transcription porte un statut : `draft` (rédigé par
  Kalima), `reviewed` (relu, avec le **nom** du relecteur et la date) ou
  `approved`.
- La relecture passe par des **pull requests** GitHub : l'historique dit qui
  a validé quoi, sans base de données à maintenir.
- Rôles à pourvoir : un enseignant de tajwīd avec *ijāza* (leçons, phonétique,
  audio) et un arabisant (lexique, grammaire). Tant que ces rôles ne sont pas
  pourvus, l'application l'affiche.

---

## 9. Initiatives au-delà du code

1. **Enregistrer les 28 lettres et ~100 syllabes** par un récitant qualifié
   (avec ijāza si possible), sous licence claire (CC BY).
2. **Cercle de récitation hebdomadaire** en visio, où l'on fait écouter son
   enregistrement du défi de la semaine à un enseignant.
3. **Binômes** : deux apprenants commencent le même jour et se récitent les
   sourates.
4. **Carnet de tajwīd imprimable** (PDF A5) : les règles de la semaine 3 avec
   les exemples réels.
5. **Parcours suivants** : « Juzʾ ʿAmma en 90 jours » et « 1 000 mots »
   (89 % des occurrences).
6. **Retour d'erreur** sur chaque fiche (« signaler une erreur » → issue
   GitHub préremplie).

---

## 10. Ordre d'exécution et contrôles

1. ✅ Recherches et vérification des sources (ce document).
2. Socle : dépendances épinglées, suppression de l'ancien code et des données
   QF, en-têtes de sécurité.
3. Pipeline de contenu : Tanzil + QAC → JSON, avec tests d'intégrité.
4. Moteur d'apprentissage : stockage sûr, FSRS, générateurs d'exercices.
5. Contenu : leçons, programme, lexique de 300 lemmes, phonétique des
   sourates du programme.
6. Interface : design system, accueil, séance du jour, lecteur, révision.
7. Vérification : `typecheck`, `lint`, tests unitaires (contenu compris),
   `build`, `npm audit`, contrôle visuel en 390 px et 1440 px.
8. Push de la branche et pull request ; la mise en production reste une
   décision du propriétaire.
