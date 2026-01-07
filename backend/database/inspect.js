import db from './init.js';

/**
 * Script utilitaire pour inspecter la base de données
 * Usage: node database/inspect.js
 */

console.log('\n📊 === INSPECTION DE LA BASE DE DONNÉES ===\n');

// Statistiques générales
const stats = db.prepare(`
  SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM users WHERE status = 'online') as online_users,
    (SELECT COUNT(*) FROM messages) as total_messages,
    (SELECT COUNT(*) FROM messages WHERE deleted = 0) as active_messages,
    (SELECT COUNT(*) FROM attachments) as total_attachments
`).get();

console.log('📈 Statistiques globales:');
console.log(`   👤 Utilisateurs totaux: ${stats.total_users}`);
console.log(`   🟢 Utilisateurs en ligne: ${stats.online_users}`);
console.log(`   💬 Messages totaux: ${stats.total_messages}`);
console.log(`   ✅ Messages actifs: ${stats.active_messages}`);
console.log(`   📎 Pièces jointes: ${stats.total_attachments}`);

// Top 5 des utilisateurs les plus actifs
console.log('\n🏆 Top 5 utilisateurs les plus actifs:');
const topUsers = db.prepare(`
  SELECT 
    u.username,
    COUNT(m.id) as message_count
  FROM users u
  LEFT JOIN messages m ON u.id = m.user_id AND m.deleted = 0
  GROUP BY u.id
  ORDER BY message_count DESC
  LIMIT 5
`).all();

topUsers.forEach((user, index) => {
  console.log(`   ${index + 1}. ${user.username}: ${user.message_count} messages`);
});

// Derniers messages
console.log('\n📝 5 derniers messages:');
const recentMessages = db.prepare(`
  SELECT 
    username,
    content,
    datetime(created_at, 'localtime') as date
  FROM messages
  WHERE deleted = 0
  ORDER BY created_at DESC
  LIMIT 5
`).all();

recentMessages.forEach((msg, index) => {
  const preview = msg.content.length > 50 
    ? msg.content.substring(0, 50) + '...' 
    : msg.content;
  console.log(`   ${index + 1}. [${msg.date}] ${msg.username}: ${preview}`);
});

// Utilisateurs récents
console.log('\n👥 Utilisateurs connectés récemment:');
const recentUsers = db.prepare(`
  SELECT 
    username,
    status,
    datetime(last_seen, 'localtime') as last_seen
  FROM users
  ORDER BY last_seen DESC
  LIMIT 10
`).all();

recentUsers.forEach((user) => {
  const statusEmoji = user.status === 'online' ? '🟢' : '⚫';
  console.log(`   ${statusEmoji} ${user.username} - ${user.last_seen}`);
});

console.log('\n✅ Inspection terminée\n');