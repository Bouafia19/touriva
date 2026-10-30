/**
 * Touriva Agency Verification Middleware
 * Enforces that agency-restricted operations can only be performed by:
 * 1. Administrators
 * 2. Partners with typeAccount === 'touristAgencies' whose fileStatus === 'confirmed'
 *
 * Rejects:
 * - Unauthenticated requests (401)
 * - Users with non-partner role (403)
 * - Users with non-agency account type (403)
 * - Pending, rejected, or unsubmitted agencies (403 with detailed verification status)
 */
const requireAgencyVerified = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authorization token required' })
    }

    // Administrators bypass verification checks
    if (req.user.role === 'administrator') {
        return next()
    }

    // Must be a partner
    if (req.user.role !== 'partner') {
        return res.status(403).json({
            error: 'Access forbidden: Partner account required',
            currentRole: req.user.role
        })
    }

    // Must be a tourist agency
    if (req.user.typeAccount !== 'touristAgencies') {
        return res.status(403).json({
            error: 'Access forbidden: Tourism agency account required',
            typeAccount: req.user.typeAccount
        })
    }

    // Must be verified (fileStatus: 'confirmed')
    if (req.user.fileStatus !== 'confirmed') {
        const fileStatus = req.user.fileStatus || 'created'
        if (fileStatus === 'pending') {
            return res.status(403).json({
                error: 'Access forbidden: Agency verification is pending administrator review',
                fileStatus: 'pending'
            })
        }
        if (fileStatus === 'rejected') {
            return res.status(403).json({
                error: 'Access forbidden: Agency accreditation documents were rejected',
                fileStatus: 'rejected',
                rejectionReason: req.user.rejectionReason || null
            })
        }
        return res.status(403).json({
            error: 'Access forbidden: Agency accreditation documents must be uploaded and confirmed',
            fileStatus: fileStatus
        })
    }

    next()
}

module.exports = requireAgencyVerified
