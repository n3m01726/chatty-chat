const express = require('express');
const router = express.Router();
const messageService = require('../services/messageService');
const userService = require('../services/userService');
const uploadService = require('../services/uploadService');

// POST /api/messages/attachment
router.post('/attachment', uploadService.single('attachment'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Aucun fichier fourni' });
    }

    const type = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
    res.json({
      success: true,
      attachmentUrl: uploadService.getFileUrl(req.file.filename),
      type,
      filename: req.file.filename
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/messages/search
router.get('/search', (req, res) => {
  try {
    if (!req.query.q) {
      return res.status(400).json({ success: false, error: 'Query parameter "q" is required' });
    }

    const messages = messageService.searchMessages(req.query.q, parseInt(req.query.limit) || 50);
    res.json({ success: true, messages, count: messages.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/messages/:messageId
router.delete('/:messageId', (req, res) => {
  try {
    const user = userService.getUserProfile(req.body.username);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
    }

    const result = messageService.deleteMessageByUser(
      parseInt(req.params.messageId),
      user.id
    );

    res.status(result.success ? 200 : 403).json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
