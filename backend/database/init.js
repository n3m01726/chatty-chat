import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Créer la base de données (stockée dans backend/database/chat.db)
const dbPath = path.join(__dirname, 'chat.db');
const db = new Database(dbPath);

console.log(`📁 Base de données: ${dbPath}`);

// Activer les foreign keys
db.pragma('foreign_keys = ON');

/**
 * Initialisation des tables
 */
export function initDatabase() {
  // Table des utilisateurs
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      avatar TEXT,
      cover TEXT,
      display_name TEXT,
      pronouns TEXT,
      bio TEXT,
      status TEXT DEFAULT 'offline',
      status_message TEXT,
      custom_color TEXT,
      timezone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table des messages
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      username TEXT NOT NULL,
      avatar TEXT,
      content TEXT NOT NULL,
      edited INTEGER DEFAULT 0,
      edited_at DATETIME,
      deleted INTEGER DEFAULT 0,
      deleted_by TEXT,
      deleted_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Table des attachements (pièces jointes)
  db.exec(`
    CREATE TABLE IF NOT EXISTS attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message_id TEXT NOT NULL,
      type TEXT NOT NULL,
      url TEXT NOT NULL,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
    )
  `);

  // Index pour améliorer les performances
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
    CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
    CREATE INDEX IF NOT EXISTS idx_attachments_message_id ON attachments(message_id);
  `);

  console.log('✅ Base de données initialisée');
}

// Initialiser au démarrage
initDatabase();

export default db;