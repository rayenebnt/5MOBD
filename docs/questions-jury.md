# Questions possibles du jury (avec réponses)

Réponses courtes, à dire avec tes mots. Les fichiers cités permettent de montrer le code si le jury le demande.

---

## 1. Choix techniques

**Pourquoi Expo plutôt que React Native « nu » (CLI) ?**
Expo fournit directement les modules dont j'avais besoin (localisation, appareil photo, galerie, carte) sans configuration native, et Expo Go permet de tester sur un vrai téléphone sans compiler l'application. Expo Router apporte en plus une navigation par fichiers avec des routes protégées.

**Pourquoi Node 22 alors que la consigne demande 20.18.0 ?**
Pour faire la démo sur iPhone, Expo Go (App Store) n'accepte que le dernier SDK d'Expo, le 58, et on ne peut pas installer une version plus ancienne. Ce SDK utilise React Native 0.88, qui exige Node ≥ 22.13. J'ai donc pris Node 22.22.0, une version LTS. La consigne autorise une autre version si elle est documentée : toutes les versions sont dans le README.

**Pourquoi Firebase ?**
Il couvre tout le back-end demandé sans serveur à écrire : authentification, base de données temps réel (Firestore) et stockage des photos (Cloud Storage). La sécurité est gérée par des règles déclaratives que l'on peut tester.

**Pourquoi Firestore et pas Realtime Database ?**
Firestore a des requêtes plus riches (filtres sur des champs), des documents structurés avec sous-collections (les avis sous chaque adresse) et des règles de sécurité plus expressives, avec validation des champs.

**Pourquoi TypeScript ?**
Pour détecter les erreurs avant l'exécution : les modèles (`Address`, `Review`, `AppUser` dans `src/types/models.ts`) sont typés, et `npm run typecheck` vérifie tout le projet.

---

## 2. Architecture

**Comment est organisé le code ?**
En couches : les écrans (`app/` et `src/screens`) utilisent des hooks et un contexte (`src/hooks`, `src/context/AuthContext.tsx`), qui appellent des services (`src/services`). Seuls les services parlent à Firebase. Les écrans ne connaissent donc pas Firebase, ce qui les rend faciles à tester.

**Comment protégez-vous les écrans réservés aux utilisateurs connectés ?**
Dans `app/_layout.tsx`, avec `Stack.Protected` d'Expo Router : les onglets et les écrans d'adresse ne sont accessibles que si un utilisateur est connecté, sinon on reste sur connexion / inscription. C'est testé dans `src/__tests__/navigation.test.tsx`.

**Comment la session reste-t-elle ouverte après un redémarrage ?**
Firebase Auth est initialisé avec une persistance AsyncStorage (`getReactNativePersistence` dans `src/config/firebase.ts`). Au lancement, `onAuthStateChanged` renvoie l'utilisateur déjà connecté.

**Les données sont-elles en temps réel ?**
Oui : les listes, la carte et les avis utilisent `onSnapshot` de Firestore. Quand Bob ajoute un avis, il apparaît chez Alice sans recharger.

**Comment sont modélisées les données ?**
Trois niveaux dans Firestore : `users/{uid}` (profil), `addresses/{id}` (propriétaire, nom, description, photo, `isPublic`, coordonnées) et `addresses/{id}/reviews/{id}` (auteur, note, commentaire, photo). Les photos sont dans Cloud Storage, dans un dossier par utilisateur.

**Pourquoi stocker le nom du propriétaire dans chaque adresse (dénormalisation) ?**
Pour afficher « par Alice » sans faire une lecture supplémentaire par adresse. Et le profil `users/{uid}` n'est lisible que par son propriétaire, pour ne pas exposer les e-mails. Limite assumée : si un utilisateur change de nom, les anciennes adresses gardent l'ancien.

**Pourquoi aucun index composite ?**
Les requêtes n'ont qu'un filtre d'égalité (`ownerId == uid` ou `isPublic == true`) ; le tri par date est fait dans l'application. Il n'y a donc rien à configurer dans la console Firebase.

