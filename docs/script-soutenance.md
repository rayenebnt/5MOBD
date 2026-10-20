# Script de la soutenance

Le même texte est dans les **notes** de chaque diapositive de `presentation-soutenance.pptx` (mode Présentateur de PowerPoint). Durée : environ 12 minutes de présentation + la démo.

## Diapositive 1 — Mes Bonnes Adresses

Bonjour. Je vais vous présenter Mes Bonnes Adresses, une application mobile que j'ai réalisée seul dans le cadre du module 5MOBD. L'idée : pouvoir enregistrer ses adresses favorites, les garder privées ou les partager, et découvrir celles des autres. Je vais d'abord présenter rapidement le projet et ses choix techniques, puis je ferai une démonstration en direct sur mon iPhone, et je terminerai par les tests.

## Diapositive 2 — Ce que fait l’application

L'application répond à quatre besoins. Un : une carte qui se centre automatiquement sur ma position, avec mes adresses et les adresses publiques des autres utilisateurs. Deux : chaque adresse a un nom, une photo, une description, et elle est soit privée, visible uniquement par moi, soit publique. Trois : une dimension sociale, on peut laisser un avis noté sur cinq, avec un commentaire et une photo, sur les adresses publiques des autres. Quatre : la gestion du compte, avec inscription, connexion, déconnexion et photo de profil.

## Diapositive 3 — Choix techniques

Côté technique, j'ai utilisé Expo avec React Native et TypeScript. La navigation est faite avec Expo Router : chaque écran est un fichier, et les écrans de l'application ne sont accessibles qu'une fois connecté. Le back-end, c'est Firebase : Authentication pour les comptes, Firestore pour les données en temps réel, et Cloud Storage pour les photos. La carte utilise react-native-maps, donc Apple Plans sur iPhone, et expo-location pour récupérer la position. Un point important : la consigne demande Node 20.18.0. Pour faire la démo sur mon iPhone, Expo Go impose la dernière version du SDK, qui exige au minimum Node 20.19.4. J'ai donc pris Node 20.20.2, qui reste dans la même branche LTS 20, et toutes les versions sont documentées dans le README, comme le permet la consigne.

## Diapositive 4 — Architecture et données

L'architecture est en couches. Les écrans n'appellent jamais Firebase directement : ils passent par des hooks et un contexte d'authentification, qui utilisent des services. Ça rend le code testable, puisque dans les tests je remplace simplement les services. Dans Firestore, j'ai trois niveaux : les profils utilisateurs, les adresses, et les avis rangés en sous-collection de chaque adresse. Les photos sont dans Cloud Storage, dans un dossier par utilisateur.

## Diapositive 5 — Un projet Firebase sécurisé

La sécurité repose sur les règles Firestore et Storage, qui sont dans le dépôt. Il faut être connecté pour tout. Une adresse privée n'est lisible que par son propriétaire. On ne peut créer une adresse qu'à son propre nom, et seul le propriétaire peut la modifier ou la supprimer. Les données sont validées côté serveur : longueur du nom, note entière entre 1 et 5, coordonnées valides. Les avis ne sont possibles que sur une adresse publique, et au nom de l'utilisateur connecté. Enfin, les photos doivent être des images de moins de 5 Mo, dans le dossier de l'utilisateur. Toutes ces règles sont testées automatiquement, je le montrerai à la fin.

## Diapositive 6 — Démonstration en direct

Je passe maintenant à la démonstration. L'application tourne sur mon iPhone dans Expo Go, et elle utilise les émulateurs officiels de Firebase lancés sur mon PC, avec exactement les mêmes règles de sécurité qu'un vrai projet. [DÉMO — suivre le déroulé de SOUTENANCE.md, section 7] 1. Je crée un compte, en montrant l'erreur si les mots de passe ne correspondent pas. 2. La carte se centre automatiquement sur ma position. 3. J'ajoute puis je supprime une photo de profil. 4. Je me déconnecte, je montre l'erreur de mot de passe, puis je me connecte avec Alice. 5. Dans Mes adresses, je montre les adresses publiques et privées avec les filtres. 6. Je crée une adresse publique avec nom, description, photo et emplacement. 7. Je me connecte avec Bob : dans Explorer il voit les adresses publiques d'Alice mais pas sa privée, et il laisse un avis avec photo. 8. Je reviens sur Alice et je supprime une adresse. Pour finir la démo, j'ouvre l'interface des émulateurs sur localhost:4040 pour montrer les comptes, les données, les photos et les requêtes autorisées ou refusées.

## Diapositive 7 — Des tests à tous les niveaux

Côté qualité, il y a quatre niveaux de tests. 202 tests unitaires et fonctionnels avec Jest et React Native Testing Library : la validation des formulaires, les services, les composants, et chaque écran testé du point de vue de l'utilisateur, ainsi que la navigation avec le vrai routeur. La couverture est d'environ 97 %. 41 tests tournent sur les émulateurs Firebase : 33 vérifient les règles de sécurité, ce qui est autorisé et ce qui est refusé, et un parcours complet utilise les vrais services de l'application. 4 parcours de bout en bout avec Maestro. Et Storybook, avec 31 stories pour 11 composants, qui sont aussi rendues dans Jest pour vérifier qu'elles restent valides. [Montrer les résultats de npm test et npm run test:firebase, un parcours Maestro, puis Storybook sur l'iPhone.]

## Diapositive 8 — Difficultés rencontrées

J'ai rencontré trois difficultés principales. La première : Expo Go sur iPhone n'accepte que la dernière version du SDK. J'ai donc migré le projet vers le SDK 57, ce qui m'a obligé à utiliser Node 20.20.2, documenté dans le README. La deuxième : Cloud Storage, nécessaire pour les photos, demande maintenant le forfait payant Blaze. Pour la démo j'utilise les émulateurs officiels de Firebase, qui appliquent les mêmes règles et ne coûtent rien ; un vrai projet en ligne ne demande que les variables d'environnement. La troisième : faire communiquer l'iPhone et le PC. Il a fallu sortir de WSL, supprimer d'anciennes redirections de ports et régler le pare-feu. J'ai aussi fait en sorte que les photos restent visibles même si l'adresse IP du PC change.

## Diapositive 9 — Merci !

Pour conclure : toutes les fonctionnalités demandées sont en place, la carte centrée sur l'utilisateur, les adresses privées et publiques avec nom, photo et description, la suppression, les avis avec photos et la gestion de compte. Le projet Firebase est sécurisé par des règles testées automatiquement, et l'application est couverte par des tests unitaires, fonctionnels, de bout en bout et par Storybook. Merci pour votre attention, je suis prêt à répondre à vos questions.
