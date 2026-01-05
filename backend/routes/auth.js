// backend/routes/auth.js - FIXED WORKING DAYS LOGIC
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const WorkingDay = require('../models/WorkingDay');
const { emitToAll } = require('../utils/socket');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// ✅ FIXED: Helper function to get current date in India timezone
const getIndiaDate = () => {
  const now = new Date();
  // Convert to India timezone (UTC+5:30)
  const indiaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  
  // Format as YYYY-MM-DD
  const year = indiaTime.getFullYear();
  const month = String(indiaTime.getMonth() + 1).padStart(2, '0');
  const day = String(indiaTime.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// ✅ FIXED: Helper function to get start of day in India timezone
const getIndiaDayStart = () => {
  const dateStr = getIndiaDate();
  // Parse as India timezone
  return new Date(`${dateStr}T00:00:00+05:30`);
};

// Employee Sign Up
router.post('/employee/signup', [
  body('fullName').notEmpty().trim(),
  body('officeEmail').isEmail().normalizeEmail(),
  body('designation').notEmpty(),
  body('dateOfBirth').isDate(),
  body('monthOfJoining').notEmpty(),
  body('department').isIn(['Software Development', 'Finance & Legal', 'HR & Sales']),
  body('tiplId').notEmpty(),
  body('contactNo').notEmpty(),
  body('personalEmail').isEmail().normalizeEmail(),
  body('address').notEmpty(),
  body('username').notEmpty().trim(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      fullName, officeEmail, designation, dateOfBirth,
      monthOfJoining, department, tiplId, contactNo,
      personalEmail, address, username, password
    } = req.body;

    const existingUser = await User.findOne({
      $or: [{ officeEmail }, { username }, { tiplId }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email, username, or TIPL ID already exists'
      });
    }

    // ✅ FIXED: Get India timezone date
    const todayDate = getIndiaDate();
    const now = new Date();

    const user = await User.create({
      fullName, officeEmail, designation, dateOfBirth,
      monthOfJoining, department, tiplId, contactNo,
      personalEmail, address, username, password,
      isActive: true,
      lastLogin: now
    });

    // ✅ FIXED: Create login record with India date
    await WorkingDay.create({
      employeeId: user._id,
      date: todayDate,
      loginTime: now
    });

    const token = generateToken(user._id, 'employee');

    emitToAll('new-employee', {
      employeeId: user._id,
      fullName: user.fullName,
      department: user.department
    });

    res.status(201).json({
      success: true,
      message: 'Employee registered successfully',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        department: user.department,
        designation: user.designation
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// Employee Sign In
router.post('/employee/signin', [
  body('username').notEmpty(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    user.isActive = true;
    user.lastLogin = new Date();
    await user.save();

    // ✅ FIXED: Get India timezone date
    const todayDate = getIndiaDate();
    const now = new Date();

    // ✅ FIXED: Check if already logged in today
    const existingLogin = await WorkingDay.findOne({
      employeeId: user._id,
      date: todayDate,
      logoutTime: null
    });

    // Only create new login record if not already logged in today
    if (!existingLogin) {
      await WorkingDay.create({
        employeeId: user._id,
        date: todayDate,
        loginTime: now
      });
    }

    const token = generateToken(user._id, 'employee');

    emitToAll('employee-login', {
      employeeId: user._id,
      status: 'active'
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        department: user.department,
        designation: user.designation
      }
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Employee Logout
router.post('/employee/logout', async (req, res) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required'
      });
    }

    const user = await User.findById(employeeId);
    if (user) {
      user.isActive = false;
      await user.save();
    }

    // ✅ FIXED: Get India timezone date
    const todayDate = getIndiaDate();
    const now = new Date();

    // Update last working day record for today
    const lastWorkingDay = await WorkingDay.findOne({
      employeeId,
      date: todayDate,
      logoutTime: null
    }).sort({ loginTime: -1 });

    if (lastWorkingDay) {
      lastWorkingDay.logoutTime = now;
      await lastWorkingDay.save();
    }

    emitToAll('employee-logout', {
      employeeId,
      status: 'offline'
    });

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
});

// Master Sign In
router.post('/master/signin', [
  body('username').notEmpty(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { username, password } = req.body;

    if (username !== process.env.MASTER_USERNAME || password !== process.env.MASTER_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: 'Invalid master credentials'
      });
    }

    const token = generateToken('master', 'master');

    res.json({
      success: true,
      message: 'Master login successful',
      token,
      user: {
        role: 'master',
        username: 'Master'
      }
    });
  } catch (error) {
    console.error('Master signin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during master login'
    });
  }
});

module.exports = router;