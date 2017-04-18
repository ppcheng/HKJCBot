const mongoose = require('mongoose');

const HorseSchema = new mongoose.Schema({
  _id: String,
  url: [
    String
  ],
  names: [
    String
  ],
  rating: {
    current: Number,
    change: Number
  }
}, {
  timestamps: true
});

const Horse = mongoose.model('Horse', HorseSchema);

module.exports = Horse;
