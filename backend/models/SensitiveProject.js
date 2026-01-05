// backend/models/SensitiveProject.js
const mongoose = require('mongoose');

const sensitiveProjectSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  projectName: {
    type: String,
    required: true,
    trim: true
  },
  projectEngineer: {
    type: String,
    required: true
  },
  employeeId: {
    type: String,
    required: true
  },
  projectAssignDate: {
    type: Date,
    required: true
  },
  clientName: {
    type: String,
    required: true
  },
  clientDesignation: {
    type: String,
    required: true
  },
  contactNo: {
    type: String,
    required: true
  },
  emailId: {
    type: String,
    required: true,
    lowercase: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SensitiveProject', sensitiveProjectSchema);