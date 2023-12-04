# Les routes

L'application utilise plusieurs modules, chaque module a une série de routes disponibles.
L'URL de base est donc: `http:127.0.0.1:3000/api/v1/`
Pour chaque requêtes, il est important de passer le token de l'utilisateur connecté aux entêtes de la requête pour avoir les avoir les bons résultats, sinon il n'y aura qu'une seule réponse aux requêtes :

```json
{
    "message": "La clé d'API que vous avez fourni n'est pas valide ou a expiré."
}
```

## Postman

La documentation entière se trouve sur Postman, vous pouvez y accéder à traver [ce lien.](https://app.getpostman.com/join-team?invite_code=070073e5626eef97f21c58ba6f4c1478&target_code=0040c694b28668f2b3a98f4abe6f7182)
