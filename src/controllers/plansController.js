const { prisma } = require('../prisma');
const fs = require('fs');
const path = require('path');

const HIDDEN_PLAN_NAME = 'Hidden Free';
const TEMPLATE_DIR = path.join(__dirname, '..', '..', 'templates', 'html');

function ensureTemplateDir() {
  if (!fs.existsSync(TEMPLATE_DIR)) {
    fs.mkdirSync(TEMPLATE_DIR, { recursive: true });
  }
}

function writePlanHtmlFile(planId, planName, htmlcontent) {
  if (!htmlcontent) return null;
  ensureTemplateDir();
  const safeName = (planName || `plan-${planId}`).toString().replace(/[^a-z0-9-_]/gi, '_');
  const filePath = path.join(TEMPLATE_DIR, `plan-${planId}-${safeName}.html`);
  fs.writeFileSync(filePath, htmlcontent, { encoding: 'utf8' });
  return filePath;
}

const plansController = {
  // Lấy danh sách tất cả plans (bỏ gói ẩn)
  getAllPlans: async (req, res) => {
    try {
      const plans = await prisma.plans.findMany({
        where: { planname: { not: HIDDEN_PLAN_NAME } },
        include: { subscriptions: true, templates: true }
      });
      res.json(plans);
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi lấy danh sách gói' });
    }
  },

  // Lấy plan theo ID
  getPlanById: async (req, res) => {
    try {
      const { id } = req.params;
      const plan = await prisma.plans.findUnique({
        where: { planid: parseInt(id) },
        include: { subscriptions: true, templates: true }
      });

      if (!plan) {
        return res.status(404).json({ error: 'Không tìm thấy gói' });
      }

      res.json(plan);
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi lấy thông tin gói' });
    }
  },

  // Tạo plan mới
  createPlan: async (req, res) => {
    try {
      const { planname, intro, description, price, durationmonths, htmlcontent } = req.body;
      const priceValue = price !== undefined ? parseFloat(price) : undefined;
      const durationValue = durationmonths !== undefined ? parseInt(durationmonths) : undefined;

      const newPlan = await prisma.plans.create({
        data: {
          planname,
          intro,
          description,
          price: priceValue,
          durationmonths: durationValue,
          htmlcontent
        }
      });

      if (htmlcontent) {
        writePlanHtmlFile(newPlan.planid, planname, htmlcontent);
        await prisma.templates.create({
          data: {
            planid: newPlan.planid,
            name: `${planname} Template`,
            description: description || 'Template mặc định của gói',
            htmlcontent
          }
        });
      }

      res.status(201).json(newPlan);
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi tạo gói mới' });
    }
  },

  // Cập nhật plan
  updatePlan: async (req, res) => {
    try {
      const { id } = req.params;
      const { planname, intro, description, price, durationmonths, htmlcontent } = req.body;
      const priceValue = price !== undefined ? parseFloat(price) : undefined;
      const durationValue = durationmonths !== undefined ? parseInt(durationmonths) : undefined;

      const updatedPlan = await prisma.plans.update({
        where: { planid: parseInt(id) },
        data: {
          planname,
          intro,
          description,
          price: priceValue,
          durationmonths: durationValue,
          htmlcontent,
          updatedat: new Date()
        }
      });

      if (htmlcontent) {
        writePlanHtmlFile(updatedPlan.planid, planname || updatedPlan.planname, htmlcontent);
      }

      res.json(updatedPlan);
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi cập nhật gói' });
    }
  },

  // Xóa plan
  deletePlan: async (req, res) => {
    try {
      const { id } = req.params;
      await prisma.plans.delete({ where: { planid: parseInt(id) } });
      res.json({ message: 'Đã xóa gói thành công' });
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi xóa gói' });
    }
  }
};

module.exports = plansController;
