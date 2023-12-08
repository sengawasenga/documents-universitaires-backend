# Documents Universitaires - Documentation Back-end

## Introduction

Ce projet utilise Express.js et Firebase Admin SDK pour créer une application backend qui permet de faire la gestion electronique de documents universitaires.
L'application utilise Firebase pour authentifier les utilisateurs, stocker les données et sauvegarder les fichiers, ainsi qu'Express.js pour gérer les requêtes HTTP de manière sécurisée.

## Configuration

Pour utiliser ce projet, vous devez avoir [node.js](https://nodejs.org/en/download) installé dans votre machine, ensuite vous devez créer un projet Firebase et configurer les informations d'identification Firebase Admin SDK. Vous pouvez suivre les étapes ci-dessous pour configurer votre projet :

1. Créez un nouveau projet Firebase dans la console Firebase.
2. Dans la console Firebase, accédez à Paramètres du projet > Comptes de service.
3. Cliquez sur Générer une nouvelle clé privée pour télécharger le fichier JSON contenant les informations d'identification.
4. Copiez le contenu du fichier JSON dans le fichier `.env`
5. Installez les dépendances du projet en exécutant `npm install` dans le terminal.

## Utilisation

Une fois que vous avez configuré votre projet, vous pouvez lancer l'application en exécutant `npm start` dans le terminal. L'application sera accessible par defaut à l'adresse `http://localhost:3000`.

## Routes

L'application utilise plusieurs routes.
Vous trouverez la liste de routes ainsi que les conditions et les manières de les utiliser [ici](src/v1/README.md)