const express = require('express');
const router = express.Router();
const uploadService = require('../services/uploadService');
const userService = require('../services/userService');

// POST /api/uploads/avatar/:username
router.post('/avatar/:username', uploadService.single('avatar'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Aucun fichier fourni' });
    }

    const profile = userService.getUserProfile(req.params.username);
    const avatarUrl = uploadService.replaceFile(profile?.avatar_url, req.file.filename);

    const updated = userService.updateUserProfile(req.params.username, {
      avatar_url: avatarUrl
    });

    res.json({ success: true, profile: updated, avatarUrl });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/uploads/banner/:username
router.post('/banner/:username', uploadService.single('banner'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Aucun fichier fourni' });
    }

    const profile = userService.getUserProfile(req.params.username);
    const bannerUrl = uploadService.replaceFile(profile?.banner_url, req.file.filename);

    const updated = userService.updateUserProfile(req.params.username, {
      banner_url: bannerUrl
    });

    res.json({ success: true, profile: updated, bannerUrl });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
