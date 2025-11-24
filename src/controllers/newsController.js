const { prisma } = require('../prisma');

const newsController = {
    // Lấy danh sách tất cả news
    getAllNews: async (req, res) => {
        try {
            const news = await prisma.news.findMany({
                include: {
                    tenant: true,
                    author: true
                }
            });
            res.json(news);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi lấy danh sách news' });
        }
    },

    // Lấy news theo ID
    getNewsById: async (req, res) => {
        try {
            const { id } = req.params;
            const news = await prisma.news.findUnique({
                where: { newsid: parseInt(id) },
                include: {
                    tenant: true,
                    author: true
                }
            });
            
            if (!news) {
                return res.status(404).json({ error: 'Không tìm thấy news' });
            }
            
            res.json(news);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi lấy thông tin news' });
        }
    },

    // Tạo news mới
    createNews: async (req, res) => {
        try {
            const { tenantid, title, content, authorid, publisheddate } = req.body;
            const newNews = await prisma.news.create({
                data: {
                    tenantid: parseInt(tenantid),
                    title,
                    content,
                    authorid: authorid ? parseInt(authorid) : null,
                    publisheddate: publisheddate ? new Date(publisheddate) : null
                }
            });
            
            res.status(201).json(newNews);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi tạo news mới' });
        }
    },

    // Cập nhật news
    updateNews: async (req, res) => {
        try {
            const { id } = req.params;
            const { title, content, authorid, publisheddate } = req.body;
            
            const updatedNews = await prisma.news.update({
                where: { newsid: parseInt(id) },
                data: {
                    title,
                    content,
                    authorid: authorid ? parseInt(authorid) : null,
                    publisheddate: publisheddate ? new Date(publisheddate) : null,
                    updatedat: new Date()
                }
            });
            
            res.json(updatedNews);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi cập nhật news' });
        }
    },

    // Xóa news
    deleteNews: async (req, res) => {
        try {
            const { id } = req.params;
            await prisma.news.delete({
                where: { newsid: parseInt(id) }
            });
            
            res.json({ message: 'Đã xóa news thành công' });
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi xóa news' });
        }
    }
};

module.exports = newsController;