const { prisma } = require('../prisma');

const achievementsController = {
    // Lấy danh sách tất cả achievements
    getAllAchievements: async (req, res) => {
        try {
            const achievements = await prisma.achievements.findMany({
                include: {
                    tenant: true
                }
            });
            res.json(achievements);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi lấy danh sách achievements' });
        }
    },

    // Lấy achievement theo ID
    getAchievementById: async (req, res) => {
        try {
            const { id } = req.params;
            const achievement = await prisma.achievements.findUnique({
                where: { achievementid: parseInt(id) },
                include: {
                    tenant: true
                }
            });
            
            if (!achievement) {
                return res.status(404).json({ error: 'Không tìm thấy achievement' });
            }
            
            res.json(achievement);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi lấy thông tin achievement' });
        }
    },

    // Tạo achievement mới
    createAchievement: async (req, res) => {
        try {
            const { tenantid, title, description, date, associatedwith } = req.body;
            const newAchievement = await prisma.achievements.create({
                data: {
                    tenantid: parseInt(tenantid),
                    title,
                    description,
                    date: date ? new Date(date) : null,
                    associatedwith
                }
            });
            
            res.status(201).json(newAchievement);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi tạo achievement mới' });
        }
    },

    // Cập nhật achievement
    updateAchievement: async (req, res) => {
        try {
            const { id } = req.params;
            const { title, description, date, associatedwith } = req.body;
            
            const updatedAchievement = await prisma.achievements.update({
                where: { achievementid: parseInt(id) },
                data: {
                    title,
                    description,
                    date: date ? new Date(date) : null,
                    associatedwith,
                    updatedat: new Date()
                }
            });
            
            res.json(updatedAchievement);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi cập nhật achievement' });
        }
    },

    // Xóa achievement
    deleteAchievement: async (req, res) => {
        try {
            const { id } = req.params;
            await prisma.achievements.delete({
                where: { achievementid: parseInt(id) }
            });
            
            res.json({ message: 'Đã xóa achievement thành công' });
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi xóa achievement' });
        }
    }
};

module.exports = achievementsController;