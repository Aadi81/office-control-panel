// backend/routes/master.js - UPDATED WITH PROJECTS IN EMPLOYEE DETAILS
const express = require('express');
const router = express.Router();
const { protectMaster } = require('../middleware/auth');
const User = require('../models/User');
const Project = require('../models/Project');
const Client = require('../models/Client');
const WorkingDay = require('../models/WorkingDay');
const SensitiveProject = require('../models/SensitiveProject');
const { emitToAll } = require('../utils/socket');

// Get all employees
router.get('/employees', protectMaster, async (req, res) => {
  try {
    const employees = await User.find().select('-password');

    const employeesWithDetails = await Promise.all(
      employees.map(async (employee) => {
        const projectsAssigned = await Project.countDocuments({
          employeeId: employee._id,
          status: 'current'
        });

        const projectsCompleted = await Project.countDocuments({
          employeeId: employee._id,
          status: 'completed'
        });

        const workingDays = await WorkingDay.find({
          employeeId: employee._id
        });

        const uniqueDates = [...new Set(workingDays.map(wd => wd.date))];
        const totalWorkingDays = uniqueDates.length;

        return {
          ...employee.toObject(),
          projectsAssigned,
          projectsCompleted,
          totalWorkingDays,
          workingDaysDetails: workingDays
        };
      })
    );

    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.isActive).length;
    const nonActiveEmployees = totalEmployees - activeEmployees;
    
    const softwareTeam = employees.filter(e => e.department === 'Software Development').length;
    const financeTeam = employees.filter(e => e.department === 'Finance & Legal').length;
    const hrTeam = employees.filter(e => e.department === 'HR & Sales').length;

    res.json({
      success: true,
      data: {
        employees: employeesWithDetails,
        statistics: {
          totalEmployees,
          activeEmployees,
          nonActiveEmployees,
          softwareTeam,
          financeTeam,
          hrTeam
        }
      }
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching employees'
    });
  }
});

// ✅ UPDATED: Get single employee with PROJECTS
router.get('/employees/:id', protectMaster, async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const projectsAssigned = await Project.countDocuments({
      employeeId: employee._id,
      status: 'current'
    });

    const projectsCompleted = await Project.countDocuments({
      employeeId: employee._id,
      status: 'completed'
    });

    // ✅ NEW: Get actual project lists
    const currentProjects = await Project.find({
      employeeId: employee._id,
      status: 'current'
    }).sort({ assignDate: -1 });

    const completedProjects = await Project.find({
      employeeId: employee._id,
      status: 'completed'
    }).sort({ submissionDate: -1 });

    const workingDays = await WorkingDay.find({
      employeeId: employee._id
    }).sort({ date: -1, loginTime: -1 });

    const uniqueDates = [...new Set(workingDays.map(wd => wd.date))];
    const totalWorkingDays = uniqueDates.length;

    res.json({
      success: true,
      data: {
        employee,
        projectsAssigned,
        projectsCompleted,
        currentProjects,      // ✅ NEW
        completedProjects,    // ✅ NEW
        totalWorkingDays,
        workingDaysDetails: workingDays
      }
    });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching employee details'
    });
  }
});

// Get employees by department
router.get('/employees/department/:dept', protectMaster, async (req, res) => {
  try {
    const department = req.params.dept;
    
    const employees = await User.find({ department }).select('-password');

    const employeesWithDetails = await Promise.all(
      employees.map(async (employee) => {
        const projectsAssigned = await Project.countDocuments({
          employeeId: employee._id,
          status: 'current'
        });

        const projectsCompleted = await Project.countDocuments({
          employeeId: employee._id,
          status: 'completed'
        });

        const workingDays = await WorkingDay.find({
          employeeId: employee._id
        });

        const uniqueDates = [...new Set(workingDays.map(wd => wd.date))];
        const totalWorkingDays = uniqueDates.length;

        return {
          ...employee.toObject(),
          projectsAssigned,
          projectsCompleted,
          totalWorkingDays
        };
      })
    );

    res.json({
      success: true,
      data: { employees: employeesWithDetails }
    });
  } catch (error) {
    console.error('Get department employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching department employees'
    });
  }
});

// Get sensitive clients
router.get('/sensitive-clients', protectMaster, async (req, res) => {
  try {
    const sensitiveClients = await Client.find({ isSensitive: true })
      .populate('employeeId', 'tiplId fullName')
      .sort({ createdAt: -1 });

    const formattedClients = sensitiveClients.map(client => ({
      ...client.toObject(),
      markedByEmployeeId: client.employeeId.tiplId,
      employeeName: client.employeeId.fullName
    }));

    res.json({
      success: true,
      data: { clients: formattedClients }
    });
  } catch (error) {
    console.error('Get sensitive clients error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching sensitive clients'
    });
  }
});

// Get sensitive projects
router.get('/sensitive-projects', protectMaster, async (req, res) => {
  try {
    const sensitiveProjects = await SensitiveProject.find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { projects: sensitiveProjects }
    });
  } catch (error) {
    console.error('Get sensitive projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching sensitive projects'
    });
  }
});

// Add sensitive project
router.post('/sensitive-project', protectMaster, async (req, res) => {
  try {
    const {
      companyName, projectName, projectEngineer,
      employeeId, projectAssignDate, clientName,
      clientDesignation, contactNo, emailId
    } = req.body;

    if (!companyName || !projectName || !projectEngineer || !employeeId || 
        !projectAssignDate || !clientName || !clientDesignation || 
        !contactNo || !emailId) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const project = await SensitiveProject.create({
      companyName: companyName.trim(),
      projectName: projectName.trim(),
      projectEngineer: projectEngineer.trim(),
      employeeId: employeeId.trim(),
      projectAssignDate,
      clientName: clientName.trim(),
      clientDesignation: clientDesignation.trim(),
      contactNo: contactNo.trim(),
      emailId: emailId.trim()
    });

    emitToAll('sensitive-project-added', { project });

    res.status(201).json({
      success: true,
      message: 'Sensitive project added successfully',
      project
    });
  } catch (error) {
    console.error('Add sensitive project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding sensitive project'
    });
  }
});

module.exports = router;


















