const { prisma } = require('../prisma');

// Middleware ensure tenant context and access control
// Requires prior auth middleware to have set req.user
const requireTenant = async (req, res, next) => {
    try {
        // Ensure req.user exists (auth middleware should run before this)
        if (!req.user) {
            return res.status(401).json({ error: 'Vui lòng đăng nhập' });
        }

        // Determine requested tenant id: params, body, query, or fallback to user's tenantid
        const candidate = req.params.tenantid || req.body.tenantid || req.query.tenantid;
        let tenantId = candidate ? parseInt(candidate) : undefined;

        // If user is tenant admin and token contains tenantid, prefer that
        if (req.user.role === 'admin' && req.user.tenantid) {
            // If tenantId provided and different from user's tenantid => forbidden
            if (tenantId && tenantId !== req.user.tenantid) {
                return res.status(403).json({ error: 'Không có quyền truy cập tenant này' });
            }
            tenantId = req.user.tenantid;
        }

        // If no tenantId yet (e.g., superadmin may operate without specifying), require it for tenant-scoped routes
        if (!tenantId) {
            return res.status(400).json({ error: 'Thiếu tenant ID' });
        }

        // Verify tenant exists
        const tenant = await prisma.tenants.findUnique({ where: { tenantid: tenantId } });
        if (!tenant) {
            return res.status(404).json({ error: 'Tenant không tồn tại' });
        }

        // Attach tenant info to request
        req.tenant = tenant;
        req.tenantid = tenantId;
        next();
    } catch (error) {
        console.error('requireTenant error:', error);
        res.status(500).json({ error: 'Lỗi server khi kiểm tra tenant' });
    }
};

module.exports = { requireTenant };
