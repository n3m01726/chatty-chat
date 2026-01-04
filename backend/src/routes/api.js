// routes/api.js
const express = require('express');
const router = express.Router();
const userService = require('../services/userService');
const messageService = require('../services/messageService');
const uploadService = require('../services/uploadService');
const giphyService = require('../services/giphyService');

/**
 * Routes API pour les profils et statistiques
 */

// GET /api/users - Liste tous les utilisateurs
router.get('/users', (req, res) => {
  try {
    const users = userService.getAllUsersFromDb();
    res.json({ success: true, users });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/users/:username - Profil d'un utilisateur
router.get('/users/:username', (req, res) => {
  try {
    const { username } = req.params;
    const profile = userService.getUserStats(username);
    
    if (!profile) {
      return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
    }
    
    res.json({ success: true, profile });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/users/:username - Mettre à jour le profil
router.put('/users/:username', (req, res) => {
  try {
    const { username } = req.params;
    const profileData = req.body;
    
    const profile = userService.updateUserProfile(username, profileData);
    res.json({ success: true, profile });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/users/:username/avatar - Upload avatar
router.post('/users/:username/avatar', uploadService.single('avatar'), (req, res) => {
  try {
    const { username } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Aucun fichier fourni' });
    }
    
    // Récupérer l'ancien avatar pour le supprimer
    const currentProfile = userService.getUserProfile(username);
    const avatarUrl = uploadService.replaceFile(currentProfile?.avatar_url, req.file.filename);
    
    // Mettre à jour le profil
    const profile = userService.updateUserProfile(username, { avatar_url: avatarUrl });
    
    res.json({ success: true, profile, avatarUrl });
  } catch (error) {
    console.error('Erreur lors de l\'upload de l\'avatar:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/users/:username/banner - Upload banner
router.post('/users/:username/banner', uploadService.single('banner'), (req, res) => {
  try {
    const { username } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Aucun fichier fourni' });
    }
    
    // Récupérer l'ancien banner pour le supprimer
    const currentProfile = userService.getUserProfile(username);
    const bannerUrl = uploadService.replaceFile(currentProfile?.banner_url, req.file.filename);
    
    // Mettre à jour le profil
    const profile = userService.updateUserProfile(username, { banner_url: bannerUrl });
    
    res.json({ success: true, profile, bannerUrl });
  } catch (error) {
    console.error('Erreur lors de l\'upload du banner:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/messages/attachment - Upload attachment pour message
router.post('/messages/attachment', uploadService.single('attachment'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Aucun fichier fourni' });
    }
    
    const attachmentUrl = uploadService.getFileUrl(req.file.filename);
    
    // Déterminer le type (image ou vidéo)
    const type = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
    
    res.json({ 
      success: true, 
      attachmentUrl,
      type,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload de l\'attachment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/giphy/search - Rechercher des GIFs
router.get('/giphy/search', async (req, res) => {
  try {
    const { q, limit = 20, offset = 0 } = req.query;
    
    if (!q) {
      return res.status(400).json({ success: false, error: 'Query parameter "q" is required' });
    }
    
    const result = await giphyService.search(q, parseInt(limit), parseInt(offset));
    res.json(result);
  } catch (error) {
    console.error('Erreur lors de la recherche Giphy:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/giphy/trending - GIFs trending
router.get('/giphy/trending', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const result = await giphyService.trending(parseInt(limit), parseInt(offset));
    res.json(result);
  } catch (error) {
    console.error('Erreur lors de la récupération des trending:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/users/:username/messages - Messages d'un utilisateur
router.get('/users/:username/messages', (req, res) => {
  try {
    const { username } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    
    const messages = messageService.getUserMessages(username, limit);
    res.json({ success: true, messages, count: messages.length });
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/messages/search - Rechercher des messages
router.get('/messages/search', (req, res) => {
  try {
    const { q, limit } = req.query;
    
    if (!q) {
      return res.status(400).json({ success: false, error: 'Query parameter "q" is required' });
    }
    
    const messages = messageService.searchMessages(q, parseInt(limit) || 50);
    res.json({ success: true, messages, count: messages.length });
  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/messages/:messageId - Supprimer un message
router.delete('/messages/:messageId', (req, res) => {
  try {
    const { messageId } = req.params;
    const { username } = req.body; // Envoyer le username pour vérifier la propriété
    
    if (!username) {
      return res.status(400).json({ success: false, error: 'Username requis' });
    }
    
    // Récupérer l'userId
    const user = userService.getUserProfile(username);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
    }
    
    const result = messageService.deleteMessageByUser(parseInt(messageId), user.id);
    
    if (result.success) {
      res.json({ success: true, messageId: result.messageId });
    } else {
      res.status(403).json(result);
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du message:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/stats - Statistiques globales
router.get('/stats', (req, res) => {
  try {
    const messageStats = messageService.getStats();
    const userCount = userService.getAllUsersFromDb().length;
    const onlineCount = userService.getUserCount();
    
    res.json({
      success: true,
      stats: {
        totalUsers: userCount,
        onlineUsers: onlineCount,
        totalMessages: messageStats.totalMessages,
        topUsers: messageStats.topUsers
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
// Ajouter ces routes dans backend/routes/api.js
// (après les routes POST existantes pour avatar/banner)

const fs = require('fs').promises;
const path = require('path');

// DELETE avatar
router.delete('/users/:username/avatar', async (req, res) => {
  try {
    const { username } = req.params;
    
    // Récupérer le user pour obtenir l'URL de l'avatar
    const user = userService.getUserByUsername(username);
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    // Si pas d'avatar custom, rien à faire
    if (!user.avatar_url) {
      return res.json({ 
        success: true, 
        message: 'Aucun avatar à supprimer',
        user 
      });
    }
    
    // Supprimer le fichier physique
    const filename = path.basename(user.avatar_url);
    const filepath = path.join(__dirname, '..', 'uploads', filename);
    
    try {
      await fs.unlink(filepath);
      console.log(`✅ Avatar supprimé : ${filepath}`);
    } catch (err) {
      console.warn(`⚠️ Fichier avatar introuvable : ${filepath}`);
      // On continue quand même pour nettoyer la DB
    }
    
    // Mettre à jour la DB (avatar_url = null)
    const updatedUser = userService.updateUser(username, { avatar_url: null });
    
    res.json({
      success: true,
      message: 'Avatar supprimé avec succès',
      user: updatedUser
    });
    
  } catch (error) {
    console.error('Erreur DELETE avatar:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'avatar' });
  }
});

// DELETE banner
router.delete('/users/:username/banner', async (req, res) => {
  try {
    const { username } = req.params;
    
    // Récupérer le user pour obtenir l'URL du banner
    const user = userService.getUserByUsername(username);
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    // Si pas de banner custom, rien à faire
    if (!user.banner_url) {
      return res.json({ 
        success: true, 
        message: 'Aucun banner à supprimer',
        user 
      });
    }
    
    // Supprimer le fichier physique
    const filename = path.basename(user.banner_url);
    const filepath = path.join(__dirname, '..', 'uploads', filename);
    
    try {
      await fs.unlink(filepath);
      console.log(`✅ Banner supprimé : ${filepath}`);
    } catch (err) {
      console.warn(`⚠️ Fichier banner introuvable : ${filepath}`);
      // On continue quand même pour nettoyer la DB
    }
    
    // Mettre à jour la DB (banner_url = null)
    const updatedUser = userService.updateUser(username, { banner_url: null });
    
    res.json({
      success: true,
      message: 'Banner supprimé avec succès',
      user: updatedUser
    });
    
  } catch (error) {
    console.error('Erreur DELETE banner:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du banner' });
  }
});

module.exports = router;