const mongoose = require('mongoose');

const SlotSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  timeRange: { type: String, required: true },
  isAvailable: { type: Boolean, default: true },
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  bookedCount: { type: Number, default: 0 }  
});

module.exports = mongoose.model('Slot', SlotSchema);
