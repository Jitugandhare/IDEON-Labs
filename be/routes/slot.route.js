const express = require('express');
const router = express.Router();
const Booking = require("../model/slot.model.js");
const moment = require('moment');

// Generate slots for a specific date (in 60-minute intervals)
function generateSlots(date) {
    let slots = [];
    let startTime = moment(date).startOf('day');
    let endTime = moment(date).endOf('day');
  
    while (startTime <= endTime) {
      slots.push(startTime.format('HH:mm'));
      startTime.add(60, 'minutes');
    }
  
    return slots;
}

// Get Available Slots
async function getAvailableSlots(date) {
    const slots = generateSlots(date);
    const existingBookings = await Booking.find({ date }).select('slot bookedCount');

    return slots.map(slot => {
        const booking = existingBookings.find(booking => booking.slot === slot);
        const isBooked = booking && booking.bookedCount >= 2;  // Check if the slot is fully booked
        return { slot, available: !isBooked };
    });
}

// Endpoint to get available slots for a given date
router.get('/slots', async (req, res) => {
    try {
        const { date } = req.query;

        if (!date || !moment(date, 'YYYY-MM-DD', true).isValid()) {
            return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
        }

        const availableSlots = await getAvailableSlots(date);
        const currentDate = moment().format('YYYY-MM-DD');

        // Disable slots for today that have passed the current time
        if (date === currentDate) {
            const currentTime = moment().format('HH:mm');
            availableSlots.forEach(slot => {
                if (moment(slot.slot, 'HH:mm').isBefore(currentTime)) {
                    slot.available = false;
                }
            });
        }

        return res.status(200).json(availableSlots);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to book a slot
router.post('/bookSlot', async (req, res) => {
    try {
        const { date, slot, userId } = req.body;

        if (!date || !slot || !userId) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        // Check if the slot format is valid
        if (!moment(slot, 'HH:mm', true).isValid()) {
            return res.status(400).json({ error: 'Invalid slot format. Use HH:mm.' });
        }

        // Check if the slot is already booked 2 times
        const existingBooking = await Booking.findOne({ date, slot });
        if (existingBooking && existingBooking.bookedCount >= 2) {
            return res.status(400).json({ error: 'Slot already booked twice.' });
        }

        // If the slot is not booked, or booked less than 2 times, create a new booking
        if (!existingBooking) {
            const booking = new Booking({ date, slot, userId });
            await booking.save();
        } else {
            // Increment the bookedCount if the slot already exists
            existingBooking.bookedCount += 1;
            await existingBooking.save();
        }

        return res.status(200).json({ success: 'Slot successfully booked.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
