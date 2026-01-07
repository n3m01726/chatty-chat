import db from '../init.js';

/**
 * Model Message - Gestion des messages
 */
export class Message {
  /**
   * Créer un nouveau message
   */
  static create(messageData) {
    const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const stmt = db.prepare(`
      INSERT INTO messages (id, user_id, username, avatar, content)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      messageId,
      messageData.userId,
      messageData.username,
      messageData.avatar || null,
      messageData.content
    );

    // Ajouter les attachements si présents
    if (messageData.attachments && messageData.attachments.length > 0) {
      Message.addAttachments(messageId, messageData.attachments);
    }

    return Message.getById(messageId);
  }

  /**
   * Récupérer un message par son ID
   */
  static getById(messageId) {
    const stmt = db.prepare('SELECT * FROM messages WHERE id = ?');
    const message = stmt.get(messageId);
    
    if (message) {
      // Récupérer les attachements
      message.attachments = Message.getAttachments(messageId);
      
      // Convertir les booléens (SQLite stocke en INTEGER)
      message.edited = Boolean(message.edited);
      message.deleted = Boolean(message.deleted);
      
      // Renommer les champs pour correspondre au format attendu
      message.timestamp = message.created_at;
      message.socketId = message.user_id;
    }
    
    return message;
  }

  /**
   * Récupérer l'historique des messages (par défaut les 100 derniers)
   */
  static getHistory(limit = 100) {
    const stmt = db.prepare(`
      SELECT * FROM messages 
      ORDER BY created_at DESC 
      LIMIT ?
    `);
    
    const messages = stmt.all(limit).reverse(); // Reverse pour avoir l'ordre chronologique
    
    // Enrichir chaque message avec ses attachements
    return messages.map(msg => {
      msg.attachments = Message.getAttachments(msg.id);
      msg.edited = Boolean(msg.edited);
      msg.deleted = Boolean(msg.deleted);
      msg.timestamp = msg.created_at;
      msg.socketId = msg.user_id;
      return msg;
    });
  }

  /**
   * Éditer un message
   */
  static edit(messageId, userId, newContent) {
    const stmt = db.prepare(`
      UPDATE messages 
      SET content = ?, edited = 1, edited_at = datetime('now')
      WHERE id = ? AND user_id = ?
    `);
    
    const result = stmt.run(newContent, messageId, userId);
    
    if (result.changes > 0) {
      return Message.getById(messageId);
    }
    return null;
  }

  /**
   * Supprimer un message (soft delete)
   */
  static delete(messageId, userId, deletedBy) {
    const stmt = db.prepare(`
      UPDATE messages 
      SET deleted = 1, deleted_by = ?, deleted_at = datetime('now')
      WHERE id = ? AND user_id = ?
    `);
    
    const result = stmt.run(deletedBy, messageId, userId);
    
    if (result.changes > 0) {
      return Message.getById(messageId);
    }
    return null;
  }

  /**
   * Ajouter des attachements à un message
   */
  static addAttachments(messageId, attachments) {
    const stmt = db.prepare(`
      INSERT INTO attachments (message_id, type, url, name)
      VALUES (?, ?, ?, ?)
    `);

    const insertMany = db.transaction((attachments) => {
      for (const attachment of attachments) {
        stmt.run(
          messageId,
          attachment.type,
          attachment.url,
          attachment.name || null
        );
      }
    });

    insertMany(attachments);
  }

  /**
   * Récupérer les attachements d'un message
   */
  static getAttachments(messageId) {
    const stmt = db.prepare(`
      SELECT type, url, name 
      FROM attachments 
      WHERE message_id = ?
      ORDER BY id ASC
    `);
    return stmt.all(messageId);
  }

  /**
   * Supprimer définitivement les vieux messages (nettoyage optionnel)
   */
  static cleanupOld(daysOld = 90) {
    const stmt = db.prepare(`
      DELETE FROM messages 
      WHERE datetime(created_at) < datetime('now', '-' || ? || ' days')
    `);
    return stmt.run(daysOld);
  }

  /**
   * Rechercher dans les messages
   */
  static search(query, limit = 50) {
    const stmt = db.prepare(`
      SELECT * FROM messages 
      WHERE content LIKE ? AND deleted = 0
      ORDER BY created_at DESC 
      LIMIT ?
    `);
    
    const messages = stmt.all(`%${query}%`, limit);
    
    return messages.map(msg => {
      msg.attachments = Message.getAttachments(msg.id);
      msg.edited = Boolean(msg.edited);
      msg.deleted = Boolean(msg.deleted);
      msg.timestamp = msg.created_at;
      msg.socketId = msg.user_id;
      return msg;
    });
  }
}

export default Message;