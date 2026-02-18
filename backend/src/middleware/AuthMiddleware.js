const jwt = require('jsonwebtoken');
const User = require('../models/Users/UserSchema');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

/* =========================
   AUTH MIDDLEWARE
========================= */
const AuthMiddleware = async(req, res, next) => {
    try {
        const authHeader = req.header('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided. Authorization denied.'
            });
        }

        const token = authHeader.replace('Bearer ', '');

        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token has expired. Please login again.',
                    code: 'TOKEN_EXPIRED'
                });
            }
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token. Authorization denied.',
                    code: 'INVALID_TOKEN'
                });
            }
            throw error;
        }

        const user = await User.findById(decoded.userId).select('isActive role');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User no longer exists. Please login again.',
                code: 'USER_NOT_FOUND'
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been deactivated. Please contact administrator.',
                code: 'ACCOUNT_DEACTIVATED'
            });
        }

        // ✅ CHANGED: companyId instead of email
        req.user = {
            userId: decoded.userId,
            companyId: decoded.companyId,
            role: decoded.role,
            name: decoded.name
        };

        next();

    } catch (error) {
        console.error('❌ Auth Middleware Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication error. Please try again.'
        });
    }
};

/* =========================
   ROLE MIDDLEWARE
========================= */
const RoleMiddleware = (...allowedRoles) => {
    return async(req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required',
                    code: 'AUTH_REQUIRED'
                });
            }

            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Insufficient permissions.',
                    code: 'INSUFFICIENT_PERMISSIONS',
                    requiredRoles: allowedRoles,
                    userRole: req.user.role
                });
            }

            next();

        } catch (error) {
            console.error('❌ Role Middleware Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Authorization error. Please try again.'
            });
        }
    };
};

/* =========================
   MODULE MIDDLEWARE
========================= */
const ModuleMiddleware = (requiredModule) => {
    return async(req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required',
                    code: 'AUTH_REQUIRED'
                });
            }

            const user = await User.findById(req.user.userId).populate('role');

            if (!user || !user.role) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Invalid user role.',
                    code: 'INVALID_ROLE'
                });
            }

            if (user.role.name === 'admin') return next();

            if (!user.role.modules || !user.role.modules.includes(requiredModule)) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. You don't have permission to access ${requiredModule} module.`,
                    code: 'MODULE_ACCESS_DENIED',
                    requiredModule,
                    userModules: user.role.modules
                });
            }

            next();

        } catch (error) {
            console.error('❌ Module Middleware Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Authorization error. Please try again.'
            });
        }
    };
};

/* =========================
   RATE LIMIT MIDDLEWARE
========================= */
const loginAttempts = new Map();

const RateLimitMiddleware = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
    return (req, res, next) => {
        const identifier = req.ip || req.connection.remoteAddress;
        const now = Date.now();

        if (!loginAttempts.has(identifier)) loginAttempts.set(identifier, []);

        const attempts = loginAttempts.get(identifier);
        const recentAttempts = attempts.filter(t => now - t < windowMs);
        loginAttempts.set(identifier, recentAttempts);

        if (recentAttempts.length >= maxAttempts) {
            const oldestAttempt = Math.min(...recentAttempts);
            const timeLeft = Math.ceil((windowMs - (now - oldestAttempt)) / 1000 / 60);
            return res.status(429).json({
                success: false,
                message: `Too many attempts. Please try again in ${timeLeft} minutes.`,
                code: 'RATE_LIMIT_EXCEEDED'
            });
        }

        recentAttempts.push(now);
        loginAttempts.set(identifier, recentAttempts);
        next();
    };
};

/* =========================
   SANITIZE INPUT MIDDLEWARE
========================= */
const SanitizeInputMiddleware = (req, res, next) => {
    const sanitize = (obj) => {
        if (typeof obj === 'string') return obj.replace(/[<>]/g, '').trim();
        if (typeof obj === 'object' && obj !== null) {
            for (let key in obj) obj[key] = sanitize(obj[key]);
        }
        return obj;
    };

    if (req.body) req.body = sanitize(req.body);
    if (req.query) req.query = sanitize(req.query);
    if (req.params) req.params = sanitize(req.params);

    next();
};

module.exports = {
    AuthMiddleware,
    RoleMiddleware,
    ModuleMiddleware,
    RateLimitMiddleware,
    SanitizeInputMiddleware
};