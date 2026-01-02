// services/messageService.js
const databaseService = require('./databaseService');

/**
 * Service de gestion des messages (avec SQLite)
 */
class MessageService {
  /**
   * Ajoute un nouveau message dans la DB
   */
  addMessage(userId, username, text, options = {}) {
    const db = databaseService.getDb();
    
    const {
      has_markdown = false,
      attachment_type = null,
      attachment_url = null,
      attachment_expires_at = null,
      gif_url = null
    } = options;
    
    const result = db.prepare(`
      INSERT INTO messages (
        user_id, text, has_markdown, attachment_type, 
        attachment_url, attachment_expires_at, gif_url, created_at
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(
      userId, 
      text, 
      has_markdown ? 1 : 0, 
      attachment_type,
      attachment_url,
      attachment_expires_at,
      gif_url
    );
    
    // Récupérer le message complet qu'on vient d'insérer avec les infos utilisateur
    const message = db.prepare(`
      SELECT 
        m.id, 
        m.text,
        m.has_markdown,
        m.attachment_type,
        m.attachment_url,
        m.attachment_expires_at,
        m.gif_url,
        m.created_at as timestamp, 
        u.username,
        u.display_name,
        u.custom_color,
        u.avatar_url
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.id = ?
    `).get(result.lastInsertRowid);
    
    return message;
  }

  /**
   * Récupère tous les messages (avec limite)
   */
  getAllMessages(limit = 100) {
    const db = databaseService.getDb();
    
    const messages = db.prepare(`
      SELECT 
        m.id, 
        m.text,
        m.has_markdown,
        m.attachment_type,
        m.attachment_url,
        m.attachment_expires_at,
        m.gif_url,
        m.created_at as timestamp, 
        u.username,
        u.display_name,
        u.custom_color,
        u.avatar_url
      FROM messages m
      JOIN users u ON m.user_id = u.id
      ORDER BY m.created_at ASC
      LIMIT ?
    `).all(limit);
    
    return messages;
  }

  /**
   * Récupère les N derniers messages
   */
  getRecentMessages(count = 50) {
    const db = databaseService.getDb();
    
    // Récupérer les derniers messages en ordre inverse
    const messages = db.prepare(`
      SELECT m.id, m.text, m.created_at as timestamp, u.username
      FROM messages m
      JOIN users u ON m.user_id = u.id
      ORDER BY m.created_at DESC
      LIMIT ?
    `).all(count);
    
    // Inverser pour avoir l'ordre chronologique
    return messages.reverse();
  }

  /**
   * Récupère les messages d'un utilisateur spécifique
   */
  getUserMessages(username, limit = 50) {
    const db = databaseService.getDb();
    
    const messages = db.prepare(`
      SELECT m.id, m.text, m.created_at as timestamp, u.username
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE u.username = ?
      ORDER BY m.created_at DESC
      LIMIT ?
    `).all(username, limit);
    
    return messages.reverse();
  }

  /**
   * Recherche des messages par texte
   */
  searchMessages(query, limit = 50) {
    const db = databaseService.getDb();
    
    const messages = db.prepare(`
      SELECT m.id, m.text, m.created_at as timestamp, u.username
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.text LIKE ?
      ORDER BY m.created_at DESC
      LIMIT ?
    `).all(`%${query}%`, limit);
    
    return messages.reverse();
  }

  /**
   * Compte total de messages
   */
  getMessageCount() {
    const db = databaseService.getDb();
    const result = db.prepare('SELECT COUNT(*) as count FROM messages').get();
    return result.count;
  }

  /**
   * Supprime un message (pour modération)
   */
  deleteMessage(messageId) {
    const db = databaseService.getDb();
    
    // Récupérer le message pour supprimer les fichiers associés
    const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(messageId);
    
    if (message && message.attachment_url) {
      const uploadService = require('./uploadService');
      uploadService.deleteFile(message.attachment_url);
    }
    
    const result = db.prepare('DELETE FROM messages WHERE id = ?').run(messageId);
    return result.changes > 0;
  }

  /**
   * Supprime un message si l'utilisateur en est propriétaire
   */
  deleteMessageByUser(messageId, userId) {
    const db = databaseService.getDb();
    
    // Vérifier que l'utilisateur est bien le propriétaire
    const message = db.prepare('SELECT * FROM messages WHERE id = ? AND user_id = ?').get(messageId, userId);
    
    if (!message) {
      return { success: false, error: 'Message non trouvé ou non autorisé' };
    }
    
    // Supprimer les fichiers attachés
    if (message.attachment_url) {
      const uploadService = require('./uploadService');
      uploadService.deleteFile(message.attachment_url);
    }
    
    const result = db.prepare('DELETE FROM messages WHERE id = ?').run(messageId);
    return { success: result.changes > 0, messageId };
  }

  /**
   * Récupère les statistiques des messages
   */
  getStats() {
    const db = databaseService.getDb();
    
    const totalMessages = this.getMessageCount();
    
    const topUsers = db.prepare(`
      SELECT u.username, COUNT(*) as count
      FROM messages m
      JOIN users u ON m.user_id = u.id
      GROUP BY u.username
      ORDER BY count DESC
      LIMIT 10
    `).all();
    
    return {
      totalMessages,
      topUsers
    };
  }

  /**
   * Efface tous les messages (pour dev/test)
   */
  clearMessages() {
    const db = databaseService.getDb();
    db.prepare('DELETE FROM messages').run();
    console.log('🗑️  Tous les messages ont été supprimés');
  }

  /**
   * Nettoie les messages avec attachments expirés
   */
  cleanExpiredAttachments() {
    const db = databaseService.getDb();
    
    // Récupérer les messages avec attachments expirés
    const expired = db.prepare(`
      SELECT id, attachment_url 
      FROM messages 
      WHERE attachment_expires_at IS NOT NULL 
      AND attachment_expires_at < CURRENT_TIMESTAMP
    `).all();
    
    if (expired.length === 0) return 0;
    
    // Supprimer les fichiers du disque
    const uploadService = require('./uploadService');
    for (const msg of expired) {
      if (msg.attachment_url) {
        uploadService.deleteFile(msg.attachment_url);
      }
    }
    
    // Mettre à jour la DB (retirer les attachments mais garder le message)
    const result = db.prepare(`
      UPDATE messages 
      SET attachment_type = NULL, 
          attachment_url = NULL, 
          attachment_expires_at = NULL
      WHERE attachment_expires_at IS NOT NULL 
      AND attachment_expires_at < CURRENT_TIMESTAMP
    `).run();
    
    console.log(`🗑️  ${result.changes} attachments expirés nettoyés`);
    return result.changes;
  }
}

module.exports = new MessageService();