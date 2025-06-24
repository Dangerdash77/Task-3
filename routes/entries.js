const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');
const { requireAuth } = require('../middleware/auth');

// GET all entries
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    let entries = [];

    if (user.role === 'admin' || user.role === 'editor') {
      entries = await Entry.find().populate('owner');
    } else {
      entries = await Entry.find({ owner: user._id }).populate('owner');
    }

    res.render('dashboard', { user, entries });
  } catch (err) {
    console.error('Dashboard Route Error:', err.message);
    res.status(500).send('Server Error');
  }
});

// POST create entry (🔒 Editors not allowed)
router.post('/', requireAuth, async (req, res) => {
  if (req.user.role === 'editor') {
    return res.status(403).send('Editors are not allowed to create entries.');
  }

  const { title, content } = req.body;

  try {
    const entry = new Entry({ title, content, owner: req.user._id });
    await entry.save();
    res.redirect('/entries');
  } catch (err) {
    console.error('Create Error:', err.message);
    res.status(500).send('Server Error');
  }
});

// GET edit form
router.get('/:id/edit', requireAuth, async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id).populate('owner');
    if (!entry) return res.status(404).send('Entry not found');

    const canEdit =
      req.user.role === 'admin' ||
      (req.user.role === 'editor' && entry.owner.role === 'user') ||
      entry.owner._id.equals(req.user._id);

    if (!canEdit) return res.status(403).send('Not authorized');

    res.render('edit-entry', { entry });
  } catch (err) {
    console.error('Edit Form Error:', err.message);
    res.status(500).send('Server Error');
  }
});

// PUT update entry
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id).populate('owner');
    if (!entry) return res.status(404).send('Entry not found');

    const canEdit =
      req.user.role === 'admin' ||
      (req.user.role === 'editor' && entry.owner.role === 'user') ||
      entry.owner._id.equals(req.user._id);

    if (!canEdit) return res.status(403).send('Not authorized');

    entry.title = req.body.title;
    entry.content = req.body.content;
    await entry.save();

    res.redirect('/entries');
  } catch (err) {
    console.error('Update Error:', err.message);
    res.status(500).send('Server Error');
  }
});

// DELETE entry (🔒 Editors not allowed)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id).populate('owner');
    if (!entry) return res.status(404).send('Entry not found');

    const canDelete =
      req.user.role === 'admin' ||
      (req.user.role === 'user' && entry.owner._id.equals(req.user._id));

    if (!canDelete) return res.status(403).send('Not authorized');

    await Entry.findByIdAndDelete(req.params.id);
    res.redirect('/entries');
  } catch (err) {
    console.error('Delete Error:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
