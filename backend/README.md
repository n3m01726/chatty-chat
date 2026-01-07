# Discord Clone - Backend

Backend Node.js avec Express, Socket.io et SQLite.

## 📁 Structure

```
backend/
├── database/
│   ├── init.js              # Initialisation DB + schéma
│   ├── models/
│   │   ├── User.js         # Model utilisateur
│   │   └── Message.js      # Model message
│   └── chat.db             # Base SQLite (généré automatiquement)
├── server.js               # Serveur principal
├── package.json
└── README.md
```

## 🗄️ Base de données

### Tables

**users**
- `id` : ID utilisateur (socketId)
- `username` : Pseudo
- `avatar` : URL avatar
- `cover` : Cover image (pour plus tard)
- `display_name`, `pronouns`, `bio` : Profil
- `status` : online/offline/busy/away/appear_offline
- `status_message` : Message de statut custom
- `custom_color` : Couleur du display_name
- `timezone` : Fuseau horaire
- `created_at` : Date d'inscription
- `last_seen` : Dernière activité

**messages**
- `id` : ID unique du message
- `user_id` : ID de l'auteur
- `username`, `avatar` : Infos de l'auteur (dénormalisé pour perf)
- `content` : Contenu du message
- `edited` : Si édité (0/1)
- `edited_at` : Date d'édition
- `deleted` : Si supprimé (0/1)
- `deleted_by` : Qui a supprimé
- `deleted_at` : Date de suppression
- `created_at` : Date de création

**attachments**
- `id` : ID auto-incrémenté
- `message_id` : Référence au message
- `type` : image/video/gif
- `url` : URL ou data URI
- `name` : Nom du fichier
- `created_at` : Date d'ajout

## 🚀 Installation

```bash
npm install
```

## 🏃 Lancer le serveur

```bash
npm run dev
```

Le serveur utilise `--watch` pour recharger automatiquement à chaque modification.

## 🔌 API WebSocket

### Événements client → serveur

- `user:register` : Enregistrer un utilisateur
- `message:send` : Envoyer un message
- `message:edit` : Éditer un message
- `message:delete` : Supprimer un message
- `user:status` : Changer de statut

### Événements serveur → client

- `message:history` : Historique des messages
- `message:new` : Nouveau message
- `message:edited` : Message édité
- `message:deleted` : Message supprimé
- `users:list` : Liste des utilisateurs actifs
- `error` : Erreur

## 🛠️ API REST (optionnel, pour debug)

- `GET /health` : Status du serveur
- `GET /api/messages?limit=100` : Récupérer les messages
- `GET /api/users` : Récupérer les utilisateurs actifs

## 💡 Notes

- La base SQLite est créée automatiquement au premier lancement
- Les messages sont persistés immédiatement
- Les attachements sont stockés en base64 (pour la simplicité)
- Pour la production, utilise un storage externe (S3, Cloudinary) pour les images/vidéos