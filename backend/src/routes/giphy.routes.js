const express = require('express');
const router = express.Router();
const giphyService = require('../services/giphyService');

router.get('/search', async (req, res) => {
  try {
    if (!req.query.q) {
      return res.status(400).json({ success: false, error: 'Query parameter "q" is required' });
    }

    const result = await giphyService.search(
      req.query.q,
      parseInt(req.query.limit) || 20,
      parseInt(req.query.offset) || 0
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/trending', async (req, res) => {
  try {
    const result = await giphyService.trending(
      parseInt(req.query.limit) || 20,
      parseInt(req.query.offset) || 0
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
