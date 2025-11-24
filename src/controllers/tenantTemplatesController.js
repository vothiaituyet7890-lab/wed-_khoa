const fs = require('fs');
const path = require('path');
const { prisma } = require('../prisma');

const BASE_DIR = path.join(__dirname, '..', '..', 'templates', 'html', 'tenants');

function ensureTenantDir(tenantid) {
  const dir = path.join(BASE_DIR, String(tenantid));
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

const tenantTemplatesController = {
  async getMyTemplates(req, res) {
    try {
      const tenantid = req.user?.tenantid;
      if (!tenantid) return res.status(400).json({ error: 'Thiếu tenantid' });
      const data = await prisma.tenantTemplates.findMany({ where: { tenantid } });
      res.json(data);
    } catch (err) {
      console.error('Lỗi lấy templates:', err);
      res.status(500).json({ error: 'Lỗi lấy templates' });
    }
  },

  async getById(req, res) {
    try {
      const tenantid = req.user?.tenantid;
      const { id } = req.params;
      const tpl = await prisma.tenantTemplates.findFirst({
        where: { tenantid, tenanttemplateid: parseInt(id) },
      });
      if (!tpl) return res.status(404).json({ error: 'Không tìm thấy template' });
      res.json(tpl);
    } catch (err) {
      res.status(500).json({ error: 'Lỗi lấy template' });
    }
  },

  async updateTemplate(req, res) {
    try {
      const tenantid = req.user?.tenantid;
      const { id } = req.params;
      const { htmlcontent, name } = req.body;
      const tpl = await prisma.tenantTemplates.findFirst({
        where: { tenantid, tenanttemplateid: parseInt(id) },
      });
      if (!tpl) return res.status(404).json({ error: 'Không tìm thấy template' });
      const updated = await prisma.tenantTemplates.update({
        where: { tenanttemplateid: tpl.tenanttemplateid },
        data: { htmlcontent, name, updatedat: new Date() },
      });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: 'Lỗi cập nhật template' });
    }
  },

  async previewBySlug(req, res) {
    try {
      const { slug } = req.params;
      const tpl = await prisma.tenantTemplates.findFirst({ where: { slug } });
      if (!tpl?.htmlcontent) return res.status(404).send('Not found');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(tpl.htmlcontent);
    } catch (err) {
      res.status(500).send('Error');
    }
  },

  async serveByDomain(req, res) {
    try {
      const { domain } = req.params;
      const rawDomain = (domain || '').trim();
      if (!rawDomain) return res.status(400).send('Missing domain');

      // Normalize domain for robust matching (remove protocol, lowercase, allow comma-separated lists)
      const normalized = rawDomain.replace(/^https?:\/\//i, '').toLowerCase();
      const tenant = await prisma.tenants.findFirst({
        where: { domain: { contains: normalized, mode: 'insensitive' } },
        select: { tenantid: true, htmlfilename: true, domain: true },
      });
      if (!tenant) return res.status(404).send('Domain not found');

      // Determine file name
      const safeBase =
        (tenant.htmlfilename && tenant.htmlfilename.trim()) ||
        (normalized ? normalized.replace(/[^a-z0-9-_.]/gi, '_') : '');
      let fileName = safeBase || 'index';
      if (!fileName.toLowerCase().endsWith('.html')) fileName = `${fileName}.html`;

      const dir = ensureTenantDir(tenant.tenantid);
      const filePath = path.join(dir, fileName);

      if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
      }

      // fallback: first template in DB
      const tpl = await prisma.tenantTemplates.findFirst({
        where: { tenantid: tenant.tenantid },
      });
      if (tpl?.htmlcontent) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(tpl.htmlcontent);
      }

      return res.status(404).send('File not found');
    } catch (err) {
      console.error('serveByDomain error:', err);
      res.status(500).send('Error');
    }
  },

  saveCustomHtml: async (req, res) => {
    try {
      const tenantid = req.user?.tenantid;
      if (!tenantid) return res.status(400).json({ error: 'Thiếu tenantid' });

      const { htmlfilename, html } = req.body;
      if (!htmlfilename || !html) return res.status(400).json({ error: 'Thiếu htmlfilename hoặc nội dung html' });

      const safeName = htmlfilename.toString().replace(/[^a-z0-9-_.]/gi, '_');
      const finalName = safeName.endsWith('.html') ? safeName : `${safeName}.html`;
      const dir = ensureTenantDir(tenantid);
      const filePath = path.join(dir, finalName);
      fs.writeFileSync(filePath, html, 'utf8');

      const slug = `${tenantid}-${path.basename(finalName, '.html')}`;
      await prisma.tenantTemplates.upsert({
        where: { slug },
        update: { name: finalName, htmlcontent: html, tenantid },
        create: { name: finalName, htmlcontent: html, tenantid, slug },
      });

      res.json({ message: 'Đã lưu file HTML', filename: finalName, slug });
    } catch (err) {
      console.error('Lỗi lưu custom html:', err);
      res.status(500).json({ error: 'Lỗi lưu file HTML' });
    }
  },
};

module.exports = tenantTemplatesController;
