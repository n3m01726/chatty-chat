const express = require('express');
const router = express.Router();

router.use('/users', require('./users.routes'));
router.use('/messages', require('./messages.routes'));
router.use('/uploads', require('./uploads.routes'));
router.use('/giphy', require('./giphy.routes'));
router.use('/stats', require('./stats.routes'));

module.exports = router;
