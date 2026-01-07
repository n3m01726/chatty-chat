import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import './database/init.js'; // Initialise la DB
import { User } from './database/models/User.js';
import { Message } from './database/models/Message.js';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  },
  maxHttpBufferSize: 10e6 // 10MB pour les attachements
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Map pour suivre les utilisateurs connectés (socketId -> userId)
const connectedUsers = new Map();

// Routes API REST (optionnelles, pour debug)
app.get('/health', (req, res) => {
  const activeUsers = User.getActive();
  const recentMessages = Message.getHistory(10);
  
  res.json({ 
    status: 'ok',
    database: 'connected',
    activeUsers: activeUsers.length,
    recentMessages: recentMessages.length
  });
});

app.get('/api/messages', (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  const messages = Message.getHistory(limit);
  res.json({ messages });
});

app.get('/api/users', (req, res) => {
  const users = User.getActive();
  res.json({ users });
});

// Gestion WebSocket
io.on('connection', (socket) => {
  console.log(`✅ Socket connecté: ${socket.id}`);

  // Envoyer l'historique des messages
  const history = Message.getHistory(100);
  socket.emit('message:history', history);

  // Enregistrement d'un utilisateur
  socket.on('user:register', (userData) => {
    const userId = userData.socketId || socket.id;
    
    // Créer ou mettre à jour l'utilisateur dans la DB
    User.upsert({
      id: userId,
      username: userData.username,
      avatar: userData.avatar,
      status: 'online'
    });

    // Associer le socket à cet utilisateur
    connectedUsers.set(socket.id, userId);

    // Broadcast la liste des utilisateurs actifs
    const activeUsers = User.getActive();
    io.emit('users:list', activeUsers);

    console.log(`👤 User enregistré: ${userData.username} (${userId})`);
  });

  // Envoi d'un message
  socket.on('message:send', (data) => {
    const userId = connectedUsers.get(socket.id);
    
    if (!userId) {
      console.error('❌ Utilisateur non enregistré');
      return;
    }

    try {
      // Créer le message dans la DB
      const message = Message.create({
        userId: userId,
        username: data.username,
        avatar: data.avatar,
        content: data.content || '',
        attachments: data.attachments || []
      });

      // Broadcast le message à tous les clients
      io.emit('message:new', message);

      console.log(`📨 Message de ${data.username}: ${data.content.substring(0, 50)}${data.content.length > 50 ? '...' : ''}`);
    } catch (error) {
      console.error('❌ Erreur création message:', error);
      socket.emit('error', { message: 'Impossible de créer le message' });
    }
  });

  // Édition d'un message
  socket.on('message:edit', ({ messageId, content }) => {
    const userId = connectedUsers.get(socket.id);
    
    if (!userId) {
      console.error('❌ Utilisateur non enregistré');
      return;
    }

    try {
      const updatedMessage = Message.edit(messageId, userId, content);

      if (updatedMessage) {
        io.emit('message:edited', { 
          messageId, 
          content,
          edited: true,
          editedAt: updatedMessage.edited_at
        });
        console.log(`✏️ Message édité: ${messageId}`);
      } else {
        socket.emit('error', { message: 'Impossible d\'éditer ce message' });
      }
    } catch (error) {
      console.error('❌ Erreur édition message:', error);
      socket.emit('error', { message: 'Erreur lors de l\'édition' });
    }
  });

  // Suppression d'un message
  socket.on('message:delete', ({ messageId }) => {
    const userId = connectedUsers.get(socket.id);
    
    if (!userId) {
      console.error('❌ Utilisateur non enregistré');
      return;
    }

    try {
      const user = User.getById(userId);
      const deletedMessage = Message.delete(messageId, userId, user.username);

      if (deletedMessage) {
        io.emit('message:deleted', { 
          messageId, 
          deletedBy: user.username 
        });
        console.log(`🗑️ Message supprimé: ${messageId}`);
      } else {
        socket.emit('error', { message: 'Impossible de supprimer ce message' });
      }
    } catch (error) {
      console.error('❌ Erreur suppression message:', error);
      socket.emit('error', { message: 'Erreur lors de la suppression' });
    }
  });

  // Changement de statut
  socket.on('user:status', ({ status }) => {
    const userId = connectedUsers.get(socket.id);
    
    if (userId) {
      User.updateStatus(userId, status);
      const activeUsers = User.getActive();
      io.emit('users:list', activeUsers);
      console.log(`🔄 Statut mis à jour pour ${userId}: ${status}`);
    }
  });

  // Typing indicator
  socket.on('user:typing:start', () => {
    const userId = connectedUsers.get(socket.id);
    
    if (userId) {
      const user = User.getById(userId);
      // Broadcast à tous SAUF l'émetteur
      socket.broadcast.emit('user:typing', {
        userId: user.id,
        username: user.username,
        isTyping: true
      });
    }
  });

  socket.on('user:typing:stop', () => {
    const userId = connectedUsers.get(socket.id);
    
    if (userId) {
      const user = User.getById(userId);
      socket.broadcast.emit('user:typing', {
        userId: user.id,
        username: user.username,
        isTyping: false
      });
    }
  });

  // Mise à jour du profil
  socket.on('user:profile:update', (profileData) => {
    const userId = connectedUsers.get(socket.id);
    
    if (userId) {
      try {
        User.updateProfile(userId, profileData);
        const updatedUser = User.getById(userId);
        
        // Broadcast le profil mis à jour
        io.emit('user:profile:updated', updatedUser);
        
        console.log(`✏️ Profil mis à jour: ${updatedUser.username}`);
      } catch (error) {
        console.error('❌ Erreur mise à jour profil:', error);
        socket.emit('error', { message: 'Impossible de mettre à jour le profil' });
      }
    }
  });

  // Récupérer le profil d'un utilisateur
  socket.on('user:profile:get', ({ userId }) => {
    try {
      const user = User.getById(userId);
      const stats = User.getStats(userId);
      
      socket.emit('user:profile:data', {
        ...user,
        stats
      });
    } catch (error) {
      console.error('❌ Erreur récupération profil:', error);
      socket.emit('error', { message: 'Impossible de récupérer le profil' });
    }
  });

  // Déconnexion
  socket.on('disconnect', () => {
    const userId = connectedUsers.get(socket.id);
    
    if (userId) {
      // Marquer comme offline dans la DB
      User.setOffline(userId);
      connectedUsers.delete(socket.id);

      // Broadcast la liste mise à jour
      const activeUsers = User.getActive();
      io.emit('users:list', activeUsers);

      const user = User.getById(userId);
      console.log(`❌ Utilisateur déconnecté: ${user?.username || userId}`);
    } else {
      console.log(`❌ Socket déconnecté: ${socket.id}`);
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
  console.log(`🔌 WebSocket prêt`);
  console.log(`💾 Base de données SQLite active`);
});