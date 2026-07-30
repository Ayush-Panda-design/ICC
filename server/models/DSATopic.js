const mongoose = require('mongoose');

const DSATopicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sheetStep: { type: Number },
  month: { type: Number, required: true },
  week: { type: Number, required: true },
  order: { type: Number, required: true },
  totalProblems: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('DSATopic', DSATopicSchema);
