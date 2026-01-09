const express = require('express');
const router = express.Router();
const userService = require('../services/userService');
const messageService = require('../services/messageService');

router.get('/', (req, res) => {
  try {
    const stats = messageService.getStats();
    res.json({
      success: true,
      stats: {
        totalUsers: userService.getAllUsersFromDb().length,
        onlineUsers: userService.getUserCount(),
        totalMessages: stats.totalMessages,
        topUsers: stats.topUsers
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
