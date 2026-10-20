# Guide de soutenance : démo sur l'émulateur Android

La démo se fait **sur ton PC** : l'application tourne dans un **émulateur Android** (un téléphone virtuel, pas besoin d'avoir un téléphone Android), et Firebase est remplacé par les **émulateurs Firebase** locaux. Pas de projet Firebase, rien à payer. **VS Code** reste ton éditeur : c'est dans son terminal que tu lances toutes les commandes.

Sommaire :

1. [Installation (une seule fois)](#1-installation-une-seule-fois)
2. [Lancer la démo](#2-lancer-la-démo)
3. [Préparer les données (la veille)](#3-préparer-les-données-la-veille)
4. [Préparer les tests (la veille)](#4-préparer-les-tests-la-veille)
5. [Le jour J : check-list](#5-le-jour-j--check-list)
6. [Déroulé de la démo (barème)](#6-déroulé-de-la-démo-barème)
7. [Dépannage](#7-dépannage)

---

## 1. Installation (une seule fois)

Une connexion Internet est nécessaire pour cette étape (plusieurs Go à télécharger).

> **Tout se fait côté Windows, pas dans WSL** : l'émulateur Android tourne sous Windows, et depuis WSL (Ubuntu, zsh…) Expo ne peut pas le piloter. Installer les outils avec leurs installateurs Windows, cloner le projet dans un dossier Windows (par ex. `C:\Users\<toi>\5MOBD`) et utiliser le terminal **Command Prompt** de VS Code. Si VS Code affiche « WSL: … » en bas à gauche : cliquer dessus > **Fermer la connexion à distance**.

### 1.1 Node.js 20.18.0

Installer [Node.js 20.18.0 pour Windows](https://nodejs.org/dist/v20.18.0/node-v20.18.0-x64.msi) (ou avec [nvm-windows](https://github.com/coreybutler/nvm-windows) : `nvm install 20.18.0` puis `nvm use 20.18.0`).

Vérifier dans un **nouveau** terminal : `node -v` → `v20.18.0`.

### 1.2 Java 21 (pour les émulateurs Firebase)

Installer [Eclipse Temurin JDK 21](https://adoptium.net/temurin/releases/?version=21) (fichier `.msi`) en cochant **« Set JAVA_HOME variable »** pendant l'installation.

Vérifier dans un nouveau terminal : `java -version` → version `21`.

### 1.3 Android Studio et le téléphone virtuel

1. Activer l'hyperviseur Windows (nécessaire à l'émulateur) : menu Démarrer > « Activer ou désactiver des fonctionnalités Windows » > cocher **Plateforme de l'hyperviseur Windows** > OK, puis **redémarrer le PC**.
2. Installer [Android Studio](https://developer.android.com/studio) avec les options par défaut (l'assistant installe le SDK Android et l'émulateur).
3. Pour que le téléphone virtuel s'ouvre dans **sa propre fenêtre** (et pas à l'intérieur d'Android Studio) : **File > Settings > Tools > Emulator** > décocher **Launch in the Running Devices tool window** > OK.
4. Ouvrir **Tools > Device Manager** (ou, sur l'écran d'accueil, **More Actions > Virtual Device Manager**).
5. **Create Virtual Device** : choisir un **Pixel** qui a l'**icône Play Store** dans la colonne *Play Store*, puis une image système **API 35** avec **Google Play** (télécharger si besoin) > **Finish**.

   > Une image « Google Play » est indispensable : sans les services Google, la carte (Google Maps) reste grise.

6. Démarrer le téléphone virtuel avec ▶ et attendre l'écran d'accueil.

Si l'émulateur refuse de démarrer : vérifier la **Plateforme de l'hyperviseur Windows** (étape 1) et la virtualisation dans le BIOS (voir [Dépannage](#7-dépannage)).

### 1.4 VS Code et le projet

1. Ouvrir le dossier du projet dans VS Code (**File > Open Folder**).
2. Ouvrir un terminal : **Terminal > New Terminal**.
3. Installer les dépendances :

   ```bash
   npm install
   ```

4. Premier lancement des émulateurs Firebase (télécharge leurs fichiers, environ 100 Mo) :

   ```bash
   npm run emulators
   ```

   Attendre « All emulators ready », puis arrêter avec **Ctrl+C**.

---

## 2. Lancer la démo

1. **Démarrer le téléphone virtuel** depuis Android Studio (*Device Manager* > ▶). Il s'ouvre dans sa propre fenêtre (étape 1.3) : tu peux réduire Android Studio.
2. **Choisir la position du téléphone** (sinon il est en Californie) : dans la barre de l'émulateur, bouton `⋯` (*Extended controls*) > **Location** > chercher **l'adresse de ton école** > **Set location**.

   > Prends une adresse précise plutôt que « Paris » : si la localisation est refusée, l'application se place au centre de Paris par défaut. Avec l'adresse de l'école, le jury voit clairement que la carte se centre sur la position du téléphone.

3. Dans VS Code, **terminal 1** :

   ```bash
   npm run demo:firebase
   ```

   Attendre « All emulators ready ». Ce script repart toujours des données préparées (étape 3) et **n'enregistre rien** : tu peux répéter la démo autant de fois que tu veux. La toute première fois, tant que les données ne sont pas préparées, lancer `npm run demo:prepare` à la place (étape 3).

4. **Terminal 2** (bouton ➕ du terminal, ou **Split Terminal** pour voir les deux côte à côte) :

   ```bash
   npm run demo:android
   ```

   - Au tout premier lancement, Expo propose d'installer **Expo Go** sur l'émulateur : accepter (Internet nécessaire).
   - L'application s'ouvre dans Expo Go. Si un message d'accueil d'Expo Go s'affiche, appuyer sur **Continue**.
   - Taper `r` dans ce terminal recharge l'application ; Ctrl+C l'arrête.

L'interface des émulateurs Firebase (comptes, données, photos, requêtes) est sur http://localhost:4000.

> Toujours démarrer `demo:firebase` **avant** l'application. Si tu l'as lancé après, tape `r` dans le terminal 2.

---

## 3. Préparer les données (la veille)

Les données (comptes, adresses, avis, photos) sont enregistrées dans le dossier `emulator-data/` du projet. Deux scripts les utilisent :

| Script | Rôle |
| --- | --- |
| `npm run demo:prepare` | **Préparation** : charge `emulator-data/` et **enregistre tout** à l'arrêt (Ctrl+C) |
| `npm run demo:firebase` | **Répétitions et jour J** : charge `emulator-data/` et **n'enregistre rien** ; à chaque lancement, on repart des données préparées |

Pour cette étape, lancer **`npm run demo:prepare`** dans le terminal 1 (à la place de `demo:firebase`), puis `npm run demo:android` dans le terminal 2.

### 3.1 Ajouter des photos dans la galerie de l'émulateur

Glisser-déposer quelques images (restaurants, cafés, un portrait…) depuis l'explorateur Windows **sur la fenêtre de l'émulateur** : elles arrivent dans la galerie du téléphone virtuel. L'appareil photo de l'émulateur fonctionne aussi (scène virtuelle).

### 3.2 Créer les données de démonstration

Dans l'application, créer :

| Compte | E-mail / mot de passe | Contenu à créer |
| --- | --- | --- |
| **Alice Martin** | `alice@demo.fr` / `demo1234` | photo de profil ; « Le Petit Bistrot » (**publique**, avec photo et description) ; « Chez mes parents » (**privée**) ; « Boulangerie du coin » (privée, servira à la suppression) |
| **Bob Durand** | `bob@demo.fr` / `demo1234` | « Café des Arts » (**publique**, avec photo) ; un **avis** (4 étoiles + photo) sur « Le Petit Bistrot » d'Alice |

Créer les adresses à des endroits différents autour de la position choisie (toucher la carte dans le formulaire) pour que la carte soit parlante. Laisser l'application **déconnectée** à la fin (Profil > « Se déconnecter ») : la démo commence par l'écran de connexion.

### 3.3 Sauvegarder

Pendant que `demo:prepare` tourne, dans un autre terminal :

```bash
npm run demo:save
```

Attendre « Export complete ». Puis arrêter `demo:prepare` avec **un seul Ctrl+C** et attendre la fin de l'arrêt (sous Windows, si « Terminer le programme de commandes (O/N) ? » s'affiche, ne pas refaire Ctrl+C).

**Vérifier** : lancer `npm run demo:firebase` et `npm run demo:android`, puis se connecter avec Alice : ses adresses doivent être là.

> Pour modifier les données plus tard, relancer `npm run demo:prepare` (jamais pour une répétition : elle serait enregistrée).

> Les données restent dans ton dossier `emulator-data/` (il n'est pas envoyé sur GitHub). Si tu présentes depuis un autre PC, copie ce dossier.

---

## 4. Préparer les tests (la veille)

Les commandes de tests démarrent leurs propres émulateurs : **arrêter `demo:firebase` (ou `demo:prepare`) avant** (sinon « port taken »). Garder les terminaux ouverts, ou faire des captures d'écran, pour les montrer pendant la soutenance.

```bash
npm test                 # 198 tests unitaires et fonctionnels
npm run test:coverage    # idem avec la couverture (~97 %)
npm run test:firebase    # 41 tests : règles de sécurité + parcours complet sur émulateurs Firebase
```

**Tests e2e (Maestro)** : installer le [CLI Maestro](https://docs.maestro.dev/getting-started/installing-maestro) puis suivre la section *Tests e2e* du [README](README.md#tests-e2e-avec-maestro-npm-run-e2e) (`npm run emulators`, `npm run start:e2e`, `npm run e2e`). Ils créent leurs propres comptes et déconnectent Expo Go : **les lancer la veille et filmer l'écran** (Win+Alt+R avec la Xbox Game Bar) pour montrer la vidéo pendant la soutenance.

**Plan B** : filmer aussi une démo complète de l'application, au cas où quelque chose ne marcherait pas le jour J.

---

## 5. Le jour J : check-list

**30 minutes avant :**

- [ ] PC branché sur secteur, connexion Internet (les fonds de carte en ont besoin)
- [ ] Android Studio : téléphone virtuel démarré, position réglée sur l'adresse de l'école
- [ ] VS Code ouvert sur le projet, avec ces onglets : `firestore.rules`, `storage.rules`, `src/screens/MapScreen.tsx`
- [ ] Terminal 1 : `npm run demo:firebase` (« All emulators ready »)
- [ ] Terminal 2 : `npm run demo:android` (application ouverte sur l'**écran de connexion** ; si un compte est connecté : Profil > « Se déconnecter »)
- [ ] Navigateur ouvert sur http://localhost:4000
- [ ] Résultats des tests et vidéo e2e prêts
- [ ] Mode « Ne pas déranger » de Windows activé

---

## 6. Déroulé de la démo (barème)

Durée indicative : 12 à 15 minutes. Les libellés entre « » sont ceux de l'application.

### 1. Inscription — 5 pts (1 min)

1. Écran de connexion > « Créer un compte ».
2. Saisir un nom, un e-mail (par ex. `jury@demo.fr`), et **deux mots de passe différents** > « Créer mon compte » : montrer le message « Les mots de passe ne correspondent pas. ».
3. Corriger > « Créer mon compte » : l'application ouvre directement la carte.

> À dire : compte créé dans Firebase Authentication, profil enregistré dans Firestore (`users/{uid}`), session conservée au redémarrage.

### 2. Carte centrée sur l'utilisateur — 15 pts (1 min)

1. Onglet « Carte » : la carte se centre automatiquement sur la position du téléphone (l'adresse de l'école), avec le point bleu.
2. Montrer la légende (mes adresses publiques / privées / adresses des autres) et le bouton de recentrage.

> À dire : `MapView` de `react-native-maps`, position obtenue avec `expo-location` après autorisation, puis `animateToRegion`. Si la localisation est refusée, un message s'affiche.

### 3. Photo de profil — 5 pts (1 min)

1. Onglet « Profil » > « Galerie » > choisir une photo : elle s'affiche.
2. « Supprimer la photo » : retour aux initiales.

> À dire : image envoyée dans Cloud Storage (`users/{uid}/avatar.jpg`) ; les règles n'autorisent que des images de moins de 5 Mo, dans son propre dossier.

### 4. Déconnexion et connexion — 10 pts (1 min)

1. « Se déconnecter » : retour à l'écran de connexion.
2. Se connecter avec `alice@demo.fr` et un **mauvais mot de passe** : « E-mail ou mot de passe incorrect. ».
3. Se connecter avec le bon mot de passe (`demo1234`).

### 5. Mes adresses publiques et privées — 10 pts (1 min)

1. Onglet « Mes adresses » : les adresses d'Alice avec leur badge « Publique » / « Privée ».
2. Filtres « Publiques », « Privées », « Toutes ».
3. Onglet « Carte » : les repères vert (publiques) et violet (privées).

### 6. Création d'une adresse — 25 pts (2 min)

1. Carte > bouton « + ».
2. « Nom » (par ex. « Le Comptoir »), « Description », « Photo » > « Galerie ».
3. Interrupteur « Adresse privée » → « Adresse publique » (montrer que l'adresse est privée par défaut).
4. « Emplacement » : le repère est sur la position actuelle ; toucher la carte pour le déplacer.
5. « Enregistrer l'adresse » : l'adresse apparaît sur la carte et dans « Mes adresses ».

> À dire : document `addresses/{id}` (propriétaire, nom, description, `isPublic`, coordonnées, URL de la photo) ; les règles valident chaque champ.

### 7. Adresses publiques des autres et avis avec photos — 20 pts (3 min)

1. « Se déconnecter », se connecter avec `bob@demo.fr`.
2. Onglet « Explorer » : Bob voit « Le Petit Bistrot » et « Le Comptoir » d'Alice, **mais pas** « Chez mes parents » (privée).
3. Ouvrir « Le Comptoir » > « Laisser un avis » : 4 étoiles, un commentaire, « Galerie » pour joindre une photo > « Publier l'avis » : l'avis apparaît avec la moyenne.
4. Ouvrir « Le Petit Bistrot » : l'avis préparé la veille, avec sa photo.

> À dire : avis dans la sous-collection `addresses/{id}/reviews` ; les règles interdisent les avis sur une adresse privée et l'usurpation d'auteur. Bob ne voit pas le bouton de suppression : il n'est pas propriétaire.

### 8. Suppression d'une adresse — 5 pts (30 s)

1. Se reconnecter avec Alice > « Mes adresses » > « Boulangerie du coin ».
2. « Supprimer l'adresse » > confirmer « Supprimer » : elle disparaît de la liste et de la carte.

> À dire : seul le propriétaire peut supprimer (règles Firestore) ; ses avis et sa photo sont supprimés avec elle.

### 9. Projet Firebase sécurisé — 5 pts (1 à 2 min)

1. VS Code : montrer `firestore.rules` (lecture des adresses privées réservée au propriétaire, création à son nom, validation des champs, avis seulement sur une adresse publique) et `storage.rules` (dossier personnel, images < 5 Mo).
2. Navigateur, http://localhost:4000 : **Authentication** (les comptes), **Firestore** (les données), onglet **Requests** de Firestore (chaque requête avec la règle qui l'a autorisée ou refusée), **Storage** (les photos).
3. Montrer le résultat de `npm run test:firebase` : 33 tests des règles (ce qui est autorisé et ce qui est refusé) + le parcours complet.

> À dire : la configuration Firebase n'est pas dans le code (variables d'environnement) ; pour la démo, les émulateurs officiels de Firebase appliquent exactement les mêmes règles qu'en ligne.

### 10. Tests — 25 pts (2 à 3 min)

1. **Tests unitaires et fonctionnels (10 pts)** : résultat de `npm test` (198 tests) et de la couverture. Ouvrir par exemple `src/screens/__tests__/NewAddressScreen.test.tsx` (création privée / publique) et `src/__tests__/navigation.test.tsx` (routes protégées).
2. **Tests e2e (10 pts)** : la vidéo Maestro, et un parcours ouvert dans VS Code (`.maestro/flows/04_adresses_publiques_et_avis.yaml`).
3. **Storybook (5 pts)** : arrêter le terminal 2 (Ctrl+C), lancer `npm run start:storybook` puis taper `a` : Storybook s'ouvre sur l'émulateur avec les 11 composants. Pour revenir à l'application : Ctrl+C puis `npm run demo:android`.

> Garder Storybook pour la fin : le retour à l'application prend environ une minute.

---

## 7. Dépannage

| Problème | Solution |
| --- | --- |
| `zsh: command not found: java` (ou `node`), terminal Ubuntu / WSL | Le terminal est dans WSL : revenir côté Windows (voir l'encadré au début de la section 1), terminal **Command Prompt**, projet cloné dans un dossier Windows |
| PowerShell : « l'exécution de scripts est désactivée sur ce système » | Dans VS Code, flèche à côté du ➕ du terminal > **Command Prompt**, ou exécuter une fois `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| « port taken » au lancement de `demo:firebase`, `demo:prepare` ou des tests | D'anciens émulateurs tournent encore : fermer tous les terminaux ; sinon terminer le processus « OpenJDK Platform binary » dans le Gestionnaire des tâches |
| `java` introuvable ou mauvaise version | Installer le JDK 21 (étape 1.2) puis **redémarrer VS Code** |
| L'émulateur ne démarre pas ou est très lent | Cocher **Plateforme de l'hyperviseur Windows** (étape 1.3) puis redémarrer ; activer la virtualisation (Intel VT-x / AMD-V, « SVM ») dans le BIOS ; fermer les applications gourmandes ; dans le *Device Manager* : ⋮ > **Cold Boot Now** |
| La carte reste grise | Vérifier Internet ; l'image système doit être une image **Google Play** (recréer le téléphone virtuel, étape 1.3) |
| La carte est centrée en Californie, ou n'a pas suivi un changement de position | *Extended controls* > **Location** > choisir l'adresse > **Set location**, puis `r` dans le terminal 2 (la position est lue à l'ouverture de l'application) |
| « Problème de connexion réseau » à l'inscription ou à la connexion | `demo:firebase` n'est pas lancé : le lancer, attendre « All emulators ready », puis `r` dans le terminal 2 |
| « Project is incompatible with this version of Expo Go » | Désinstaller Expo Go de l'émulateur (appui long sur l'icône > désinstaller) puis relancer `npm run demo:android` : Expo réinstalle la version du SDK 53 |
| Expo ne trouve pas l'émulateur | Le démarrer **avant** `npm run demo:android` depuis le *Device Manager* d'Android Studio |
| Pas de photos dans la galerie | Refaire le glisser-déposer des images sur l'émulateur, ou utiliser « Photo » (appareil photo virtuel) |
| `Directory "…emulator-data" does not exist` au lancement de `demo:firebase` | Les données n'ont pas encore été préparées : lancer `npm run demo:prepare` (étape 3) |
| Les données préparées ont disparu ou ont changé | Vérifier que le dossier `emulator-data/` existe ; répéter uniquement avec `demo:firebase` (qui n'enregistre rien), jamais avec `demo:prepare` |
| Comportement étrange après une modification du code | Ctrl+C puis `npm run demo:android` (le cache est vidé à chaque lancement) |
