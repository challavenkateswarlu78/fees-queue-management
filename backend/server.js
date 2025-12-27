const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// CORS Configuration - Allow both localhost:3000 and localhost:3001
const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight for all routes

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',  // Add your MySQL password if you have one
    database: 'fees_queue_management'
});

db.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        console.log('⚠️  Continuing without database connection for now...');
    } else {
        console.log('✅ Connected to MySQL database');
    }
});

const JWT_SECRET = 'your-jwt-secret-key-change-this-in-production';

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Backend server is running',
        timestamp: new Date().toISOString(),
        cors: 'Enabled for localhost:3000 and localhost:3001'
    });
});

// Test database connection
app.get('/api/test-db', (req, res) => {
    db.query('SELECT 1 + 1 AS solution', (err, results) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'Database connection failed',
                error: err.message 
            });
        }
        res.json({ 
            success: true, 
            message: 'Database connection successful',
            data: results 
        });
    });
});

// List all users (for debugging)
app.get('/api/debug/users', (req, res) => {
    db.query('SELECT id, email, roll_number, role FROM users', (err, results) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'Database error',
                error: err.message 
            });
        }
        res.json({ 
            success: true, 
            users: results 
        });
    });
});

// Student Registration
app.post('/api/auth/register/student', async (req, res) => {
    try {
        console.log('📝 Registration request received:', req.body);
        
        const {
            full_name,
            roll_number,
            college_email,
            phone_number,
            year,
            branch,
            password
        } = req.body;

        // Validation
        if (!full_name || !roll_number || !college_email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'All required fields must be filled' 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Start transaction
        db.beginTransaction((err) => {
            if (err) {
                console.error('Transaction error:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Transaction failed' 
                });
            }

            // Insert into users table
            const userQuery = 'INSERT INTO users (email, roll_number, password, role) VALUES (?, ?, ?, ?)';
            db.query(userQuery, [college_email, roll_number, hashedPassword, 'student'], (err, userResult) => {
                if (err) {
                    return db.rollback(() => {
                        console.error('User insert error:', err);
                        if (err.code === 'ER_DUP_ENTRY') {
                            return res.status(400).json({ 
                                success: false, 
                                message: 'Email or Roll Number already exists' 
                            });
                        }
                        res.status(500).json({ 
                            success: false, 
                            message: 'Failed to create user account' 
                        });
                    });
                }

                const userId = userResult.insertId;

                // Insert into students table
                const studentQuery = `
                    INSERT INTO students 
                    (user_id, full_name, roll_number, college_email, phone_number, year, branch) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `;
                
                db.query(studentQuery, [
                    userId, full_name, roll_number, college_email, 
                    phone_number, year, branch
                ], (err) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error('Student insert error:', err);
                            res.status(500).json({ 
                                success: false, 
                                message: 'Failed to create student profile' 
                            });
                        });
                    }

                    // Commit transaction
                    db.commit((err) => {
                        if (err) {
                            return db.rollback(() => {
                                res.status(500).json({ 
                                    success: false, 
                                    message: 'Transaction commit failed' 
                                });
                            });
                        }

                        console.log('✅ Student registered successfully:', college_email);
                        res.status(201).json({
                            success: true,
                            message: 'Student registered successfully'
                        });
                    });
                });
            });
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
    try {
        const { identifier, password } = req.body;
        console.log('🔑 Login attempt for:', identifier);

        if (!identifier || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email/Roll Number and password are required' 
            });
        }

        // Determine query based on identifier
        let query, params;
        if (identifier.includes('@')) {
            query = 'SELECT * FROM users WHERE email = ?';
            params = [identifier];
        } else {
            query = 'SELECT * FROM users WHERE roll_number = ?';
            params = [identifier];
        }

        db.query(query, params, async (err, users) => {
            if (err) {
                console.error('Login query error:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Database error' 
                });
            }

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
                { 
                    userId: user.id, 
                    email: user.email, 
                    role: user.role,
                    roll_number: user.roll_number 
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Prepare user info
            let userInfo = { 
                id: user.id, 
                email: user.email, 
                role: user.role,
                roll_number: user.roll_number
            };

            // Get student details if role is student
            if (user.role === 'student') {
                const studentQuery = 'SELECT full_name, college_email, phone_number, year, branch FROM students WHERE user_id = ?';
                db.query(studentQuery, [user.id], (err, students) => {
                    if (err) {
                        console.error('Student details error:', err);
                        // Still return success but log the error
                    }
                    
                    if (students && students.length > 0) {
                        userInfo.details = students[0];
                    }

                    console.log('✅ Login successful for:', user.email);
                    res.json({
                        success: true,
                        message: 'Login successful',
                        token,
                        user: userInfo
                    });
                });
            } else {
                console.log('✅ Login successful for:', user.email);
                res.json({
                    success: true,
                    message: 'Login successful',
                    token,
                    user: userInfo
                });
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Get current user
app.get('/api/auth/me', (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'No token provided' 
            });
        }

        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Invalid token' 
                });
            }

            db.query('SELECT id, email, role, roll_number FROM users WHERE id = ?', 
            [decoded.userId], (err, users) => {
                if (err || users.length === 0) {
                    return res.status(404).json({ 
                        success: false, 
                        message: 'User not found' 
                    });
                }

                const user = users[0];
                
                if (user.role === 'student') {
                    db.query(
                        'SELECT full_name, college_email, phone_number, year, branch FROM students WHERE user_id = ?',
                        [user.id],
                        (err, students) => {
                            if (err) {
                                return res.status(500).json({ 
                                    success: false, 
                                    message: 'Error fetching student details' 
                                });
                            }

                            if (students.length > 0) {
                                user.details = students[0];
                            }

                            res.json({
                                success: true,
                                user
                            });
                        }
                    );
                } else {
                    res.json({
                        success: true,
                        user
                    });
                }
            });
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Backend server running on port ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔗 Test DB: http://localhost:${PORT}/api/test-db`);
    console.log(`🔗 Debug users: http://localhost:${PORT}/api/debug/users`);
    console.log(`✅ CORS enabled for: localhost:3000, localhost:3001`);
});

