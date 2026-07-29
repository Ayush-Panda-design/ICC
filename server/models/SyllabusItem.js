const mongoose = require('mongoose');

const SyllabusItemSchema = new mongoose.Schema({
  category: { type: String, enum: ['CN', 'DBMS', 'OOP', 'LLD', 'Tech'], required: true },
  title: { type: String, required: true },
  phase: { type: Number, required: true },
  completed: { type: Boolean, default: false },
  hoursSpent: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('SyllabusItem', SyllabusItemSchema);
