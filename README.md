# ✦ DISCOVER — Backend API & Services

> Serveur d'API REST Node.js & Express connecté à MongoDB Atlas et intégrant en temps réel les concerts officiels de Ticketmaster France.

[![API en Ligne](https://img.shields.io/badge/API-Render-46E3B7?style=for-the-badge&logo=render)](https://musical-app-backend.onrender.com/api/health)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.2-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/atlas)

---

## 🌐 Déploiement en Ligne

L'API est hébergée sur **Render** :
👉 **[https://musical-app-backend.onrender.com/api/health](https://musical-app-backend.onrender.com/api/health)**

---

## 🛠️ Endpoints de l'API

### 🏥 Santé & État
- `GET /api/health` : Vérification du statut de l'API et de la session active.

### 🎸 Concerts & Événements
- `GET /api/events` : Récupère la liste agrégée des concerts en direct (Ticketmaster France + OpenDataSoft Culture + BDD MongoDB). Filtrage strict des dates passées et cache mémoire de 15 minutes.
- `GET /api/events/:id` : Détails complets d'un concert spécifique.
- `POST /api/events` : *(Admin)* Création manuelle d'un événement.
- `PUT /api/events/:id` : *(Admin)* Mise à jour d'un événement.
- `DELETE /api/events/:id` : *(Admin)* Suppression d'un événement.

### 🔐 Authentification & Session
- `POST /api/auth/register` : Inscription d'un nouvel utilisateur (mot de passe hashé avec Bcrypt).
- `POST /api/auth/login` : Connexion et initialisation de session sécurisée (cookie HTTP-only).
- `POST /api/auth/logout` : Déconnexion et destruction de la session.

### 👤 Utilisateur & Profil
- `GET /api/users/profile` : Profil de l'utilisateur connecté.
- `PUT /api/users/profile` : Mise à jour du nom, de l'email ou de l'avatar.
- `PUT /api/users/password` : Changement sécurisé de mot de passe (vérification de l'ancien mot de passe).
- `DELETE /api/users/profile` : Suppression définitive du compte utilisateur.
- `POST /api/users/favorites` : Ajout / Retrait d'un concert dans les favoris.
- `POST /api/users/favorites/sync` : Synchronisation et purge automatique des favoris orphelins (qui n'existent plus).

---

## 📦 Variables d'Environnement

Créez un fichier `.env` à la racine de `musical-app-backend` :

```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?appName=MusicalAppCluster
TICKETMASTER_API_KEY=votre_cle_ticketmaster
SESSION_SECRET=votre_cle_secrete_de_session
FRONTEND_URL=https://basic002.github.io
```

---

## 💻 Démarrage Local

```bash
# Installation des dépendances
npm install

# Démarrage en mode développement avec rechargement automatique
npm run dev

# Démarrage en mode production
npm start
```

---

## ☁️ Déploiement sur Render.com

1. Créez un **Web Service** sur Render relié à la branche `prod`.
2. Configurez :
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
3. Renseignez les variables d'environnement (`MONGO_URI`, `TICKETMASTER_API_KEY`, `SESSION_SECRET`, `NODE_ENV=production`).
4. Dans **MongoDB Atlas > Network Access**, ajoutez l'IP `0.0.0.0/0` pour autoriser les connexions depuis Render.
