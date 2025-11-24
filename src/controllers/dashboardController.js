const { prisma } = require('../prisma');

const HIDDEN_PLAN_NAME = 'Hidden Free';

const dashboardController = {
    // Get dashboard statistics
    getDashboardStats: async (req, res) => {
        try {
            const now = new Date();
            
            // 1. Lấy đầy đủ tenants/subscriptions để lọc bỏ gói free
            const [tenantsFull, subscriptionsFull, recentSubscriptions] = await Promise.all([
                prisma.tenants.findMany({
                    include: {
                        subscriptions: { include: { plan: true } }
                    }
                }),
                prisma.subscriptions.findMany({
                    include: { plan: true }
                }),
                prisma.subscriptions.findMany({
                    take: 5,
                    orderBy: { createdat: 'desc' },
                    include: {
                        tenant: true,
                        plan: true
                    }
                })
            ]);

            // Tenants: loại bỏ tenant có subscription gói free/ẩn
            const filteredTenants = tenantsFull.filter(t => {
                const subs = t.subscriptions || [];
                return !subs.some(sub => sub.plan?.planname === HIDDEN_PLAN_NAME);
            });
            const totalTenants = filteredTenants.length;
            const activeTenants = filteredTenants.filter(t => t.status === 'active').length;

            // Subscriptions: loại bỏ gói free/ẩn
            const filteredSubscriptions = subscriptionsFull.filter(
                (s) => s.plan?.planname !== HIDDEN_PLAN_NAME
            );
            const totalSubscriptions = filteredSubscriptions.length;

            // 2. Lấy tất cả các Gói (Subscriptions) đang hoạt động để tính toán
            const activeSubscriptionsRaw = await prisma.subscriptions.findMany({
                where: {
                    status: 'active',
                    enddate: { gte: now } // Vẫn còn hạn
                },
                include: { plan: true }
            });

            // Lọc bỏ gói ẩn (free)
            const activeSubscriptions = activeSubscriptionsRaw.filter(
                (sub) => sub.plan?.planname !== HIDDEN_PLAN_NAME
            );

            const activeSubscriptionsCount = activeSubscriptions.length;

            // 3. TÍNH TOÁN DỮ LIỆU CHO BIỂU ĐỒ

            // 3a. Tổng doanh thu (từ các gói active)
            const totalRevenue = activeSubscriptions.reduce((acc, sub) => {
                const price = sub.plan?.price ? Number(sub.plan.price) : 0;
                return acc + price;
            }, 0);

            // 3b. Dữ liệu ĐỒ THỊ NGANG (Doanh thu theo Gói)
            const revenueByPlan = activeSubscriptions.reduce((acc, sub) => {
                const planName = sub.plan?.planname || 'Gói không rõ';
                const price = sub.plan?.price ? Number(sub.plan.price) : 0;
                
                if (!acc[planName]) {
                    acc[planName] = { name: planName, 'Doanh thu': 0 };
                }
                acc[planName]['Doanh thu'] += price;
                return acc;
            }, {});

            // 3b-2. Dữ liệu doanh thu theo ngày (line chart)
            const revenueByDateMap = activeSubscriptions.reduce((acc, sub) => {
                const dateKey = sub.startdate
                    ? new Date(sub.startdate).toISOString().slice(0, 10)
                    : new Date(sub.createdat).toISOString().slice(0, 10);
                const price = sub.plan?.price ? Number(sub.plan.price) : 0;
                if (!acc[dateKey]) acc[dateKey] = 0;
                acc[dateKey] += price;
                return acc;
            }, {});
            const revenueByDate = Object.entries(revenueByDateMap)
                .map(([date, value]) => ({ date, value }))
                .sort((a, b) => a.date.localeCompare(b.date));

            // 3c. Dữ liệu ĐỒ THỊ TRÒN (Phân bổ Tenant theo Gói)
            const tenantsByPlan = activeSubscriptions.reduce((acc, sub) => {
                const planName = sub.plan?.planname || 'Gói không rõ';
                
                if (!acc[planName]) {
                    acc[planName] = { name: planName, value: 0 }; // 'value' là key cho PieChart
                }
                acc[planName].value += 1; // Đếm số lượng tenant (subscription)
                return acc;
            }, {});


            // 4. Format hoạt động gần đây
            const formattedActivities = recentSubscriptions.map(sub => ({
                id: sub.subscriptionid,
                type: 'subscription',
                message: `${sub.tenant?.tenantname ?? 'Tenant không rõ'} đã đăng ký gói ${sub.plan?.planname ?? 'không rõ'}`,
                time: sub.createdat
            }));

            // 5. Trả về dữ liệu
            res.json({
                stats: {
                    totalTenants,
                    activeTenants,
                    totalSubscriptions,
                    activeSubscriptions: activeSubscriptionsCount, // Gửi con số chính xác
                    totalRevenue,
                    // Gửi mảng dữ liệu đã xử lý cho Recharts
                    revenueByPlan: Object.values(revenueByPlan), 
                    revenueByDate,
                    tenantsByPlan: Object.values(tenantsByPlan) 
                },
                recentActivities: formattedActivities
            });
        } catch (error) {
            console.error('Lỗi Dashboard Stats:', error);
            res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
        }
    }
};

module.exports = dashboardController;
