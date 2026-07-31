const mongoose = require('mongoose');

const DesignDrillSchema = new mongoose.Schema({
  title: { type: String, required: true },
  kind: { type: String, enum: ['LLD', 'HLD'], required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  prompt: { type: String, required: true },
  checklist: [{ type: String }],
  tags: [{ type: String }],
  companies: [{ type: String }],
  status: { type: String, enum: ['Todo', 'In Progress', 'Done', 'Revisit'], default: 'Todo' },
  lastPracticedAt: { type: Date },
  selfScore: { type: Number, min: 1, max: 4 },
  notes: { type: String },
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('DesignDrill', DesignDrillSchema);
