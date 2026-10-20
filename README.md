# Mes Bonnes Adresses

Application mobile (Expo / React Native + Firebase) permettant de sauvegarder, gérer et partager ses adresses favorites, privées ou publiques, de les visualiser sur une carte centrée sur sa position, et de laisser des avis (note, commentaire, photo) sur les adresses publiques des autres utilisateurs.

Projet réalisé seul.

## Sommaire

1. [Fonctionnalités et barème](#fonctionnalités-et-barème)
2. [Versions des outils](#versions-des-outils)
3. [Installation](#installation)
4. [Présenter l'application (soutenance)](#présenter-lapplication-soutenance)
5. [Architecture](#architecture)
6. [Modèle de données et sécurité](#modèle-de-données-et-sécurité)
7. [Tests](#tests)
8. [Storybook](#storybook)
9. [Facultatif : vrai projet Firebase en ligne](#facultatif--vrai-projet-firebase-en-ligne)

## Fonctionnalités et barème

| Critère | Réalisation | Où le trouver |
| --- | --- | --- |
| Projet Firebase sécurisé | Règles Firestore et Storage (authentification obligatoire, propriétaire uniquement, validation des données, images < 5 Mo) | `firestore.rules`, `storage.rules`, `tests/rules/` |
| Inscription | Nom, e-mail, mot de passe + confirmation, messages d'erreur en français | `src/screens/RegisterScreen.tsx` |
| Connexion | E-mail / mot de passe, session conservée (AsyncStorage) | `src/screens/LoginScreen.tsx`, `src/config/firebase.ts` |
| Déconnexion | Bouton dans l'onglet Profil | `src/screens/ProfileScreen.tsx` |
| Photo de profil | Ajout depuis la galerie ou l'appareil photo, remplacement, suppression | `src/screens/ProfileScreen.tsx`, `src/services/authService.ts` |
| MapView centrée sur l'utilisateur | `react-native-maps` + `expo-location` : la carte se centre automatiquement sur la position actuelle | `src/screens/MapScreen.tsx`, `src/hooks/useCurrentLocation.ts` |
| Création d'adresse : privée / publique | Interrupteur « Adresse publique / privée » (privée par défaut) | `src/screens/NewAddressScreen.tsx` |
| Création d'adresse : nom / photo / description | Formulaire + choix de la photo + emplacement sur la carte (position actuelle par défaut) | `src/screens/NewAddressScreen.tsx` |
| Suppression d'adresse | Par le propriétaire, après confirmation (supprime aussi les avis et la photo) | `src/screens/AddressDetailScreen.tsx` |
| Mes adresses publiques et privées | Onglet « Mes adresses » (filtres Toutes / Publiques / Privées) et carte | `src/screens/MyAddressesScreen.tsx` |
| Adresses publiques des autres | Onglet « Explorer » et carte | `src/screens/ExploreScreen.tsx` |
| Avis et photos en commentaires | Note 1 à 5, commentaire et photo facultative sur les adresses publiques | `src/components/ReviewForm.tsx`, `src/services/reviewService.ts` |
| Tests unitaires et fonctionnels | Jest + React Native Testing Library (197 tests) + tests sur émulateurs Firebase (41 tests) | `src/**/__tests__/`, `tests/` |
| Tests e2e | Maestro (4 parcours) | `.maestro/` |
| Storybook | Storybook React Native 9 (11 composants, 31 stories) | `.rnstorybook/`, `src/components/*.stories.tsx` |

## Versions des outils

Le projet utilise **Node.js LTS 20.18.0** (fichier `.nvmrc`).

| Outil | Version |
| --- | --- |
| Node.js | 20.18.0 |
| npm | 10.8.2 (fourni avec Node 20.18.0) |
| Expo SDK | 53 (`expo` 53.0.27) |
| React Native | 0.79.6 |
| React | 19.0.0 |
| Expo Router | 5.1.11 |
| react-native-maps | 1.20.1 |
| Firebase JS SDK | 12.19.0 |
| TypeScript | 5.8.3 |
| Jest / jest-expo | 29.7.0 / 53.0.14 |
| React Native Testing Library | 13.3.3 |
| Storybook / @storybook/react-native | 9.1.20 / 9.1.4 |
| firebase-tools (émulateurs) | 15.33.0 |
| @firebase/rules-unit-testing | 5.0.2 |
| Java (émulateurs Firebase) | JDK 21 |
| Maestro (tests e2e) | CLI 1.x (dernière version) |

**Pourquoi Expo SDK 53 ?** C'est la version la plus récente compatible avec Node.js 20.18.0 : à partir du SDK 54, React Native (0.81+) exige Node.js ≥ 20.19.4.

> Les paquets `@react-navigation/*` sont figés (section `overrides` du `package.json`) sur les versions publiées pendant la période du SDK 53 : les versions plus récentes ne sont plus compatibles avec Expo Router 5.

## Installation

```bash
nvm use            # Node.js 20.18.0
npm install
```

## Présenter l'application (soutenance)

**Aucun projet Firebase ni paiement n'est nécessaire.** L'application utilise les **émulateurs Firebase** qui tournent sur l'ordinateur (Authentication, Firestore, Storage), avec les mêmes règles de sécurité (`firestore.rules`, `storage.rules`) qu'un vrai projet.

### Prérequis

- Node.js 20.18.0 et `npm install`
- **JDK 21** (par exemple [Eclipse Temurin](https://adoptium.net/)) : nécessaire aux émulateurs Firebase
- **Android Studio** avec un émulateur Android (recommandé), ou un téléphone Android
- Une connexion Internet pour les fonds de carte (Google Maps) et pour le premier lancement

### Option recommandée : émulateur Android sur l'ordinateur

Démarrer d'abord l'émulateur depuis Android Studio (*Device Manager* > ▶) et attendre l'écran d'accueil, puis :

```bash
npm run demo:firebase    # terminal 1 : émulateurs Firebase (données sauvegardées)
npm run demo:android     # terminal 2 : l'application dans Expo Go sur l'émulateur Android
```

- Au premier lancement, Expo installe automatiquement **Expo Go pour le SDK 53** dans l'émulateur.
- **Position** : l'émulateur Android est placé en Californie par défaut. Pour centrer la carte ailleurs (ex. Paris) : bouton `⋯` (*Extended controls*) > *Location*, choisir le lieu puis *Set location*, et relancer l'application.
- **Photos** : glisser-déposer des images sur la fenêtre de l'émulateur pour les ajouter à la galerie, ou utiliser l'appareil photo de l'émulateur (scène virtuelle).

### Autre option : vrai téléphone Android

1. Installer **Expo Go SDK 53** depuis [expo.dev/go](https://expo.dev/go?sdkVersion=53&platform=android&device=true) (la version du Play Store suit le dernier SDK).
2. Connecter le téléphone et l'ordinateur **au même Wi-Fi** (le partage de connexion du téléphone fonctionne aussi ; les Wi-Fi d'école bloquent souvent les échanges entre appareils).
3. Lancer `npm run demo:firebase` puis `npm run demo:phone`, et scanner le QR code avec Expo Go. L'adresse de l'ordinateur est détectée automatiquement.

- Sous Windows, autoriser Node.js et Java dans le pare-feu quand il le demande.
- Les photos enregistrées contiennent l'adresse de l'ordinateur sur le réseau : préparer les données sur le même réseau que celui de la soutenance (ou utiliser l'émulateur Android).
- iPhone : l'App Store ne propose que la dernière version d'Expo Go, incompatible avec le SDK 53 ; utiliser l'émulateur Android.

### Préparer les données à l'avance

`npm run demo:firebase` recharge au démarrage les données du dossier `emulator-data/` et les y enregistre à l'arrêt.

- **Sauvegarder sans risque** : pendant que `demo:firebase` tourne, lancer `npm run demo:save` dans un autre terminal et attendre « Export complete ».
- **Arrêter** : un seul **Ctrl+C**, puis attendre la fin de l'arrêt avant de fermer la fenêtre (sous Windows, si « Terminer le programme de commandes (O/N) ? » s'affiche, ne pas refaire Ctrl+C).
- Si « port taken » s'affiche au lancement suivant, d'anciens émulateurs tournent encore : fermer les terminaux, ou terminer le processus Java dans le Gestionnaire des tâches.

Interface des émulateurs (comptes, données, photos, requêtes autorisées / refusées) : http://localhost:4000.

Conseil : préparer deux comptes (par exemple Alice et Bob), quelques adresses publiques et privées avec photos, et un avis.

### Déroulé possible (barème)

| Étape | À montrer |
| --- | --- |
| Projet Firebase sécurisé | `firestore.rules`, `storage.rules`, onglet *Requests* de Firestore dans l'interface des émulateurs, résultat de `npm run test:firebase` (voir ci-dessous) |
| Inscription, connexion, déconnexion | Créer un compte, se déconnecter (Profil), se reconnecter, message en cas de mauvais mot de passe |
| Photo de profil | Profil > Galerie / Photo, puis Supprimer la photo |
| Carte | Onglet Carte centré sur la position, légende des repères, bouton de recentrage |
| Création d'adresse | Bouton `+` : nom, description, photo, interrupteur privée / publique, emplacement |
| Visualiser les adresses | « Mes adresses » (filtres Publiques / Privées) ; avec l'autre compte, « Explorer » montre seulement les adresses publiques |
| Avis et photos | Sur l'adresse publique de l'autre compte : note, commentaire et photo |
| Suppression | Détail de sa propre adresse > Supprimer l'adresse |
| Tests | Résultats de `npm test`, `npm run test:firebase` et `npm run e2e`, puis Storybook (`npm run start:storybook`) |

**Lancer les tests avant la démonstration** (ou après l'avoir arrêtée) et garder les résultats à l'écran : `npm run test:firebase` et les tests e2e démarrent leurs propres émulateurs sur les mêmes ports que `demo:firebase` (9099, 8080, 9199) et échouent (« port taken ») s'il tourne. Les tests e2e déconnectent aussi Expo Go et déplacent la position de l'émulateur : se reconnecter au compte de démonstration ensuite.

## Architecture

```
app/                       Routes Expo Router
  _layout.tsx              Pile racine : routes protégées (connecté / déconnecté)
  login.tsx, register.tsx
  (tabs)/                  Carte, Mes adresses, Explorer, Profil
  address/new.tsx          Création d'une adresse
  address/[id].tsx         Détail, avis, suppression
src/
  config/firebase.ts       Initialisation Firebase (+ émulateurs)
  context/AuthContext.tsx  Session utilisateur et actions (connexion, inscription, photo…)
  services/                Accès Firebase : authService, addressService, reviewService, storageService
  hooks/                   useCurrentLocation, useAddresses, useReviews
  screens/                 Écrans de l'application
  components/              Composants réutilisables (+ stories Storybook)
  utils/                   Validation, messages d'erreur, carte, sélection d'image
  testing/                 Données et utilitaires de test
tests/
  rules/                   Tests des règles Firestore et Storage
  integration/             Services de l'app exécutés contre les émulateurs
.maestro/                  Tests e2e Maestro
.rnstorybook/              Configuration Storybook
```

## Modèle de données et sécurité

**Firestore**

| Collection | Champs | Lecture | Écriture |
| --- | --- | --- | --- |
| `users/{uid}` | `displayName`, `email`, `photoURL`, `createdAt` | le propriétaire | création par le propriétaire (e-mail du compte) ; mise à jour de `displayName` / `photoURL` seulement ; suppression interdite |
| `addresses/{id}` | `ownerId`, `ownerName`, `name`, `description`, `isPublic`, `latitude`, `longitude`, `photoURL`, `createdAt` | adresse publique : tout utilisateur connecté ; adresse privée : le propriétaire | création à son nom, champs validés (nom 1–80 car., description ≤ 500, coordonnées valides) ; modification / suppression par le propriétaire |
| `addresses/{id}/reviews/{id}` | `authorId`, `authorName`, `authorPhotoURL`, `rating`, `comment`, `photoURL`, `createdAt` | comme l'adresse | création à son nom sur une adresse **publique** (note entière 1–5, commentaire 1–500 car.) ; pas de modification ; suppression par l'auteur ou le propriétaire de l'adresse |

**Cloud Storage** : `users/{uid}/…` (photo de profil), `addresses/{uid}/…` (photo d'adresse), `reviews/{addressId}/{uid}/…` (photo d'avis). Lecture pour les utilisateurs connectés, écriture uniquement dans son propre dossier, uniquement des images de moins de 5 Mo ; tout autre chemin est interdit.

## Tests

| Commande | Contenu |
| --- | --- |
| `npm test` | Tests unitaires et fonctionnels (Jest + React Native Testing Library) |
| `npm run test:coverage` | Idem avec la couverture de code |
| `npm run test:firebase` | Règles de sécurité + services de l'app contre les émulateurs Firebase (JDK 21 requis) |
| `npm run e2e` | Tests e2e Maestro |
| `npm run typecheck` | Vérification TypeScript |

### Tests unitaires et fonctionnels (`npm test`)

- **Unitaires** : validation des formulaires, messages d'erreur, utilitaires, services Firebase (SDK simulé), hooks, contexte d'authentification, composants.
- **Fonctionnels** : chaque écran est testé du point de vue de l'utilisateur (saisie, clics, navigation, centrage de la carte, création privée / publique, suppression, avis…), ainsi que la navigation complète avec le vrai routeur Expo Router (`src/__tests__/navigation.test.tsx`).
- **Stories** : chaque story Storybook est rendue dans Jest (`src/components/__tests__/stories.test.tsx`).

### Tests sur émulateurs Firebase (`npm run test:firebase`)

Lance ses propres émulateurs (ports 9099, 8080, 9199) : arrêter `npm run demo:firebase` / `npm run emulators` avant.

- `tests/rules/` : 33 tests des règles Firestore et Storage (`@firebase/rules-unit-testing`).
- `tests/integration/` : parcours complet exécuté avec les **services de l'application** et le vrai SDK Firebase (inscription, photo de profil, adresses privée / publique, visibilité, avis avec photo, suppression).

### Tests e2e avec Maestro (`npm run e2e`)

Parcours dans `.maestro/flows/` :

1. `01_authentification` : inscription, profil, déconnexion, mauvais mot de passe, connexion, session conservée au redémarrage.
2. `02_carte` : carte, légende, localisation autorisée, recentrage, accès à la création.
3. `03_adresses` : validation, création d'une adresse privée et d'une publique, filtres, détail, suppression.
4. `04_adresses_publiques_et_avis` : un 2e utilisateur voit uniquement l'adresse publique, laisse un avis noté ; le propriétaire le retrouve.

Prérequis : [Maestro CLI](https://maestro.mobile.dev) et un émulateur Android démarré.

```bash
# Terminal 1 : backend local sans sauvegarde (les comptes de test ne se mélangent pas aux données de démonstration)
npm run emulators
# Terminal 2 : application dans Expo Go, branchée sur les émulateurs
npm run start:e2e
# Terminal 3 : tests e2e
npm run e2e
```

Avec un build natif (`com.mesbonnesadresses.app`) au lieu d'Expo Go : `npm run e2e:build:android` puis `npm run e2e:native`.

## Storybook

Storybook React Native s'affiche directement dans l'application :

```bash
npm run start:storybook     # puis ouvrir dans Expo Go
```

Les stories sont à côté des composants (`src/components/*.stories.tsx`). Après l'ajout d'un fichier de stories, `npm run start:storybook` régénère `.rnstorybook/storybook.requires.ts` (ou `npm run storybook:generate`).

## Facultatif : vrai projet Firebase en ligne

Inutile pour la soutenance. Pour un déploiement réel, Authentication et Firestore sont gratuits (forfait Spark), mais **Cloud Storage (photos) exige le forfait Blaze** (carte bancaire, avec un quota gratuit).

1. Créer un projet sur la [console Firebase](https://console.firebase.google.com/).
2. **Authentication** : activer le fournisseur « Adresse e-mail/Mot de passe ».
3. **Firestore Database** : créer la base (mode production).
4. **Storage** : activer Cloud Storage (forfait Blaze).
5. Ajouter une **application Web** au projet et copier sa configuration dans un fichier `.env.local` :

   ```bash
   cp .env.example .env.local
   # puis renseigner les variables EXPO_PUBLIC_FIREBASE_*
   ```

6. Déployer les règles de sécurité :

   ```bash
   npx firebase login
   npx firebase use --add      # choisir le projet créé
   npm run deploy:rules
   ```

Aucun index composite n'est nécessaire (les requêtes n'utilisent qu'un filtre d'égalité, le tri est fait côté application).

Lancer ensuite l'application :

```bash
npm start          # puis "a" (Android) ou "i" (iOS)
```

L'application fonctionne dans **Expo Go pour le SDK 53** :

- **Émulateur Android / simulateur iOS** : `npm run android` ou `npm run ios` installe automatiquement la bonne version d'Expo Go.
- **Téléphone Android** : installer Expo Go SDK 53 depuis [expo.dev/go](https://expo.dev/go?sdkVersion=53&platform=android&device=true) (la version du Play Store suit le dernier SDK).
- **iPhone** : l'App Store ne propose que la dernière version d'Expo Go ; utiliser un simulateur ou un build de développement (`npx expo run:ios`).

Pour un build natif Android (`npx expo run:android`), renseigner `GOOGLE_MAPS_API_KEY` (clé Google Maps SDK for Android) ; Expo Go n'en a pas besoin.
