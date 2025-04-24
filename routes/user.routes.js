const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const addNewUserModel = require('../modals/addusermodel');



// Update user
router.post('/update', async (req, res) => {
  const { email, ...updates } = req.body;

  try {
    const user = await addNewUserModel.findOneAndUpdate({ email }, updates, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({ success: true, message: 'Updated successfully', data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating user' });
  }
});

// Get user by email
router.post('/get', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await addNewUserModel.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
