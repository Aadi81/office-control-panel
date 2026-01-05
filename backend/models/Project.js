// backend/models/Project.js
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projectName: {
    type: String,
    required: true,
    trim: true
  },
  workAndRole: {
    type: String,
    required: true,
    maxlength: 500
  },
  assignDate: {
    type: Date,
    default: Date.now
  },
  submissionDate: {
    type: Date
  },
  remarks: {
    type: String,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['current', 'completed'],
    default: 'current'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
projectSchema.index({ employeeId: 1, status: 1 });

module.exports = mongoose.model('Project', projectSchema);