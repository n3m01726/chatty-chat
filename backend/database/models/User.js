import db from '../init.js';

/**
 * Model User - Gestion des utilisateurs
 */
export class User {
  /**
   * Créer ou mettre à jour un utilisateur
   */
  static upsert(userData) {
    const stmt = db.prepare(`
      INSERT INTO users (id, username, avatar, status, last_seen)
      VALUES (@id, @username, @avatar, @status, datetime('now'))
      ON CONFLICT(id) DO UPDATE SET
        username = @username,
        avatar = @avatar,
        status = @status,
        last_seen = datetime('now')
    `);

    return stmt.run({
      id: userData.id,
      username: userData.username,
      avatar: userData.avatar || null,
      status: userData.status || 'online'
    });
  }

  /**
   * Récupérer un utilisateur par son ID
   */
  static getById(userId) {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(userId);
  }

  /**
   * Récupérer tous les utilisateurs actifs (connectés récemment)
   */
  static getActive() {
    // Considérer comme actif si connecté dans les 5 dernières minutes
    const stmt = db.prepare(`
      SELECT * FROM users 
      WHERE datetime(last_seen) > datetime('now', '-5 minutes')
      ORDER BY last_seen DESC
    `);
    return stmt.all();
  }

  /**
   * Mettre à jour le statut d'un utilisateur
   */
  static updateStatus(userId, status) {
    const stmt = db.prepare(`
      UPDATE users 
      SET status = ?, last_seen = datetime('now')
      WHERE id = ?
    `);
    return stmt.run(status, userId);
  }

  /**
   * Mettre à jour le profil complet
   */
  static updateProfile(userId, profileData) {
    const fields = [];
    const values = [];

    // Construire dynamiquement la requête en fonction des champs fournis
    const allowedFields = [
      'display_name', 'pronouns', 'bio', 'status_message', 
      'custom_color', 'timezone', 'cover', 'avatar'
    ];

    for (const field of allowedFields) {
      if (profileData[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(profileData[field]);
      }
    }

    if (fields.length === 0) return null;

    values.push(userId);

    const stmt = db.prepare(`
      UPDATE users 
      SET ${fields.join(', ')}, last_seen = datetime('now')
      WHERE id = ?
    `);

    return stmt.run(...values);
  }

  /**
   * Marquer un utilisateur comme déconnecté
   */
  static setOffline(userId) {
    return User.updateStatus(userId, 'offline');
  }

  /**
   * Obtenir les stats d'un utilisateur
   */
  static getStats(userId) {
    const messageCount = db.prepare(`
      SELECT COUNT(*) as count 
      FROM messages 
      WHERE user_id = ? AND deleted = 0
    `).get(userId);

    const user = User.getById(userId);

    return {
      messageCount: messageCount?.count || 0,
      memberSince: user?.created_at || null
    };
  }

  /**
   * Supprimer les utilisateurs inactifs (optionnel, pour nettoyage)
   */
  static cleanupInactive(daysInactive = 30) {
    const stmt = db.prepare(`
      DELETE FROM users 
      WHERE datetime(last_seen) < datetime('now', '-' || ? || ' days')
    `);
    return stmt.run(daysInactive);
  }
}

export default User;