// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  officeEmail: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  designation: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  monthOfJoining: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true,
    enum: ['Software Development', 'Finance & Legal', 'HR & Sales']
  },
  tiplId: {
    type: String,
    required: true,
    unique: true
  },
  contactNo: {
    type: String,
    required: true
  },
  personalEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  address: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  },
  totalStorageUsed: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function() {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    return; // no next() needed
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
