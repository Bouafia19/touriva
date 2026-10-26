/**
 * Touriva Role-Based Access Control (RBAC) Middleware
 * Enforces role restrictions on protected endpoints.
 * Requires requireAuth to have run first (populating req.user).
 */
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authorization token required' })
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Access forbidden: Insufficient permissions',
                requiredRoles: allowedRoles,
                currentRole: req.user.role
            })
        }

        next()
    }
}

module.exports = requireRole