---

## 3. Sécurité

**Comment garantissez-vous qu'un utilisateur ne voit pas les adresses privées des autres ?**
Côté serveur, par les règles Firestore (`firestore.rules`) : une adresse n'est lisible que si elle est publique ou si on en est le propriétaire. Même une requête faite à la main sans passer par l'application est refusée. Le filtrage dans l'application n'est qu'un confort d'affichage.

**Qu'est-ce qui empêche quelqu'un de modifier ou supprimer l'adresse d'un autre ?**
Les règles : la création exige `ownerId == uid de l'utilisateur connecté`, et seul le propriétaire peut modifier (sans changer de propriétaire) ou supprimer.

**Les données sont-elles validées ?**
Oui, côté serveur : champs autorisés uniquement, nom de 1 à 80 caractères, description ≤ 500, latitude et longitude valides, note entière de 1 à 5, commentaire de 1 à 500 caractères. Côté application, les formulaires valident aussi (`src/utils/validation.ts`) pour afficher les erreurs.

**Et pour les photos ?**
Règles Storage (`storage.rules`) : il faut être connecté, on n'écrit que dans son propre dossier, uniquement des images de moins de 5 Mo ; tout autre chemin est interdit. Les photos sont aussi compressées à l'envoi (qualité 0,5).

**La clé API Firebase est-elle un secret ?**
Non : la configuration Firebase d'une application mobile est publique par nature, puisqu'elle est dans l'application installée. La sécurité repose sur les règles, pas sur la clé. Elle n'est quand même pas écrite dans le code : elle vient des variables d'environnement (`.env.local`, voir `.env.example`).

**Comment savez-vous que vos règles fonctionnent ?**
Elles sont testées : 33 tests sur les émulateurs Firebase (`tests/rules/`) vérifient ce qui est autorisé et ce qui est refusé, plus un parcours complet avec les vrais services de l'app (`tests/integration/`). Commande : `npm run test:firebase`.

**Que se passe-t-il quand on supprime une adresse qui a des avis ?**
Un batch Firestore supprime en une seule opération les avis et l'adresse, puis la photo est supprimée du Storage. Les règles autorisent le propriétaire de l'adresse à supprimer les avis de son adresse.

**Une limite de sécurité connue ?**
Les photos sont servies par des URL de téléchargement Firebase qui contiennent un jeton : quelqu'un qui obtient l'URL exacte d'une photo d'adresse privée peut l'afficher. Pour aller plus loin, on vérifierait dans les règles Storage que l'adresse est publique avant d'autoriser la lecture.

---

## 4. Fonctionnalités

**Comment la carte se centre-t-elle sur l'utilisateur ?**
Le hook `useCurrentLocation` demande la permission avec `expo-location`, récupère la position, puis la carte appelle `animateToRegion` sur cette position (`src/screens/MapScreen.tsx`). Le point bleu vient de `showsUserLocation`.

**Et si l'utilisateur refuse la localisation ?**
La carte s'affiche au centre de Paris par défaut, avec un message qui explique qu'il faut autoriser la localisation. À la création d'une adresse, il peut toujours toucher la carte pour placer le repère.

**Comment choisit-on l'emplacement d'une adresse ?**
Par défaut à la position actuelle, puis en touchant la carte ou en déplaçant le repère (`src/components/LocationPicker.tsx`).

**Comment se fait l'envoi d'une photo ?**
`expo-image-picker` renvoie un fichier local (galerie ou appareil photo). Il est converti en blob et envoyé dans Cloud Storage avec `uploadBytes`, puis on enregistre son URL de téléchargement dans Firestore (`src/services/storageService.ts`).

**Pourquoi le propriétaire ne peut-il pas laisser d'avis sur sa propre adresse ?**
Un avis n'a de sens que venant des autres utilisateurs : le formulaire n'est affiché que sur les adresses publiques des autres. Les règles, elles, interdisent les avis sur une adresse privée.

**Pourquoi une adresse est-elle privée par défaut ?**
Par prudence : l'utilisateur doit choisir explicitement de partager une adresse.

