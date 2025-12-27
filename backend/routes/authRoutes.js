const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authenticate = require('../middleware/auth');

// Student registration
router.post('/register/student', [
    body('full_name').notEmpty().trim(),
    body('roll_number').notEmpty().trim(),
    body('college_email').isEmail().normalizeEmail(),
    body('phone_number').isMobilePhone(),
    body('year').isInt({ min: 1, max: 5 }),
    body('branch').notEmpty().trim(),
    body('password').isLength({ min: 6 })
], authController.registerStudent);

// Login for all users
router.post('/login', [
    body('identifier').notEmpty(),
    body('password').notEmpty()
], authController.login);

// Get current user
router.get('/me', authenticate, authController.getCurrentUser);

module.exports = router;