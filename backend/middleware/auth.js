const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const pool = require('../config/database');

const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required' 
            });
        }

        const decoded = jwt.verify(token, jwtConfig.secret);
        
        // Check if user still exists
        const [users] = await pool.execute(
            'SELECT id, email, role, is_active FROM users WHERE id = ?',
            [decoded.userId]
        );

        if (users.length === 0 || !users[0].is_active) {
            return res.status(401).json({ 
                success: false, 
                message: 'User not found or inactive' 
            });
        }

        req.user = users[0];
        next();
    } catch (error) {
        return res.status(401).json({ 
            success: false, 
            message: 'Invalid token' 
        });
    }
};

module.exports = authenticate;