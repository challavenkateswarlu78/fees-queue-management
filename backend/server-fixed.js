const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// ===== CORS FIX =====
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== DATABASE CONNECTION =====
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'venkat@78',
    database: 'fees_queue_management'
});

db.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        console.log('⚠️  Make sure:');
        console.log('   1. MySQL is running (XAMPP/WAMP/MAMP)');
        console.log('   2. Database exists: CREATE DATABASE fees_queue_management;');
        console.log('   3. Password is correct');
    } else {
        console.log('✅ Connected to MySQL database');
        createTablesIfNeeded();
    }
});

const JWT_SECRET = 'your-secret-key';

// ===== HEALTH CHECK =====
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Backend is running!',
        timestamp: new Date().toISOString()
    });
});

// ===== CREATE TABLES =====
const createTablesIfNeeded = () => {
    const queries = [
        `CREATE TABLE IF NOT EXISTS users (
            id INT PRIMARY KEY AUTO_INCREMENT,
            email VARCHAR(100) UNIQUE NOT NULL,
            roll_number VARCHAR(50) UNIQUE,
            password VARCHAR(255) NOT NULL,
            role ENUM('student', 'admin', 'accountant') DEFAULT 'student',
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS students (
            id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT UNIQUE NOT NULL,
            full_name VARCHAR(100) NOT NULL,
            roll_number VARCHAR(50) UNIQUE NOT NULL,
            college_email VARCHAR(100) UNIQUE NOT NULL,
            phone_number VARCHAR(15) NOT NULL,
            year INT NOT NULL,
            branch VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`
    ];

    queries.forEach((query, index) => {
        db.query(query, (err) => {
            if (err) {
                console.error(`Error creating table ${index + 1}:`, err.message);
            }
        });
    });

    // Create default admin
    const adminPassword = bcrypt.hashSync('admin123', 10);
    db.query(
        `INSERT IGNORE INTO users (email, password, role) VALUES (?, ?, ?)`,
        ['admin@college.edu', adminPassword, 'admin'],
        (err) => {
            if (err) console.error('Admin creation error:', err.message);
            else console.log('✅ Default admin: admin@college.edu / admin123');
        }
    );
    
    // Create default accountant
    db.query(
        `INSERT IGNORE INTO users (email, password, role) VALUES (?, ?, ?)`,
        ['accountant@college.edu', adminPassword, 'accountant'],
        (err) => {
            if (err) console.error('Accountant creation error:', err.message);
            else console.log('✅ Default accountant: accountant@college.edu / admin123');
        }
    );
};

// ===== DEBUG ENDPOINTS =====
app.get('/api/debug/users', (req, res) => {
    db.query('SELECT id, email, roll_number, role, created_at FROM users', (err, results) => {
        if (err) {
            console.error('Debug users error:', err.message);
            return res.status(500).json({ 
                success: false, 
                error: err.message 
            });
        }
        res.json({
            success: true,
            count: results.length,
            users: results
        });
    });
});

app.get('/api/debug/students', (req, res) => {
    db.query('SELECT * FROM students', (err, results) => {
        if (err) {
            console.error('Debug students error:', err.message);
            return res.status(500).json({ 
                success: false, 
                error: err.message 
            });
        }
        res.json({
            success: true,
            count: results.length,
            students: results
        });
    });
});

app.get('/api/debug/create-tables', (req, res) => {
    createTablesIfNeeded();
    res.json({
        success: true,
        message: 'Tables creation initiated'
    });
});

