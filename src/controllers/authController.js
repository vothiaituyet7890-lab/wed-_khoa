const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { Prisma } = require("@prisma/client");
const { prisma } = require("../prisma");
const { JWT_SECRET } = require("../middleware/auth");
const { validationResult } = require("express-validator");

// Goi mac dinh neu client khong truyen planid (goi an 0d)
const DEFAULT_PLAN_NAME = "Hidden Free";

// Helper: ensure default hidden plan ton tai
async function ensureDefaultPlan() {
  let plan = await prisma.plans.findFirst({ where: { planname: DEFAULT_PLAN_NAME } });
  if (!plan) {
    plan = await prisma.plans.create({
      data: {
        planname: DEFAULT_PLAN_NAME,
        intro: "Goi mac dinh an 0d",
        description: "Goi an dung de khoi tao tenant neu khong chon goi",
        price: new Prisma.Decimal(0),
        durationmonths: 1,
      },
    });
  }
  return plan;
}

// ================================
// EMAIL SENDER
// ================================
const sendVerificationEmail = async (email, code) => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to: email,
        subject: "Ma xac thuc 6 so - SaaS Platform",
        html: `
          <div style="font-family: Arial; text-align:center; padding:20px;">
            <h2>Ma xac thuc cua ban</h2>
            <p>Vui long su dung ma 6 so duoi day de hoan tat dang ky:</p>
            <h1 style="font-size:48px; letter-spacing:0.1em; color:#1d4ed8;">${code}</h1>
            <p style="color:#6b7280;">Ma nay co hieu luc trong 10 phut.</p>
          </div>
        `,
      });
    } catch (error) {
      console.error("Loi khi gui email:", error);
    }
  } else {
    console.warn("SMTP chua cau hinh, email khong duoc gui.");
  }
};

// ================================
//        AUTH CONTROLLER
// ================================
const authController = {
  // REGISTER
  register: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password, role, planid } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      // 1. SuperAdmin
      if (role === "superadmin") {
        const existing = await prisma.superAdmin.findFirst({
          where: { OR: [{ email }, { username }] },
        });

        if (existing) {
          return res.status(400).json({ error: "Email hoac Username da ton tai" });
        }

        const admin = await prisma.superAdmin.create({
          data: { username, email, passwordhash: hashedPassword },
        });

        return res.status(201).json({
          message: "SuperAdmin da duoc tao thanh cong!",
          user: { userid: admin.adminid, username, email, role: "superadmin" },
        });
      }

      // 2. Tenant Admin
      if (role === "admin") {
        const existing = await prisma.tenantAccounts.findFirst({
          where: { OR: [{ email }, { username }] },
        });
        if (existing) {
          return res.status(400).json({ error: "Email hoac Username da ton tai" });
        }

        // Chon goi dang ky
        const planIdFromPayload = planid ? parseInt(planid) : null;
        let selectedPlan = null;

        if (planIdFromPayload) {
          selectedPlan = await prisma.plans.findUnique({ where: { planid: planIdFromPayload } });
        }
        if (!selectedPlan) {
          selectedPlan = await ensureDefaultPlan();
        }

        // Tao tenant
        const tenant = await prisma.tenants.create({
          data: {
            tenantname: `${username}'s Khoa`,
            email,
            status: "active",
          },
        });

        // Tao admin account
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);

        await prisma.tenantAccounts.create({
          data: {
            tenantid: tenant.tenantid,
            username,
            email,
            passwordhash: hashedPassword,
            role: "admin",
            emailverified: false,
            verificationCode,
            verificationCodeExpiry,
          },
        });

        // Tao subscription
        const start = new Date();
        const end = new Date(start);
        end.setMonth(start.getMonth() + (selectedPlan.durationmonths || 1));

        await prisma.subscriptions.create({
          data: {
            tenantid: tenant.tenantid,
            planid: selectedPlan.planid,
            startdate: start,
            enddate: end,
            status: "active",
          },
        });

        // Sao chep template theo goi
        const templates = await prisma.templates.findMany({
          where: { planid: selectedPlan.planid },
        });

        for (const tpl of templates) {
          await prisma.tenantTemplates.create({
            data: {
              tenantid: tenant.tenantid,
              templateid: tpl.templateid,
              name: tpl.name,
              htmlcontent: tpl.htmlcontent,
              slug: `${tenant.tenantname.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${tpl.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
              data: {},
            },
          });
        }

        // Gui email xac thuc
        await sendVerificationEmail(email, verificationCode);

        return res.status(201).json({
          message: "Dang ky thanh cong! Vui long kiem tra email de xac thuc.",
          step: "verify",
        });
      }

      return res.status(400).json({ error: "Loai tai khoan khong hop le" });
    } catch (error) {
      console.error("Loi khi dang ky:", error);
      res.status(500).json({ error: "Loi may chu noi bo" });
    }
  },

  // LOGIN
  login: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      let user = await prisma.superAdmin.findUnique({ where: { email } });
      let role = "superadmin";

      if (!user) {
        user = await prisma.tenantAccounts.findUnique({
          where: { email },
          include: { tenant: true },
        });
        role = "admin";
      }

      if (!user) {
        return res.status(401).json({ error: "Email hoac mat khau khong chinh xac" });
      }

      if (role === "admin" && !user.emailverified) {
        return res.status(401).json({
          error: "Email chua duoc xac thuc",
          requiresVerification: true,
        });
      }

      const match = await bcrypt.compare(password, user.passwordhash);
      if (!match) {
        return res.status(401).json({ error: "Email hoac mat khau khong chinh xac" });
      }

      let payload;
      let userData;

      if (role === "superadmin") {
        payload = { userid: user.adminid, role: "superadmin" };
        userData = { userid: user.adminid, username: user.username, email, role };
      } else {
        payload = { userid: user.accountid, tenantid: user.tenantid, role };
        userData = {
          userid: user.accountid,
          username: user.username,
          email,
          role,
          tenantid: user.tenantid,
          tenantname: user.tenant?.tenantname,
        };
      }

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

      res.json({ message: "Dang nhap thanh cong", token, user: userData });
    } catch (error) {
      console.error("Loi khi dang nhap:", error);
      res.status(500).json({ error: "Loi may chu noi bo" });
    }
  },

  // VERIFY EMAIL
  verifyEmail: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, code } = req.body;

      const account = await prisma.tenantAccounts.findUnique({ where: { email } });
      if (!account) {
        return res.status(400).json({ error: "Email khong ton tai" });
      }

      if (account.verificationCode !== code) {
        return res.status(400).json({ error: "Ma xac thuc khong chinh xac" });
      }

      if (account.verificationCodeExpiry < new Date()) {
        return res.status(400).json({ error: "Ma xac thuc da het han" });
      }

      await prisma.tenantAccounts.update({
        where: { email },
        data: {
          emailverified: true,
          verificationCode: null,
          verificationCodeExpiry: null,
        },
      });

      res.json({ message: "Xac thuc email thanh cong" });
    } catch (error) {
      console.error("Loi verify email:", error);
      res.status(500).json({ error: "Loi may chu noi bo" });
    }
  },
};

module.exports = authController;