---

## 5. Tests

**Quelle est la différence entre vos tests unitaires et fonctionnels ?**
Les tests unitaires vérifient une fonction ou un composant isolé (validation, services avec Firebase simulé, composants). Les tests fonctionnels utilisent un écran complet du point de vue de l'utilisateur avec React Native Testing Library : saisir, appuyer, vérifier ce qui s'affiche. Par exemple, créer une adresse publique dans `NewAddressScreen.test.tsx`.

**Comment testez-vous sans vraie base de données ?**
Dans Jest, le SDK Firebase et les services sont remplacés par des simulations (mocks) dans `jest.setup.ts`. Pour vérifier le vrai comportement de Firebase, les tests `npm run test:firebase` tournent sur les émulateurs officiels.

**Combien de tests et quelle couverture ?**
203 tests unitaires et fonctionnels (environ 97 % de couverture, `npm run test:coverage`), 41 tests sur émulateurs, 4 parcours e2e Maestro et 31 stories Storybook.

**Pourquoi Maestro pour les tests e2e ?**
C'est l'outil recommandé par Expo : les parcours sont écrits en YAML lisible (`.maestro/flows/`), ils fonctionnent avec Expo Go sans configuration native, contrairement à Detox. Ils pilotent un émulateur ou un simulateur.

**À quoi sert Storybook ?**
À développer et montrer chaque composant isolément, dans tous ses états (bouton désactivé, adresse privée, avis avec photo…). Les 31 stories sont aussi rendues dans Jest pour vérifier qu'elles restent valides (`src/components/__tests__/stories.test.tsx`).

**Un test qui vous a été utile ?**
Le test d'intégration sur émulateurs a trouvé un vrai bug : la suppression de la photo de profil envoyait une valeur refusée par Firebase Auth. Il a aussi confirmé que la suppression d'une adresse avec ses avis respecte bien les règles.

---

## 6. Démo et environnement

**Pourquoi utiliser les émulateurs Firebase au lieu d'un vrai projet ?**
Cloud Storage, nécessaire pour les photos, demande désormais le forfait payant Blaze. Les émulateurs sont les outils officiels de Firebase et appliquent exactement les mêmes règles. Pour passer en ligne, il suffit de créer le projet, de remplir `.env.local` et de déployer les règles (`npm run deploy:rules`), sans changer le code.

**Comment l'iPhone communique-t-il avec le PC ?**
Les deux sont sur le même réseau (le partage de connexion de l'iPhone). Expo Go charge l'application depuis le PC, et l'app se connecte aux émulateurs Firebase à l'adresse de ce même PC, détectée automatiquement.

**Quelles difficultés avez-vous rencontrées ?**
La version d'Expo Go sur iPhone, qui m'a obligé à migrer plusieurs fois, jusqu'au SDK 58 (Expo Go s'est mis à jour pendant le projet). Le coût de Cloud Storage, résolu avec les émulateurs. Et le réseau entre l'iPhone et le PC : sortir de WSL, supprimer d'anciennes redirections de ports, régler le pare-feu. J'ai aussi fait en sorte que les photos restent visibles même si l'adresse IP du PC change.

---

## 7. Améliorations possibles

**Que feriez-vous avec plus de temps ?**
- Modifier une adresse (nom, photo, visibilité) et supprimer son propre avis depuis l'application.
- Des requêtes géographiques (geohash) pour ne charger que les adresses proches, au lieu de toutes les adresses publiques.
- Pagination des listes et des avis.
- Supprimer son compte et ses données (RGPD).
- Restreindre la lecture des photos privées dans les règles Storage.
- Mettre l'application en ligne (vrai projet Firebase, build avec EAS) et lancer les tests dans une intégration continue.

**L'application passerait-elle à l'échelle ?**
Firebase gère la montée en charge côté serveur. Le point à améliorer est la requête des adresses publiques, qui charge toutes les adresses : avec beaucoup d'utilisateurs, il faudrait filtrer par zone géographique et paginer.
