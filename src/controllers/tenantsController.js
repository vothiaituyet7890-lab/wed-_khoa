const { Prisma } = require("@prisma/client");
const { prisma } = require("../prisma");

const DEFAULT_PLAN_NAME = "Hidden Free";

const tenantsController = {
  // GET all tenants with optional filters
  getAllTenants: async (req, res) => {
    try {
      const { planId, status } = req.query;

      let whereClause = {};
      let subscriptionFilter = {};

      if (planId) {
        subscriptionFilter.planid = parseInt(planId);
      }
      if (status) {
        subscriptionFilter.status = status;
      }

      if (Object.keys(subscriptionFilter).length > 0) {
        whereClause.subscriptions = { some: subscriptionFilter };
      }

      const tenants = await prisma.tenants.findMany({
        where: whereClause,
        include: {
          subscriptions: {
            include: { plan: true },
            orderBy: { createdat: "desc" },
          },
          accounts: {
            where: { role: "admin" },
            select: { username: true, email: true },
          },
        },
      });

      res.json(tenants);
    } catch (error) {
      console.error("Loi khi lay danh sach tenants:", error);
      res.status(500).json({ error: "Loi khi lay danh sach tenants" });
    }
  },

  // GET tenant by id
  getTenantById: async (req, res) => {
    try {
      const { id } = req.params;
      const tenant = await prisma.tenants.findUnique({
        where: { tenantid: parseInt(id) },
        include: {
          subscriptions: { include: { plan: true } },
          accounts: { select: { accountid: true, username: true, email: true, role: true } },
          departments: true,
          tenanttemplates: true,
        },
      });

      if (!tenant) {
        return res.status(404).json({ error: "Khong tim thay tenant" });
      }

      res.json(tenant);
    } catch (error) {
      res.status(500).json({ error: "Loi khi lay thong tin tenant" });
    }
  },

  // CREATE tenant (fallback to default plan if none provided)
  createTenant: async (req, res) => {
    try {
      const { tenantname, domain, htmlfilename, email, phone, address, status, planid } = req.body;

      const newTenant = await prisma.tenants.create({
        data: {
          tenantname,
          domain,
          htmlfilename,
          email,
          phone,
          address,
          status: status || "pending_setup",
        },
      });

      const tenantid = newTenant.tenantid;

      // pick plan: use payload or fallback to DEFAULT_PLAN_NAME (hidden/default)
      let selectedPlan = null;
      const planIdNumber = planid ? parseInt(planid) : null;
      if (planIdNumber) {
        selectedPlan = await prisma.plans.findUnique({ where: { planid: planIdNumber } });
      }
      if (!selectedPlan) {
        selectedPlan = await prisma.plans.findFirst({ where: { planname: DEFAULT_PLAN_NAME } });
      }
      if (!selectedPlan) {
        selectedPlan = await prisma.plans.create({
          data: {
            planname: DEFAULT_PLAN_NAME,
            intro: "Goi mac dinh an 0d",
            description: "Goi an dung de khoi tao tenant khi khong chon goi",
            price: new Prisma.Decimal(0),
            durationmonths: 1,
          },
        });
      }

      // copy templates if plan exists
      if (selectedPlan?.planid) {
        const masterTemplates = await prisma.templates.findMany({
          where: { planid: selectedPlan.planid },
        });

        for (const masterTpl of masterTemplates) {
          await prisma.tenantTemplates.create({
            data: {
              tenantid,
              templateid: masterTpl.templateid,
              name: masterTpl.name,
              htmlcontent: masterTpl.htmlcontent,
              data: {},
              slug: `${tenantname.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${masterTpl.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
            },
          });
        }

        // optional: create subscription automatically
        const start = new Date();
        const end = new Date(start);
        end.setMonth(start.getMonth() + (selectedPlan.durationmonths || 1));
        await prisma.subscriptions.create({
          data: {
            tenantid,
            planid: selectedPlan.planid,
            startdate: start,
            enddate: end,
            status: "active",
          },
        });
      }

      // create default seed data based on plan name
      await createTenantWithDefaults(tenantid, selectedPlan?.planname || null);

      res.status(201).json(newTenant);
    } catch (error) {
      console.error("Loi khi tao tenant:", error);
      res.status(500).json({ error: "Loi khi tao tenant moi" });
    }
  },

  // UPDATE tenant
  updateTenant: async (req, res) => {
    try {
      const { id } = req.params;
      const { tenantname, domain, htmlfilename, email, phone, address, status } = req.body;

      const updatedTenant = await prisma.tenants.update({
        where: { tenantid: parseInt(id) },
        data: { tenantname, domain, htmlfilename, email, phone, address, status, updatedat: new Date() },
      });

      res.json(updatedTenant);
    } catch (error) {
      res.status(500).json({ error: "Loi khi cap nhat tenant" });
    }
  },

  // Tenant admin tự cập nhật thông tin tenant của mình
  updateSelf: async (req, res) => {
    try {
      const tenantid = req.user?.tenantid;
      if (!tenantid) return res.status(400).json({ error: "Thiếu tenantid" });

      const { tenantname, domain, htmlfilename, email, phone, address } = req.body;
      const updatedTenant = await prisma.tenants.update({
        where: { tenantid: tenantid },
        data: {
          tenantname: tenantname ?? undefined,
          domain: domain ?? undefined,
          htmlfilename: htmlfilename ?? undefined,
          email: email ?? undefined,
          phone: phone ?? undefined,
          address: address ?? undefined,
          updatedat: new Date(),
        },
      });
      res.json(updatedTenant);
    } catch (error) {
      console.error("Loi khi cap nhat tenant self:", error);
      res.status(500).json({ error: "Loi khi cap nhat tenant" });
    }
  },

  // DELETE tenant
  deleteTenant: async (req, res) => {
    try {
      const { id } = req.params;
      const tenantId = parseInt(id);

      // Lấy các subscription id để xóa log trước
      const subs = await prisma.subscriptions.findMany({
        where: { tenantid: tenantId },
        select: { subscriptionid: true },
      });
      const subIds = subs.map((s) => s.subscriptionid);
      if (subIds.length > 0) {
        await prisma.subscriptionLogs.deleteMany({ where: { subscriptionid: { in: subIds } } });
      }

      // Xóa các bảng liên quan tới tenant
      await prisma.tenantTemplates.deleteMany({ where: { tenantid: tenantId } });
      await prisma.departments.deleteMany({ where: { tenantid: tenantId } });
      await prisma.lecturers.deleteMany({ where: { tenantid: tenantId } });
      await prisma.programs.deleteMany({ where: { tenantid: tenantId } });
      await prisma.researchProjects.deleteMany({ where: { tenantid: tenantId } });
      await prisma.news.deleteMany({ where: { tenantid: tenantId } });
      await prisma.events.deleteMany({ where: { tenantid: tenantId } });
      await prisma.achievements.deleteMany({ where: { tenantid: tenantId } });

      await prisma.tenantAccounts.deleteMany({ where: { tenantid: tenantId } });
      await prisma.subscriptions.deleteMany({ where: { tenantid: tenantId } });

      await prisma.tenants.delete({ where: { tenantid: tenantId } });
      res.json({ message: "Da xoa tenant thanh cong" });
    } catch (error) {
      console.error("Loi khi xoa tenant:", error);
      res.status(500).json({ error: "Loi khi xoa tenant" });
    }
  },
};

async function createTenantWithDefaults(tenantid, planName) {
  let departments = [];
  let programs = [];
  let news = [];

  if (planName === "Prebuilt" || planName === DEFAULT_PLAN_NAME) {
    departments = [{ departmentname: "Phong ban Mau", description: "Mo ta mau" }];
    news = [{ title: "Chao mung voi goi Prebuilt", content: "Day la noi dung tin tuc mau." }];
  } else if (planName === "Custom") {
    // no defaults
  } else {
    departments = [
      { departmentname: "Khoa Hop tac Cong nghiep", description: "Hop tac doanh nghiep" },
      { departmentname: "Khoa Dao tao", description: "Dao tao & boi duong" },
    ];
    programs = [
      { programname: "Thac si Nghien cuu", description: "Chuong trinh thac si nghien cuu" },
      { programname: "Chuong trinh Tich hop Doanh nghiep", description: "Hop tac doanh nghiep" },
    ];
    news = [{ title: "Enterprise onboarding", content: "Goi Enterprise da kich hoat. Huong dan onboarding." }];
  }

  for (const d of departments) {
    const created = await prisma.departments.create({ data: { ...d, tenantid } });
    for (const p of programs.slice(0, 1)) {
      await prisma.programs.create({ data: { ...p, tenantid, departmentid: created.departmentid } });
    }
  }

  if (programs.length > 1) {
    const dept = await prisma.departments.findFirst({ where: { tenantid } });
    for (let i = 1; i < programs.length; i++) {
      await prisma.programs.create({ data: { ...programs[i], tenantid, departmentid: dept?.departmentid || null } });
    }
  }

  for (const n of news) {
    await prisma.news.create({ data: { ...n, tenantid } });
  }
}

module.exports = tenantsController;
