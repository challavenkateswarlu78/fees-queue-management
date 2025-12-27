const express = require('express');
const router = express.Router();

// Placeholder student route(s)
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Student routes placeholder' });
});

module.exports = router;
