# Guide d’installation et de configuration – EvenTaro

## Prérequis

- **Node.js** >= 18 (recommandé 20)
- **npm** >= 9
- **PostgreSQL** 15 (ou équivalent) pour le back-end
- **Docker** et **Docker Compose** (optionnel, pour tout lancer en conteneurs)

---

## Installation locale (sans Docker)

### 1. Cloner et installer les dépendances

```bash
git clone <url-du-repo>
cd EvenTaro
npm install
```

### 2. Variables d’environnement

#### Back-end (apps/api)

- Copier le fichier d’exemple :  
  `cp apps/api/.env.example apps/api/.env`
- Éditer `apps/api/.env` et renseigner au minimum :
  - **DATABASE_URL** : chaîne de connexion PostgreSQL  
    Exemple : `postgresql://user:password@localhost:5432/eventaro_db`
  - **JWT_SECRET**, **JWT_REFRESH_SECRET** : clés pour les tokens (à changer en production)
  - **CORS_ORIGIN** : origine du front-end (ex. `http://localhost:3000`)

Référence des variables : voir `apps/api/.env.example`.

#### Front-end (apps/web)

- Copier : `cp apps/web/.env.example apps/web/.env`
- Vérifier **NEXT_PUBLIC_API_URL** (ex. `http://localhost:3001`) et les autres variables si besoin.

### 3. Base de données

Créer une base PostgreSQL puis exécuter les migrations Prisma depuis la racine du monorepo (ou depuis `apps/api` si votre `DATABASE_URL` est dans `apps/api/.env`) :

```bash
cd apps/api
npx prisma generate
npx prisma migrate dev
```

### 4. Lancer l’application

**Terminal 1 – API :**

```bash
npm run dev:api
```

L’API est disponible sur **http://localhost:3001**.

**Terminal 2 – Front-end :**

```bash
npm run dev:web
```

L’application web est disponible sur **http://localhost:3000**.

---

## Installation avec Docker

### Développement (avec hot-reload)

```bash
npm run docker:dev
```

Démarre web (3000), api (3001) et PostgreSQL (5432). Les variables sont définies dans `docker-compose.dev.yml`.

### Production

```bash
npm run docker:build
npm run docker:up
```

Utilise `docker-compose.yml`. Penser à définir les variables d’environnement (fichier `.env` à la racine ou dans le compose) pour la production (secrets, CORS, etc.).

---

## Séparation dev / prod

- **Development** :  
  - `NODE_ENV=development`  
  - Utiliser des secrets de test en local, ne pas exposer de vraies clés.
- **Production** :  
  - `NODE_ENV=production`  
  - Utiliser des secrets forts et un **DATABASE_URL** dédié.  
  - Ajuster **CORS_ORIGIN** et **NEXT_PUBLIC_*** selon le domaine de déploiement.

Les fichiers `.env.example` dans `apps/api` et `apps/web` servent de référence ; ne pas commiter de `.env` contenant des secrets.

---

## Vérification

- **API** : `GET http://localhost:3001/events/published` doit répondre (liste d’événements publiés ou tableau vide).
- **Web** : ouvrir http://localhost:3000 et vérifier la page d’accueil et la liste des événements.

Pour créer un compte admin en base (ex. pour les tests), utiliser Prisma Studio (`npx prisma studio` dans `apps/api`) ou un script de seed, et définir `role = 'ADMIN'` pour l’utilisateur concerné.
