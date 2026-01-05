// backend/routes/upload.js - FIXED TIMEOUT ISSUE
const express = require('express');
const router = express.Router();
const { protectEmployee } = require('../middleware/auth');
const { upload, cloudinary } = require('../middleware/upload');
const File = require('../models/File');
const User = require('../models/User');
const { emitToAll } = require('../utils/socket');

// ✅ FIX: Increase timeout for file upload route
router.post('/', protectEmployee, (req, res, next) => {
  // Set timeout to 5 minutes for file upload
  req.setTimeout(300000); // 5 minutes
  res.setTimeout(300000); // 5 minutes
  next();
}, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const employeeId = req.user._id;
    const fileSize = req.file.size;

    // Check employee's current storage usage
    const employee = await User.findById(employeeId);
    const storageLimit = parseInt(process.env.PER_EMPLOYEE_STORAGE_LIMIT) || 52428800; // 50MB

    if (employee.totalStorageUsed + fileSize > storageLimit) {
      // Delete uploaded file from Cloudinary
      try {
        await cloudinary.uploader.destroy(req.file.filename);
      } catch (deleteError) {
        console.error('Error deleting file from Cloudinary:', deleteError);
      }
      
      return res.status(400).json({
        success: false,
        message: `Storage limit exceeded. You have used ${(employee.totalStorageUsed / 1048576).toFixed(2)}MB of 50MB. This file is ${(fileSize / 1048576).toFixed(2)}MB.`
      });
    }

    // Save file information
    const file = await File.create({
      employeeId,
      fileName: req.file.originalname,
      fileUrl: req.file.path,
      fileSize: fileSize,
      fileType: req.file.mimetype,
      cloudinaryPublicId: req.file.filename
    });

    // Update employee's storage usage
    employee.totalStorageUsed += fileSize;
    await employee.save();

    emitToAll('file-uploaded', {
      employeeId,
      file
    });

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      file,
      storageUsed: employee.totalStorageUsed,
      storageLimit
    });
  } catch (error) {
    console.error('Upload error:', error);
    
    // Delete file from Cloudinary if database save fails
    if (req.file && req.file.filename) {
      try {
        await cloudinary.uploader.destroy(req.file.filename);
      } catch (deleteError) {
        console.error('Error deleting file from Cloudinary:', deleteError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error uploading file: ' + error.message
    });
  }
});

// ✅ FIX: Get files with proper error handling
router.get('/files', protectEmployee, async (req, res) => {
  try {
    const employeeId = req.user._id;

    const files = await File.find({ employeeId })
      .sort({ uploadDate: -1 })
      .lean(); // Use lean() for better performance

    const employee = await User.findById(employeeId).select('totalStorageUsed');
    const storageLimit = parseInt(process.env.PER_EMPLOYEE_STORAGE_LIMIT) || 52428800;

    res.json({
      success: true,
      data: {
        files: files || [],
        storageUsed: employee?.totalStorageUsed || 0,
        storageLimit
      }
    });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching files: ' + error.message,
      data: {
        files: [],
        storageUsed: 0,
        storageLimit: 52428800
      }
    });
  }
});

// Delete file
router.delete('/file/:id', protectEmployee, async (req, res) => {
  try {
    const employeeId = req.user._id;
    const fileId = req.params.id;

    const file = await File.findOne({
      _id: fileId,
      employeeId
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(file.cloudinaryPublicId);
    } catch (cloudinaryError) {
      console.error('Cloudinary delete error:', cloudinaryError);
      // Continue even if Cloudinary delete fails
    }

    // Update employee's storage usage
    const employee = await User.findById(employeeId);
    if (employee) {
      employee.totalStorageUsed -= file.fileSize;
      if (employee.totalStorageUsed < 0) employee.totalStorageUsed = 0;
      await employee.save();
    }

    // Delete from database
    await File.deleteOne({ _id: fileId });

    emitToAll('file-deleted', {
      employeeId,
      fileId
    });

    res.json({
      success: true,
      message: 'File deleted successfully',
      storageUsed: employee?.totalStorageUsed || 0
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting file: ' + error.message
    });
  }
});

module.exports = router;

