// Student Dashboard APIs

// Get student dashboard data
app.get('/api/student/dashboard', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        // Get student details
        const studentQuery = `
            SELECT s.*, u.email 
            FROM students s 
            JOIN users u ON s.user_id = u.id 
            WHERE s.user_id = ?
        `;

        db.query(studentQuery, [req.user.id], (err, students) => {
            if (err || students.length === 0) {
                return res.status(404).json({ success: false, message: 'Student not found' });
            }

            const student = students[0];

            // Get payment statistics
            const statsQuery = `
                SELECT 
                    COUNT(*) as total_payments,
                    SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as paid_amount,
                    SUM(CASE WHEN status IN ('pending', 'processing') THEN amount ELSE 0 END) as pending_amount,
                    MIN(CASE WHEN status IN ('pending', 'processing') THEN queue_position ELSE NULL END) as queue_position
                FROM payments 
                WHERE student_id = ?
            `;

            db.query(statsQuery, [student.id], (err, stats) => {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Database error' });
                }

                // Get recent payments
                const paymentsQuery = `
                    SELECT p.*, c.counter_name, ft.type_name as fee_type
                    FROM payments p
                    JOIN counters c ON p.counter_id = c.id
                    JOIN fee_types ft ON p.fee_type_id = ft.id
                    WHERE p.student_id = ?
                    ORDER BY p.transaction_date DESC
                    LIMIT 5
                `;

                db.query(paymentsQuery, [student.id], (err, payments) => {
                    if (err) {
                        return res.status(500).json({ success: false, message: 'Database error' });
                    }

                    res.json({
                        success: true,
                        data: {
                            student: {
                                id: student.id,
                                full_name: student.full_name,
                                roll_number: student.roll_number,
                                college_email: student.college_email,
                                phone_number: student.phone_number,
                                year: student.year,
                                branch: student.branch,
                                photo_url: student.photo_url
                            },
                            stats: {
                                total_due: 50000, // Should come from fee structure
                                paid_amount: stats[0].paid_amount || 0,
                                pending_amount: stats[0].pending_amount || 0,
                                queue_position: stats[0].queue_position || 0
                            },
                            recent_payments: payments
                        }
                    });
                });
            });
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Create payment request
app.post('/api/student/payments', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const { counter_id, fee_type_id, amount, description } = req.body;

        // Validate input
        if (!counter_id || !fee_type_id || !amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid payment data' });
        }

        // Get student ID
        db.query('SELECT id FROM students WHERE user_id = ?', [req.user.id], (err, students) => {
            if (err || students.length === 0) {
                return res.status(404).json({ success: false, message: 'Student not found' });
            }

            const studentId = students[0].id;

            // Generate unique token
            const tokenNumber = 'TKN' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000).toString().padStart(3, '0');

            // Get queue position
            db.query('SELECT COUNT(*) as count FROM payments WHERE counter_id = ? AND status IN ("pending", "processing")', 
            [counter_id], (err, result) => {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Database error' });
                }

                const queuePosition = result[0].count + 1;

                // Insert payment
                const insertQuery = `
                    INSERT INTO payments 
                    (student_id, token_number, counter_id, fee_type_id, amount, queue_position, description)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `;

                db.query(insertQuery, [
                    studentId,
                    tokenNumber,
                    counter_id,
                    fee_type_id,
                    amount,
                    queuePosition,
                    description || null
                ], (err, result) => {
                    if (err) {
                        return res.status(500).json({ success: false, message: 'Failed to create payment' });
                    }

                    res.status(201).json({
                        success: true,
                        message: 'Payment request created',
                        data: {
                            payment_id: result.insertId,
                            token_number: tokenNumber,
                            queue_position: queuePosition
                        }
                    });
                });
            });
        });
    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get queue status
app.get('/api/student/payments/queue', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        db.query('SELECT id FROM students WHERE user_id = ?', [req.user.id], (err, students) => {
            if (err || students.length === 0) {
                return res.status(404).json({ success: false, message: 'Student not found' });
            }

            const studentId = students[0].id;

            const query = `
                SELECT 
                    p.*,
                    c.counter_name,
                    c.counter_number,
                    ft.type_name as fee_type,
                    u.full_name as processed_by
                FROM payments p
                JOIN counters c ON p.counter_id = c.id
                JOIN fee_types ft ON p.fee_type_id = ft.id
                LEFT JOIN users u ON p.assigned_to = u.id
                WHERE p.student_id = ?
                ORDER BY p.transaction_date DESC
            `;

            db.query(query, [studentId], (err, payments) => {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Database error' });
                }

                res.json({
                    success: true,
                    data: payments
                });
            });
        });
    } catch (error) {
        console.error('Queue error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update student profile
app.put('/api/student/profile', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const { full_name, email, phone, year, branch, current_password, new_password } = req.body;

        db.query('SELECT id FROM students WHERE user_id = ?', [req.user.id], (err, students) => {
            if (err || students.length === 0) {
                return res.status(404).json({ success: false, message: 'Student not found' });
            }

            const studentId = students[0].id;

            // Update student table
            const updateStudent = `
                UPDATE students 
                SET full_name = ?, phone_number = ?, year = ?, branch = ?
                WHERE id = ?
            `;

            db.query(updateStudent, [full_name, phone, year, branch, studentId], (err) => {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Failed to update profile' });
                }

                // Update users table email
                const updateUser = 'UPDATE users SET email = ? WHERE id = ?';
                db.query(updateUser, [email, req.user.id], async (err) => {
                    if (err) {
                        return res.status(500).json({ success: false, message: 'Failed to update email' });
                    }

                    // Update password if provided
                    if (current_password && new_password) {
                        // Verify current password
                        const verifyQuery = 'SELECT password FROM users WHERE id = ?';
                        db.query(verifyQuery, [req.user.id], async (err, users) => {
                            if (err || users.length === 0) {
                                return res.status(400).json({ success: false, message: 'Invalid current password' });
                            }

                            const isValid = await bcrypt.compare(current_password, users[0].password);
                            if (!isValid) {
                                return res.status(400).json({ success: false, message: 'Invalid current password' });
                            }

                            // Hash new password
                            const hashedPassword = await bcrypt.hash(new_password, 10);
                            
                            db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id], (err) => {
                                if (err) {
                                    return res.status(500).json({ success: false, message: 'Failed to update password' });
                                }

                                res.json({ success: true, message: 'Profile updated successfully' });
                            });
                        });
                    } else {
                        res.json({ success: true, message: 'Profile updated successfully' });
                    }
                });
            });
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});