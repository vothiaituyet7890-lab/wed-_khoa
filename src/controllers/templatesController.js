const { prisma } = require('../prisma');

const templatesController = {
    // Get templates for a plan
    getTemplatesByPlan: async (req, res) => {
        try {
            const { planId } = req.params;
            const templates = await prisma.templates.findMany({ where: { planid: parseInt(planId) } });
            res.json(templates);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi lấy templates' });
        }
    },

    // Create or update a template
    createTemplate: async (req, res) => {
        try {
            const { planid, name, description, htmlcontent } = req.body;
            const t = await prisma.templates.create({ data: { planid: parseInt(planid), name, description, htmlcontent } });
            res.status(201).json(t);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi tạo template' });
        }
    },

    updateTemplate: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, description, htmlcontent } = req.body;
            const t = await prisma.templates.update({ where: { templateid: parseInt(id) }, data: { name, description, htmlcontent, updatedat: new Date() } });
            res.json(t);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi cập nhật template' });
        }
    },

    deleteTemplate: async (req, res) => {
        try {
            const { id } = req.params;
            await prisma.templates.delete({ where: { templateid: parseInt(id) } });
            res.json({ message: 'Template deleted' });
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi xóa template' });
        }
    }
};

module.exports = templatesController;
