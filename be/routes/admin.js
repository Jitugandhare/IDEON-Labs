const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../model/admin.js');
const Slot = require('../model/slot.js');
const { protectAdmin } = require('../middleware/auth.js');

const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();

// Admin Registration
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    const adminExists = await Admin.findOne({ email });
    if (adminExists) return res.status(400).json({ message: 'Admin already exists' });

    const admin = await Admin.create({ email, password });
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ message: 'Admin registered successfully', token });
  } catch (error) {
    res.status(500).json({ message: 'Error registering admin', error });
  }
});

// Admin Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ message: 'Admin logged in successfully', token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in admin', error });
  }
});

// Open Slots for Booking
router.post('/slots', protectAdmin, async (req, res) => {
  const { date, timeRange } = req.body;

  try {
    const existingSlot = await Slot.findOne({ date, timeRange });
    if (existingSlot) {
      return res.status(400).json({ message: 'Slot already exists' });
    }

    const slot = new Slot({ date, timeRange });
    await slot.save();
    res.status(201).json({ message: 'Slot opened successfully', slot });
  } catch (error) {
    res.status(500).json({ message: 'Error opening slot', error });
  }
});

module.exports = router;
