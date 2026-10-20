# Guide de soutenance : démo sur iPhone avec Expo Go

La démo se fait **sur ton iPhone**, dans l'application **Expo Go** (App Store), et Firebase est remplacé par les **émulateurs Firebase** qui tournent sur ton PC. Pas de projet Firebase, rien à payer, pas besoin d'Android Studio pour la démo. **VS Code** reste ton éditeur : c'est dans son terminal que tu lances toutes les commandes.

Sommaire :

1. [Installation (une seule fois)](#1-installation-une-seule-fois)
2. [Le réseau : PC et iPhone doivent se voir](#2-le-réseau--pc-et-iphone-doivent-se-voir)
3. [Lancer la démo](#3-lancer-la-démo)
4. [Préparer les données (la veille)](#4-préparer-les-données-la-veille)
5. [Préparer les tests (la veille)](#5-préparer-les-tests-la-veille)
6. [Le jour J : check-list](#6-le-jour-j--check-list)
7. [Déroulé de la démo (barème)](#7-déroulé-de-la-démo-barème)
8. [Dépannage](#8-dépannage)

---

## 1. Installation (une seule fois)

> **Tout se fait côté Windows, pas dans WSL** : depuis WSL, l'iPhone ne peut pas joindre l'application ni les émulateurs Firebase. Installer les outils avec leurs installateurs Windows, cloner le projet dans un dossier Windows et utiliser le terminal **Command Prompt** de VS Code. Si VS Code affiche « WSL: … » en bas à gauche : cliquer dessus > **Fermer la connexion à distance**.

### 1.1 Sur le PC

1. **Git** : https://git-scm.com/download/win (options par défaut).
2. **Node.js 20.20.2** : https://nodejs.org/dist/v20.20.2/node-v20.20.2-x64.msi
3. **Java 21** (pour les émulateurs Firebase) : [Eclipse Temurin JDK 21](https://adoptium.net/temurin/releases/?version=21), fichier `.msi`, cocher **« Set JAVA_HOME variable »** pendant l'installation.
4. Dans VS Code : **Terminal > New Terminal**. Si le terminal s'ouvre en zsh/Ubuntu ou en PowerShell : flèche à côté du **+** > **Command Prompt**. Pour en faire le terminal par défaut : **Ctrl+Shift+P** > « Terminal: Select Default Profile » > **Command Prompt**.

Vérifier dans un **nouveau** terminal Command Prompt :

```bash
node -v          # v20.20.2
java -version    # version 21
git --version
```

### 1.2 Récupérer le projet

```bash
cd %USERPROFILE%
git clone https://github.com/rayenebnt/5MOBD.git
code 5MOBD
```

Dans la nouvelle fenêtre VS Code (terminal Command Prompt) :

```bash
npm install
```

Puis lancer une première fois les émulateurs Firebase. **Windows va afficher deux fenêtres de pare-feu** (« Node.js JavaScript Runtime » et « OpenJDK Platform binary ») : cocher **Réseaux privés ET Réseaux publics**, puis **Autoriser l'accès** (sinon l'iPhone ne pourra pas joindre le PC).

```bash
npm run emulators
```

`npm run emulators` télécharge les émulateurs Firebase (environ 100 Mo) la première fois : attendre « All emulators ready », puis arrêter avec **Ctrl+C**.

### 1.3 Sur l'iPhone

Installer (ou mettre à jour) **Expo Go** depuis l'App Store. Si Expo Go demande de se connecter, un compte Expo gratuit suffit.

---

## 2. Le réseau : PC et iPhone doivent se voir

L'iPhone se connecte directement au PC : à l'application (port 8081) et aux émulateurs Firebase (ports 9099, 8080, 9199). Il faut donc que les deux soient sur le **même réseau**.

- **À la maison** : PC et iPhone sur le même Wi-Fi.
- **À l'école (recommandé)** : les Wi-Fi d'école bloquent souvent les échanges entre appareils. Utiliser le **partage de connexion de l'iPhone** : iPhone > Réglages > **Partage de connexion** > activer **« Autoriser d'autres utilisateurs »**, puis connecter le PC à ce Wi-Fi. La carte (Apple Plans) utilise alors les données mobiles.

**Pare-feu Windows** : Node.js et Java doivent être autorisés sur les **réseaux privés ET publics** (Windows classe souvent un partage de connexion en réseau « public »). Si tu as cliqué Annuler ou coché un seul type de réseau, voir [Dépannage](#8-dépannage).

> Pas besoin de tunnel (ngrok, localhost.run…) : un tunnel ne ferait passer que l'application, pas les émulateurs Firebase.

---

## 3. Lancer la démo

1. Connecter le PC et l'iPhone au même réseau (section 2).
2. Dans VS Code, **terminal 1** :

   ```bash
   npm run demo:firebase
   ```

   Attendre « All emulators ready ». Ce script repart toujours des données préparées (section 4) et **n'enregistre rien** : tu peux répéter la démo autant de fois que tu veux. La toute première fois, tant que les données ne sont pas préparées, lancer `npm run demo:prepare` à la place.

3. **Terminal 2** (bouton ➕ du terminal, ou **Split Terminal**) :

   ```bash
   npm run demo:phone
   ```

   Un **QR code** s'affiche dans le terminal.

4. Sur l'iPhone, ouvrir l'**appareil photo**, viser le QR code, puis toucher **« Ouvrir dans Expo Go »**.
   - Expo Go demande à accéder au **réseau local** : **Autoriser** (indispensable).
   - L'application demande la **localisation** : **Autoriser lorsque l'app est active**.
   - Pour les photos, autoriser l'accès (complet ou à quelques photos).
   - Taper `r` dans le terminal 2 recharge l'application ; secouer l'iPhone ouvre le menu d'Expo Go.

L'interface des émulateurs Firebase (comptes, données, photos, requêtes) est sur http://localhost:4040, dans le navigateur du PC.

> Toujours démarrer `demo:firebase` **avant** `demo:phone`. Si tu l'as lancé après, tape `r` dans le terminal 2.

---

## 4. Préparer les données (la veille)

Les données (comptes, adresses, avis, photos) sont enregistrées dans le dossier `emulator-data/` du projet. Deux scripts les utilisent :

| Script | Rôle |
| --- | --- |
| `npm run demo:prepare` | **Préparation** : charge `emulator-data/` et **enregistre tout** à l'arrêt (Ctrl+C) |
| `npm run demo:firebase` | **Répétitions et jour J** : charge `emulator-data/` et **n'enregistre rien** ; à chaque lancement, on repart des données préparées |

Pour cette étape : **`npm run demo:prepare`** dans le terminal 1, puis `npm run demo:phone` dans le terminal 2, et ouvrir l'application sur l'iPhone.

### 4.1 Créer les données de démonstration

Avec les photos de ton iPhone (galerie ou appareil photo), créer :

| Compte | E-mail / mot de passe | Contenu à créer |
| --- | --- | --- |
| **Alice Martin** | `alice@demo.fr` / `demo1234` | photo de profil ; « Le Petit Bistrot » (**publique**, avec photo et description) ; « Chez mes parents » (**privée**) ; « Boulangerie du coin » (privée, servira à la suppression) |
| **Bob Durand** | `bob@demo.fr` / `demo1234` | « Café des Arts » (**publique**, avec photo) ; un **avis** (4 étoiles + photo) sur « Le Petit Bistrot » d'Alice |

Placer les adresses à des endroits différents (toucher la carte dans le formulaire) pour que la carte soit parlante. Laisser l'application **déconnectée** à la fin (Profil > « Se déconnecter ») : la démo commence par l'écran de connexion.

> Les photos restent visibles même si l'adresse du PC change le jour J (autre réseau, partage de connexion) : l'application les recherche toujours à l'adresse actuelle.

### 4.2 Sauvegarder

Pendant que `demo:prepare` tourne, dans un autre terminal :

```bash
npm run demo:save
```

Attendre « Export complete ». Puis arrêter `demo:prepare` avec **un seul Ctrl+C** et attendre la fin de l'arrêt (si « Terminer le programme de commandes (O/N) ? » s'affiche, ne pas refaire Ctrl+C).

**Vérifier** : lancer `npm run demo:firebase` et `npm run demo:phone`, puis se connecter avec Alice : ses adresses doivent être là.

> Pour modifier les données plus tard, relancer `npm run demo:prepare` (jamais pour une répétition : elle serait enregistrée). Les données restent dans ton dossier `emulator-data/` (il n'est pas envoyé sur GitHub).

---

## 5. Préparer les tests (la veille)

Les commandes de tests démarrent leurs propres émulateurs : **arrêter `demo:firebase` (ou `demo:prepare`) avant** (sinon « port taken »). Garder les terminaux ouverts, ou faire des captures d'écran, pour les montrer pendant la soutenance.

```bash
npm test                 # 202 tests unitaires et fonctionnels
npm run test:coverage    # idem avec la couverture (~97 %)
npm run test:firebase    # 41 tests : règles de sécurité + parcours complet sur émulateurs Firebase
```

**Tests e2e (Maestro)** : Maestro pilote un **émulateur Android** ou un simulateur iOS (sur Mac), pas un vrai iPhone.

- **Par défaut** : montrer et expliquer les parcours dans VS Code (`.maestro/flows/`).
- **Optionnel** (plusieurs Go à installer, uniquement pour filmer les tests e2e une fois) : installer [Android Studio](https://developer.android.com/studio) et un téléphone virtuel « Google Play » (API 35), le [CLI Maestro](https://docs.maestro.dev/getting-started/installing-maestro), puis suivre la section *Tests e2e* du [README](README.md#tests-e2e-avec-maestro-npm-run-e2e) (`npm run emulators`, `npm run start:e2e`, `npm run e2e`). Filmer avec la Xbox Game Bar (Win+Alt+R) et montrer la vidéo pendant la soutenance.

**Plan B** : filmer une démo complète sur l'iPhone (Centre de contrôle > **Enregistrement de l'écran**), au cas où le réseau ne marcherait pas le jour J.

---

## 6. Le jour J : check-list

**30 minutes avant :**

- [ ] PC branché sur secteur, iPhone chargé
- [ ] **Partage de connexion** de l'iPhone activé, PC connecté dessus
- [ ] VS Code ouvert sur le projet, avec ces onglets : `firestore.rules`, `storage.rules`, `src/screens/MapScreen.tsx`
- [ ] Terminal 1 : `npm run demo:firebase` (« All emulators ready »)
- [ ] Terminal 2 : `npm run demo:phone`, application ouverte sur l'iPhone, sur l'**écran de connexion** (si un compte est connecté : Profil > « Se déconnecter »)
- [ ] Navigateur du PC ouvert sur http://localhost:4040
- [ ] Résultats des tests prêts (et vidéo e2e si tu l'as filmée)
- [ ] iPhone en mode **Ne pas déranger**, luminosité au maximum
- [ ] Pour montrer l'écran de l'iPhone au jury : adaptateur HDMI de l'iPhone vers le projecteur, ou application de recopie d'écran AirPlay sur le PC (à tester avant)

---

## 7. Déroulé de la démo (barème)

Durée indicative : 12 à 15 minutes. Les libellés entre « » sont ceux de l'application.

### 1. Inscription — 5 pts (1 min)

1. Écran de connexion > « Créer un compte ».
2. Saisir un nom, un e-mail (par ex. `jury@demo.fr`), et **deux mots de passe différents** > « Créer mon compte » : montrer le message « Les mots de passe ne correspondent pas. ».
3. Corriger > « Créer mon compte » : l'application ouvre directement la carte.

> À dire : compte créé dans Firebase Authentication, profil enregistré dans Firestore (`users/{uid}`), session conservée au redémarrage.

### 2. Carte centrée sur l'utilisateur — 15 pts (1 min)

1. Onglet « Carte » : la carte se centre automatiquement sur ta **vraie position** (la salle de soutenance), avec le point bleu.
2. Montrer la légende (mes adresses publiques / privées / adresses des autres) et le bouton de recentrage.

> À dire : `MapView` de `react-native-maps` (Apple Plans sur iPhone), position obtenue avec `expo-location` après autorisation, puis `animateToRegion`. Si la localisation est refusée, un message s'affiche.

### 3. Photo de profil — 5 pts (1 min)

1. Onglet « Profil » > « Photo » : prendre un selfie (ou « Galerie »).
2. « Supprimer la photo » : retour aux initiales.

> À dire : image envoyée dans Cloud Storage (`users/{uid}/avatar.jpg`) ; les règles n'autorisent que des images de moins de 5 Mo, dans son propre dossier.

### 4. Déconnexion et connexion — 10 pts (1 min)

1. « Se déconnecter » : retour à l'écran de connexion.
2. Se connecter avec `alice@demo.fr` et un **mauvais mot de passe** : « E-mail ou mot de passe incorrect. ».
3. Se connecter avec le bon mot de passe (`demo1234`).

### 5. Mes adresses publiques et privées — 10 pts (1 min)

1. Onglet « Mes adresses » : les adresses d'Alice avec leur badge « Publique » / « Privée ».
2. Filtres « Publiques », « Privées », « Toutes ».
3. Onglet « Carte » : les repères de couleurs différentes (publiques / privées).

### 6. Création d'une adresse — 25 pts (2 min)

1. Carte > bouton « + ».
2. « Nom » (par ex. « Le Comptoir »), « Description », « Photo » : prendre une photo de la salle (ou « Galerie »).
3. Interrupteur « Adresse privée » → « Adresse publique » (montrer que l'adresse est privée par défaut).
4. « Emplacement » : le repère est sur ta position actuelle ; toucher la carte pour le déplacer.
5. « Enregistrer l'adresse » : l'adresse apparaît sur la carte et dans « Mes adresses ».

> À dire : document `addresses/{id}` (propriétaire, nom, description, `isPublic`, coordonnées, URL de la photo) ; les règles valident chaque champ.

### 7. Adresses publiques des autres et avis avec photos — 20 pts (3 min)

1. « Se déconnecter », se connecter avec `bob@demo.fr`.
2. Onglet « Explorer » : Bob voit « Le Petit Bistrot » et « Le Comptoir » d'Alice, **mais pas** « Chez mes parents » (privée).
3. Ouvrir « Le Comptoir », faire défiler jusqu'à « Laisser un avis » : 4 étoiles, un commentaire, « Photo » ou « Galerie » > « Publier l'avis » : l'avis apparaît avec la moyenne.
4. Ouvrir « Le Petit Bistrot » : l'avis préparé la veille, avec sa photo.

> À dire : avis dans la sous-collection `addresses/{id}/reviews` ; les règles interdisent les avis sur une adresse privée et la publication au nom d'un autre. Bob ne voit pas le bouton de suppression : il n'est pas propriétaire.

### 8. Suppression d'une adresse — 5 pts (30 s)

1. Se reconnecter avec Alice > « Mes adresses » > « Boulangerie du coin ».
2. « Supprimer l'adresse » > confirmer « Supprimer » : elle disparaît de la liste et de la carte.

> À dire : seul le propriétaire peut supprimer (règles Firestore) ; ses avis et sa photo sont supprimés avec elle.

### 9. Projet Firebase sécurisé — 5 pts (1 à 2 min)

1. VS Code : montrer `firestore.rules` (lecture des adresses privées réservée au propriétaire, création à son nom, validation des champs, avis seulement sur une adresse publique) et `storage.rules` (dossier personnel, images < 5 Mo).
2. Navigateur du PC, http://localhost:4040 : **Authentication** (les comptes), **Firestore** (les données), onglet **Requests** de Firestore (chaque requête avec la règle qui l'a autorisée ou refusée), **Storage** (les photos).
3. Montrer le résultat de `npm run test:firebase` : 33 tests des règles (ce qui est autorisé et ce qui est refusé) + le parcours complet.

> À dire : la configuration Firebase n'est pas dans le code (variables d'environnement) ; pour la démo, les émulateurs officiels de Firebase appliquent exactement les mêmes règles qu'en ligne.

### 10. Tests — 25 pts (2 à 3 min)

1. **Tests unitaires et fonctionnels (10 pts)** : résultat de `npm test` (202 tests) et de la couverture. Ouvrir par exemple `src/screens/__tests__/NewAddressScreen.test.tsx` (création privée / publique) et `src/__tests__/navigation.test.tsx` (routes protégées).
2. **Tests e2e (10 pts)** : un parcours ouvert dans VS Code (`.maestro/flows/04_adresses_publiques_et_avis.yaml`), et la vidéo Maestro si tu l'as filmée.
3. **Storybook (5 pts)** : arrêter le terminal 2 (Ctrl+C), lancer `npm run start:storybook` et scanner le nouveau QR code avec l'iPhone : Storybook s'ouvre avec les 11 composants. Pour revenir à l'application : Ctrl+C, `npm run demo:phone` et scanner à nouveau le QR code.

> Garder Storybook pour la fin : le retour à l'application prend environ une minute.

---

## 8. Dépannage

| Problème | Solution |
| --- | --- |
| `zsh: command not found: java` (ou `node`), terminal Ubuntu / WSL | Le terminal est dans WSL : revenir côté Windows (encadré de la section 1), terminal **Command Prompt**, projet cloné dans un dossier Windows |
| PowerShell : « l'exécution de scripts est désactivée sur ce système » | Utiliser le terminal **Command Prompt** (section 1.1), ou exécuter une fois `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| « Project is incompatible with this version of Expo Go » | Mettre à jour Expo Go depuis l'App Store (le projet utilise le SDK 57) |
| Expo Go tourne longtemps puis « Could not connect to the server » | PC et iPhone ne sont pas sur le même réseau, ou l'accès au **réseau local** a été refusé : iPhone > Réglages > **Expo Go** > activer **Réseau local** ; vérifier le pare-feu (section 2) ; essayer le partage de connexion de l'iPhone |
| Le QR code / la ligne `exp://…` affiche `127.0.0.1`, ou une adresse différente de l'**adresse IPv4** de la carte Wi-Fi donnée par `ipconfig` (sur le partage de connexion de l'iPhone, une adresse `172.20.10.x` est normale et correcte) | Dans le terminal Command Prompt : `ipconfig`, noter l'adresse IPv4 de la carte Wi-Fi, puis par exemple `set REACT_NATIVE_PACKAGER_HOSTNAME=172.20.10.2` (ton adresse, sans espaces) et relancer `npm run demo:phone` dans le **même** terminal (en PowerShell : `$env:REACT_NATIVE_PACKAGER_HOSTNAME="172.20.10.2"`) |
| Le port 8081 ou 4000 est occupé par `svchost.exe`, ou Safari/Expo Go : « connexion perdue » / « timed out » | Une ancienne redirection de ports vers WSL existe : `netsh interface portproxy show all`, puis (Command Prompt **administrateur**) `netsh interface portproxy delete v4tov4 listenport=8081 listenaddress=0.0.0.0` (idem pour les autres ports listés) |
| Pare-feu : j'ai cliqué Annuler ou coché un seul type de réseau | Sécurité Windows > Pare-feu et protection du réseau > **Autoriser une application via le pare-feu** > **Modifier les paramètres** > cocher **Privé** et **Public** pour toutes les lignes « Node.js JavaScript Runtime » et « OpenJDK Platform binary ». Ou plus simple : Paramètres > Réseau et Internet > Wi-Fi > (réseau du partage de connexion) > Type de profil réseau : **Privé** |
| « Problème de connexion réseau » à l'inscription ou à la connexion | `demo:firebase` n'est pas lancé, ou Java est bloqué par le pare-feu : lancer `demo:firebase`, attendre « All emulators ready », autoriser Java (privé et public), puis `r` dans le terminal 2 |
| « port taken » au lancement de `demo:firebase`, `demo:prepare` ou des tests | D'anciens émulateurs tournent encore : fermer tous les terminaux ; sinon terminer le processus « OpenJDK Platform binary » dans le Gestionnaire des tâches |
| `java` introuvable ou mauvaise version | Installer le JDK 21 (section 1.1) puis **redémarrer VS Code** |
| La carte n'est pas centrée sur ma position | Autoriser la localisation : iPhone > Réglages > **Expo Go** > Position > « Lorsque l'app est active », puis `r` dans le terminal 2 |
| Pas de carte (fond vide) | L'iPhone n'a pas Internet : les fonds de carte en ont besoin (données mobiles avec le partage de connexion) |
| `Directory "…emulator-data" does not exist` au lancement de `demo:firebase` | Les données n'ont pas encore été préparées : lancer `npm run demo:prepare` (section 4) |
| Les données préparées ont disparu ou ont changé | Vérifier que le dossier `emulator-data/` existe ; répéter uniquement avec `demo:firebase` (qui n'enregistre rien), jamais avec `demo:prepare` |
| Comportement étrange après une modification du code | Ctrl+C puis `npm run demo:phone` (le cache est vidé à chaque lancement) |
