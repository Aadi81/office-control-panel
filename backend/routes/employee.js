// backend/routes/employee.js
const express = require('express');
const router = express.Router();
const { protectEmployee } = require('../middleware/auth');
const User = require('../models/User');
const Project = require('../models/Project');
const Client = require('../models/Client');
const DailyTask = require('../models/DailyTask');
const WorkingDay = require('../models/WorkingDay');
const { emitToAll } = require('../utils/socket');

// @route   GET /api/employee/dashboard
// @desc    Get employee dashboard data
// @access  Private
router.get('/dashboard', protectEmployee, async (req, res) => {
  try {
    const employeeId = req.user._id;

    // Get employee info
    const employee = await User.findById(employeeId).select('-password');

    // Get daily tasks
    const dailyTasks = await DailyTask.find({ employeeId })
      .sort({ createdAt: -1 });

    // Get working days
    const workingDays = await WorkingDay.find({ employeeId })
      .sort({ date: -1, loginTime: -1 });

    // Calculate total working days (unique dates)
    const uniqueDates = [...new Set(workingDays.map(wd => wd.date))];
    const totalWorkingDays = uniqueDates.length;

    // Get current login time
    const today = new Date().toISOString().split('T')[0];
    const currentSession = await WorkingDay.findOne({
      employeeId,
      date: today,
      logoutTime: null
    }).sort({ loginTime: -1 });

    res.json({
      success: true,
      data: {
        employee,
        dailyTasks,
        workingDays,
        totalWorkingDays,
        currentLoginTime: currentSession ? currentSession.loginTime : null
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard'
    });
  }
});

// @route   POST /api/employee/daily-task
// @desc    Add daily task
// @access  Private
router.post('/daily-task', protectEmployee, async (req, res) => {
  try {
    const { taskDescription } = req.body;
    const employeeId = req.user._id;

    if (!taskDescription || taskDescription.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Task description is required'
      });
    }

    const task = await DailyTask.create({
      employeeId,
      taskDescription: taskDescription.trim()
    });

    emitToAll('daily-task-added', {
      employeeId,
      task
    });

    res.status(201).json({
      success: true,
      message: 'Task added successfully',
      task
    });
  } catch (error) {
    console.error('Daily task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding task'
    });
  }
});

// @route   GET /api/employee/projects
// @desc    Get all projects
// @access  Private
router.get('/projects', protectEmployee, async (req, res) => {
  try {
    const employeeId = req.user._id;

    const currentProjects = await Project.find({
      employeeId,
      status: 'current'
    }).sort({ assignDate: -1 });

    const completedProjects = await Project.find({
      employeeId,
      status: 'completed'
    }).sort({ submissionDate: -1 });

    res.json({
      success: true,
      data: {
        currentProjects,
        completedProjects
      }
    });
  } catch (error) {
    console.error('Projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching projects'
    });
  }
});

// @route   POST /api/employee/project
// @desc    Add new project
// @access  Private
router.post('/project', protectEmployee, async (req, res) => {
  try {
    const { projectName, workAndRole } = req.body;
    const employeeId = req.user._id;

    if (!projectName || !workAndRole) {
      return res.status(400).json({
        success: false,
        message: 'Project name and work description are required'
      });
    }

    const project = await Project.create({
      employeeId,
      projectName: projectName.trim(),
      workAndRole: workAndRole.trim(),
      status: 'current'
    });

    emitToAll('project-added', {
      employeeId,
      project
    });

    res.status(201).json({
      success: true,
      message: 'Project added successfully',
      project
    });
  } catch (error) {
    console.error('Add project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding project'
    });
  }
});

// @route   PUT /api/employee/project/:id/complete
// @desc    Mark project as complete
// @access  Private
router.put('/project/:id/complete', protectEmployee, async (req, res) => {
  try {
    const { remarks } = req.body;
    const projectId = req.params.id;
    const employeeId = req.user._id;

    const project = await Project.findOne({
      _id: projectId,
      employeeId
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    project.status = 'completed';
    project.submissionDate = new Date();
    project.remarks = remarks || '';
    await project.save();

    emitToAll('project-completed', {
      employeeId,
      project
    });

    res.json({
      success: true,
      message: 'Project marked as completed',
      project
    });
  } catch (error) {
    console.error('Complete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error completing project'
    });
  }
});

// @route   GET /api/employee/clients
// @desc    Get all clients
// @access  Private
router.get('/clients', protectEmployee, async (req, res) => {
  try {
    const employeeId = req.user._id;

    const clients = await Client.find({ employeeId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { clients }
    });
  } catch (error) {
    console.error('Clients error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching clients'
    });
  }
});

// @route   POST /api/employee/client
// @desc    Add new client
// @access  Private
router.post('/client', protectEmployee, async (req, res) => {
  try {
    const {
      companyName, clientName, clientDesignation,
      clientEmail, clientContact, isSensitive
    } = req.body;
    const employeeId = req.user._id;

    if (!companyName || !clientName || !clientDesignation || !clientEmail || !clientContact) {
      return res.status(400).json({
        success: false,
        message: 'All client fields are required'
      });
    }

    const client = await Client.create({
      employeeId,
      companyName: companyName.trim(),
      clientName: clientName.trim(),
      clientDesignation: clientDesignation.trim(),
      clientEmail: clientEmail.trim(),
      clientContact: clientContact.trim(),
      isSensitive: isSensitive || false
    });

    emitToAll('client-added', {
      employeeId,
      client
    });

    res.status(201).json({
      success: true,
      message: 'Client added successfully',
      client
    });
  } catch (error) {
    console.error('Add client error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding client'
    });
  }
});

module.exports = router;