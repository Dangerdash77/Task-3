const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');
const { requireAuth } = require('../middleware/auth');

// GET dashboard
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    let entries = [];

    if (user.role === 'admin') {
      entries = await Entry.find().populate({ path: 'owner', select: 'username role', strictPopulate: false });
    } else if (user.role === 'editor') {
      entries = await Entry.find().populate({ path: 'owner', select: 'username role', strictPopulate: false });
    } else {
      entries = await Entry.find({ owner: user._id }).populate({ path: 'owner', select: 'username role', strictPopulate: false });
    }

    res.render('dashboard', {
      user,
      entries
    });
  } catch (err) {
    console.error('Dashboard Route Error:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
