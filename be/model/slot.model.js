const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    date: { type: String, required: true },
    slot: { type: String, required: true },
    userId: { type: String, required: true },
    bookedAt: { type: Date, default: Date.now },
    bookedCount: { type: Number, default: 0 } 
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
