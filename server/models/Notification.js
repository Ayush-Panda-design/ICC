const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'opening:new',
      'deadline',
      'url:broken',
      'url:fixed',
      'sync',
      'info',
      'coach',
      'missed_day',
      'streak_break',
      'behind_checkpoint'
    ],
    default: 'info'
  },
  title: { type: String, required: true },
  body: { type: String },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  url: { type: String },
  read: { type: Boolean, default: false },
  meta: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

NotificationSchema.index({ createdAt: -1 });
NotificationSchema.index({ read: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);
