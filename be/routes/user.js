const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/user.js');
const Slot = require('../model/slot.js');
const { protectUser } = require('../middleware/auth.js');

const router = express.Router();
const dotenv = require('dotenv');

dotenv.config();


// User Registration
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ email, password });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user' });
  }
});

// User Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ message: 'User logged in successfully', token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in user' });
  }
});

// View Available Slots
router.get('/slots', async (req, res) => {
  try {
    const slots = await Slot.find({ isAvailable: true }).populate('bookedBy');
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching slots' });
  }
});

// Book a Slot
router.post('/slots/book', protectUser, async (req, res) => {
  const { slotId } = req.body;
  const userId = req.user._id;

  try {
    const slot = await Slot.findById(slotId);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });

    // Check if slot is already booked
    if (!slot.isAvailable) {
      return res.status(400).json({ message: 'Slot is already booked' });
    }

    // Ensure slot is not in the past
    const currentDate = new Date();
    if (new Date(slot.date) < currentDate) {
      return res.status(400).json({ message: 'You cannot book past slots' });
    }

    // Book the slot
    slot.isAvailable = false;
    slot.bookedBy = userId;
    await slot.save();

    res.json({ message: 'Slot successfully booked', slot });
  } catch (error) {
    res.status(500).json({ message: 'Error booking slot' });
  }
});

module.exports = router;
