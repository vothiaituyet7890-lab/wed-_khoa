const jwt = require('jsonwebtoken');
const { prisma } = require('../prisma');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

/**
 * Middleware xác thực và cung cấp context cho request
 * - Kiểm tra và verify JWT token
 * - Attach user info vào req.user
 * - Nếu là tenant user, attach tenant info vào req.tenant
 */
const auth = async (req, res, next) => {
    try {
        // Lấy token từ header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            throw new Error('Token không tồn tại');
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Attach decoded user vào request
        req.user = decoded;

        // Nếu là tenant user, attach thêm tenant info
        if (decoded.tenantid) {
            const tenant = await prisma.tenants.findUnique({
                where: { tenantid: decoded.tenantid },
                select: {
                    tenantid: true,
                    tenantname: true,
                    domain: true,
                    status: true,
                    // Thêm các field khác nếu cần
                }
            });

            // Kiểm tra tenant tồn tại và active
            if (!tenant || tenant.status !== 'active') {
                throw new Error('Tenant không hợp lệ hoặc không hoạt động');
            }

            // Attach tenant vào request
            req.tenant = tenant;
        }

        next();
    } catch (error) {
        res.status(401).json({ 
            error: 'Xác thực thất bại',
            message: error.message
        });
    }
};

/**
 * Middleware kiểm tra role superadmin
 */
const requireSuperAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'superadmin') {
        return res.status(403).json({ 
            error: 'Không có quyền truy cập',
            message: 'Chức năng này chỉ dành cho Super Admin' 
        });
    }
    next();
};

/**
 * Middleware kiểm tra quyền tenant admin
 */
const requireTenantAdmin = (req, res, next) => {
    if (!req.user || !req.tenant || req.user.role !== 'admin') {
        return res.status(403).json({ 
            error: 'Không có quyền truy cập',
            message: 'Chức năng này chỉ dành cho Tenant Admin' 
        });
    }
    next();
};

/**
 * Middleware kiểm tra tenant subscription
 */
const checkSubscription = async (req, res, next) => {
    if (!req.tenant) return next();

    try {
        const subscription = await prisma.subscriptions.findFirst({
            where: {
                tenantid: req.tenant.tenantid,
                status: 'active',
                enddate: {
                    gt: new Date()
                }
            },
            include: {
                plan: true
            }
        });

        if (!subscription) {
            return res.status(402).json({
                error: 'Subscription required',
                message: 'Vui lòng đăng ký gói dịch vụ để tiếp tục sử dụng'
            });
        }

        // Attach subscription info vào request
        req.subscription = subscription;
        next();
    } catch (error) {
        res.status(500).json({ 
            error: 'Lỗi kiểm tra subscription',
            message: error.message 
        });
    }
};

module.exports = {
    JWT_SECRET,
    auth,
    requireSuperAdmin,
    requireTenantAdmin,
    checkSubscription
};