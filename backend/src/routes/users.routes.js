const express = require('express');
const router = express.Router();
const userService = require('../services/userService');
const uploadService = require('../services/uploadService');

// GET /api/users
router.get('/', (req, res) => {
  try {
    const users = userService.getAllUsersFromDb();
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/users/:username
router.get('/:username', (req, res) => {
  try {
    const profile = userService.getUserStats(req.params.username);
    if (!profile) {
      return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
    }
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/users/:username
router.put('/:username', (req, res) => {
  try {
    const { username } = req.params;
    const data = req.body;

    const currentProfile = userService.getUserProfile(username);

    if (data.avatar_url === null && currentProfile?.avatar_url) {
      uploadService.deleteFile(currentProfile.avatar_url);
    }

    if (data.banner_url === null && currentProfile?.banner_url) {
      uploadService.deleteFile(currentProfile.banner_url);
    }

    const profile = userService.updateUserProfile(username, data);
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
