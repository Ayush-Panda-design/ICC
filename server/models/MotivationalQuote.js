const mongoose = require('mongoose');

const MotivationalQuoteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('MotivationalQuote', MotivationalQuoteSchema);
