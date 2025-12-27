const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const pool = require('../config/database');
const jwtConfig = require('../config/jwt');

const registerStudent = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                errors: errors.array() 
            });
        }

        const {
            full_name,
            roll_number,
            college_email,
            phone_number,
            year,
            branch,
            password
        } = req.body;

        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();

            // Check if email or roll number already exists
            const [existingUsers] = await connection.execute(
                'SELECT id FROM users WHERE email = ? OR roll_number = ?',
                [college_email, roll_number]
            );

            if (existingUsers.length > 0) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Email or Roll Number already exists'
                });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            const [userResult] = await connection.execute(
                'INSERT INTO users (email, roll_number, password, role) VALUES (?, ?, ?, ?)',
                [college_email, roll_number, hashedPassword, 'student']
            );

            // Create student record
            await connection.execute(
                `INSERT INTO students 
                (user_id, full_name, roll_number, college_email, phone_number, year, branch) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [userResult.insertId, full_name, roll_number, college_email, phone_number, year, branch]
            );

            await connection.commit();

            res.status(201).json({
                success: true,
                message: 'Student registered successfully'
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

const login = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        // Determine if identifier is email or roll number
        const isEmail = identifier.includes('@');
        const query = isEmail 
            ? 'SELECT * FROM users WHERE email = ? AND is_active = true'
            : 'SELECT * FROM users WHERE roll_number = ? AND is_active = true';

        const [users] = await pool.execute(query, [identifier]);

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const user = users[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            jwtConfig.secret,
            { expiresIn: jwtConfig.expiresIn }
        );

        // Get additional user info based on role
        let userInfo = { id: user.id, email: user.email, role: user.role };
        
        if (user.role === 'student') {
            const [students] = await pool.execute(
                'SELECT full_name, roll_number, college_email, year, branch FROM students WHERE user_id = ?',
                [user.id]
            );
            if (students.length > 0) {
                userInfo = { ...userInfo, ...students[0] };
            }
        }

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: userInfo
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

const getCurrentUser = async (req, res) => {
    try {
        const user = req.user;

        if (user.role === 'student') {
            const [students] = await pool.execute(
                'SELECT full_name, roll_number, college_email, phone_number, year, branch FROM students WHERE user_id = ?',
                [user.id]
            );
            
            if (students.length > 0) {
                user.details = students[0];
            }
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user data'
        });
    }
};

module.exports = {
    registerStudent,
    login,
    getCurrentUser
};