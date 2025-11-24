const { prisma } = require('../prisma');

const subscriptionsController = {
  // Lấy danh sách tất cả subscriptions
  getAllSubscriptions: async (req, res) => {
    try {
      const subscriptions = await prisma.subscriptions.findMany({
        include: {
          tenant: true,
          plan: true,
          logs: true,
        },
      });
      res.json(subscriptions);
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi lấy danh sách subscriptions' });
    }
  },

  // Lấy subscription theo ID
  getSubscriptionById: async (req, res) => {
    try {
      const { id } = req.params;
      const subscription = await prisma.subscriptions.findUnique({
        where: { subscriptionid: parseInt(id) },
        include: {
          tenant: true,
          plan: true,
          logs: true,
        },
      });

      if (!subscription) {
        return res.status(404).json({ error: 'Không tìm thấy subscription' });
      }

      res.json(subscription);
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi lấy thông tin subscription' });
    }
  },

  // Tạo subscription mới (dùng cho superadmin hoặc dịch vụ)
  createSubscription: async (req, res) => {
    try {
      const { tenantid, planid, startdate, enddate, status } = req.body;

      const plan = await prisma.plans.findUnique({ where: { planid: parseInt(planid) } });
      if (!plan) {
        return res.status(400).json({ error: 'Plan không tìm thấy' });
      }

      const start = startdate ? new Date(startdate) : new Date();
      const end = enddate
        ? new Date(enddate)
        : (() => {
            const tmp = new Date(start);
            tmp.setMonth(tmp.getMonth() + (plan.durationmonths || 1));
            return tmp;
          })();

      const newSubscription = await prisma.subscriptions.create({
        data: {
          tenantid: parseInt(tenantid),
          planid: plan.planid,
          startdate: start,
          enddate: end,
          status: status || 'active',
        },
      });

      res.status(201).json(newSubscription);
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi tạo subscription mới' });
    }
  },

  // Tenant admin tự đăng ký thêm gói cho tenant hiện tại
  createForTenantSelf: async (req, res) => {
    try {
      const tenantid = req.user?.tenantid;
      const { planid } = req.body;
      if (!tenantid) return res.status(400).json({ error: 'Thiếu tenantid' });
      if (!planid) return res.status(400).json({ error: 'Thiếu planid' });

      const plan = await prisma.plans.findUnique({ where: { planid: parseInt(planid) } });
      if (!plan) return res.status(404).json({ error: 'Plan không tồn tại' });

      const start = new Date();
      const end = new Date(start);
      end.setMonth(start.getMonth() + (plan.durationmonths || 1));

      const newSubscription = await prisma.subscriptions.create({
        data: {
          tenantid: tenantid,
          planid: plan.planid,
          startdate: start,
          enddate: end,
          status: 'active',
        },
      });

      return res.status(201).json(newSubscription);
    } catch (error) {
      console.error('Lỗi tạo subscription (self):', error);
      res.status(500).json({ error: 'Lỗi khi tạo subscription' });
    }
  },

  // Cập nhật subscription
  updateSubscription: async (req, res) => {
    try {
      const { id } = req.params;
      const { startdate, enddate, status } = req.body;

      const updatedSubscription = await prisma.subscriptions.update({
        where: { subscriptionid: parseInt(id) },
        data: {
          startdate: startdate ? new Date(startdate) : undefined,
          enddate: enddate ? new Date(enddate) : undefined,
          status,
          updatedat: new Date(),
        },
      });

      res.json(updatedSubscription);
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi cập nhật subscription' });
    }
  },

  // Xóa subscription
  deleteSubscription: async (req, res) => {
    try {
      const { id } = req.params;
      await prisma.subscriptions.delete({
        where: { subscriptionid: parseInt(id) },
      });

      res.json({ message: 'Đã xóa subscription thành công' });
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi xóa subscription' });
    }
  },
};

module.exports = subscriptionsController;