// ===== REGISTRATION =====
app.post('/api/auth/register/student', async (req, res) => {
    try {
        console.log('📝 Registration request:', req.body);
        
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

        // Check if email or roll number exists
        const checkQuery = 'SELECT id FROM users WHERE email = ? OR roll_number = ?';
        db.query(checkQuery, [college_email, roll_number], (err, results) => {
            if (err) {
                console.error('Check query error:', err.message);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Database error' 
                });
            }

            if (results.length > 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Email or Roll Number already exists' 
                });
            }

            // Insert into users table
            const userQuery = 'INSERT INTO users (email, roll_number, password, role) VALUES (?, ?, ?, ?)';
            db.query(userQuery, [college_email, roll_number, hashedPassword, 'student'], (err, userResult) => {
                if (err) {
                    console.error('User insert error:', err.message);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Failed to create user' 
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
                        console.error('Student insert error:', err.message);
                        // Rollback
                        db.query('DELETE FROM users WHERE id = ?', [userId]);
                        return res.status(500).json({ 
                            success: false, 
                            message: 'Failed to create student' 
                        });
                    }

                    console.log('✅ Student registered:', college_email);
                    res.status(201).json({
                        success: true,
                        message: 'Student registered successfully'
                    });
                });
            });
        });

    } catch (error) {
        console.error('Registration error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});


// ===== LOGIN =====
app.post('/api/auth/login', async (req, res) => {
    try {
        const { identifier, password } = req.body;
        console.log('🔑 Login attempt for:', identifier);

        if (!identifier || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email/Roll Number and password required' 
            });
        }

        // Determine query
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
                console.error('Login query error:', err.message);
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

            // Generate token
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

            // User info
            let userInfo = { 
                id: user.id, 
                email: user.email, 
                role: user.role,
                roll_number: user.roll_number
            };

            // Get student details
            if (user.role === 'student') {
                const studentQuery = 'SELECT full_name, college_email, phone_number, year, branch FROM students WHERE user_id = ?';
                db.query(studentQuery, [user.id], (err, students) => {
                    if (err) {
                        console.error('Student details error:', err.message);
                    } else if (students.length > 0) {
                        userInfo.details = students[0];
                    }

                    console.log('✅ Login successful:', user.email);
                    res.json({
                        success: true,
                        message: 'Login successful',
                        token,
                        user: userInfo
                    });
                });
            } else {
                console.log('✅ Login successful:', user.email);
                res.json({
                    success: true,
                    message: 'Login successful',
                    token,
                    user: userInfo
                });
            }
        });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// ===== CURRENT USER =====
// ===== GET CURRENT USER =====
app.get('/api/auth/me', (req, res) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false, 
                message: 'No token provided' 
            });
        }

        const token = authHeader.split(' ')[1];
        
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Get user from database (without password)
        const query = 'SELECT id, email, roll_number, role FROM users WHERE id = ?';
        db.query(query, [decoded.userId], (err, results) => {
            if (err) {
                console.error('Get user error:', err.message);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Database error' 
                });
            }
            
            if (results.length === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'User not found' 
                });
            }
            
            const user = results[0];
            let userInfo = { ...user };
            
            // Get student details if student
            if (user.role === 'student') {
                const studentQuery = 'SELECT full_name, college_email, phone_number, year, branch FROM students WHERE user_id = ?';
                db.query(studentQuery, [user.id], (err, students) => {
                    if (err) {
                        console.error('Student details error:', err.message);
                    } else if (students.length > 0) {
                        userInfo.details = students[0];
                    }
                    
                    res.json({
                        success: true,
                        user: userInfo
                    });
                });
            } else {
                res.json({
                    success: true,
                    user: userInfo
                });
            }
        });
        
    } catch (error) {
        console.error('Auth/me error:', error.message);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token' 
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Token expired' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

const PORT = 5001;

app.listen(PORT, () => {
    console.log(`🚀 Backend running on port ${PORT}`);
    console.log(`🔗 Health: http://localhost:${PORT}/api/health`);
    console.log(`🔗 Debug users: http://localhost:${PORT}/api/debug/users`);
    console.log(`🔗 Create tables: http://localhost:${PORT}/api/debug/create-tables`);
    console.log(`✅ CORS: Enabled for ALL origins`);
});