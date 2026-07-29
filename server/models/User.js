const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String }, // Optional for v1
  cgpa: { type: Number },
  semester: { type: String },
  portfolioUrl: { type: String },
  githubUrl: { type: String },
  startDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
