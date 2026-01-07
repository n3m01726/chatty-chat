import { User } from './models/User.js';
import { Message } from './models/Message.js';

/**
 * Script pour peupler la base avec des données de test
 * Usage: node database/seed.js
 */

console.log('🌱 Seeding de la base de données...\n');

// Créer des utilisateurs de test
const testUsers = [
  {
    id: 'user-alice',
    username: 'Alice',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    status: 'online'
  },
  {
    id: 'user-bob',
    username: 'Bob',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    status: 'busy'
  },
  {
    id: 'user-charlie',
    username: 'Charlie',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
    status: 'away'
  }
];

console.log('👤 Création des utilisateurs...');
testUsers.forEach(user => {
  User.upsert(user);
  console.log(`   ✅ ${user.username} créé`);
});

// Créer des messages de test
const testMessages = [
  {
    userId: 'user-alice',
    username: 'Alice',
    avatar: testUsers[0].avatar,
    content: 'Salut tout le monde ! 👋'
  },
  {
    userId: 'user-bob',
    username: 'Bob',
    avatar: testUsers[1].avatar,
    content: 'Hey Alice ! Comment ça va ?'
  },
  {
    userId: 'user-alice',
    username: 'Alice',
    avatar: testUsers[0].avatar,
    content: 'Super bien merci ! Vous connaissez le **markdown** ?'
  },
  {
    userId: 'user-charlie',
    username: 'Charlie',
    avatar: testUsers[2].avatar,
    content: 'Oui ! On peut faire *italique*, __souligné__, ~~barré~~ et `code` !'
  },
  {
    userId: 'user-bob',
    username: 'Bob',
    avatar: testUsers[1].avatar,
    content: 'C\'est cool ! On peut aussi ajouter des GIFs et des images 🎉'
  },
  {
    userId: 'user-alice',
    username: 'Alice',
    avatar: testUsers[0].avatar,
    content: 'Voici un exemple de code:\n```javascript\nconst hello = "world";\nconsole.log(hello);\n```'
  }
];

console.log('\n💬 Création des messages...');
testMessages.forEach((msgData, index) => {
  Message.create(msgData);
  console.log(`   ✅ Message ${index + 1} créé`);
});

// Message avec attachement
console.log('\n📎 Création d\'un message avec attachement...');
const messageWithAttachment = Message.create({
  userId: 'user-charlie',
  username: 'Charlie',
  avatar: testUsers[2].avatar,
  content: 'Regardez ce GIF !',
  attachments: [
    {
      type: 'gif',
      url: 'https://media.tenor.com/images/abc123/tenor.gif',
      name: 'Happy GIF'
    }
  ]
});
console.log('   ✅ Message avec GIF créé');

console.log('\n✅ Seeding terminé !\n');
console.log('💡 Lance `node database/inspect.js` pour voir les données\n');