import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);

// Configuration Socket.io avec CORS pour le dev
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Port par défaut de Vite
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Stockage en mémoire pour la Phase 1
// Structure simple : on garde juste un tableau de messages
const messages = [];
const users = new Map(); // socketId -> user info

// Route de santé pour vérifier que le serveur tourne
app.get('/health', (req, res) => {
  res.json({ status: 'ok', users: users.size, messages: messages.length });
});

// Gestion des connexions WebSocket
io.on('connection', (socket) => {
  console.log(`✅ Utilisateur connecté: ${socket.id}`);
  
  // Quand un user se connecte, on lui envoie l'historique
  socket.emit('message:history', messages);
  
  // Envoi de la liste des users connectés
  socket.emit('users:list', Array.from(users.values()));

  // Écoute des nouveaux messages
  socket.on('message:send', (data) => {
    // Création du message avec metadata
    const message = {
      id: Date.now() + Math.random(), // ID simple pour le MVP
      content: data.content,
      username: data.username || 'Anonymous',
      avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${socket.id}`,
      timestamp: new Date().toISOString(),
      socketId: socket.id
    };
    
    // Stockage du message
    messages.push(message);
    
    // Broadcast à tous les clients (y compris l'émetteur)
    io.emit('message:new', message);
    
    console.log(`📨 Message de ${message.username}: ${message.content}`);
  });

  // Enregistrement d'un utilisateur
  socket.on('user:register', (userData) => {
    const user = {
      id: socket.id,
      username: userData.username || 'Anonymous',
      avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${socket.id}`,
      status: 'online'
    };
    
    users.set(socket.id, user);
    
    // Broadcast la liste mise à jour
    io.emit('users:list', Array.from(users.values()));
    console.log(`👤 User enregistré: ${user.username}`);
  });

  // Déconnexion
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    users.delete(socket.id);
    
    // Broadcast la liste mise à jour
    io.emit('users:list', Array.from(users.values()));
    
    console.log(`❌ Utilisateur déconnecté: ${user?.username || socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
  console.log(`🔌 WebSocket prêt pour connexions`);
});