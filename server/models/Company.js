const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  category: { type: String, enum: ['Startup', 'Service', 'Product', 'FAANG'], required: true },
  stipend: { type: String },
  deadline: { type: Date },
  window: { type: String },
  mode: { type: String },
  platform: { type: String },
  url: { type: String },
  applyUrl: { type: String },
  matchScore: { type: Number },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  status: {
    type: String,
    enum: ['Not Applied', 'Applied', 'OA', 'Interview', 'Rejected', 'Offer'],
    default: 'Not Applied'
  },
  notes: { type: String },
  appliedAt: { type: Date },
  source: { type: String, default: 'pdf' },
  boardType: {
    type: String,
    enum: ['greenhouse', 'lever', 'ashby', 'manual', 'remotive'],
    default: 'manual'
  },
  boardSlug: { type: String },
  isOpen: { type: Boolean, default: false },
  lastSyncedAt: { type: Date },
  urlStatus: {
    type: String,
    enum: ['unknown', 'ok', 'broken', 'fallback'],
    default: 'unknown'
  },
  urlCheckedAt: { type: Date },
  urlCheckReason: { type: String },
  fallbackUrl: { type: String },
  openRoles: [{
    title: String,
    url: String,
    location: String,
    updatedAt: { type: Date, default: Date.now }
  }],
  batch: { type: String }
}, { timestamps: true });

CompanySchema.index({ name: 1, role: 1 });
CompanySchema.index({ category: 1, status: 1, isOpen: 1 });
CompanySchema.index({ deadline: 1 });
CompanySchema.index({ matchScore: -1 });

module.exports = mongoose.model('Company', CompanySchema);
