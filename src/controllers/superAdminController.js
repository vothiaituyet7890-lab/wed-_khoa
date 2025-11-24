const { prisma } = require('../prisma');

const superAdminController = {
    // Lấy danh sách tất cả super admins
    getAllSuperAdmins: async (req, res) => {
        try {
            const admins = await prisma.superAdmin.findMany({
                select: {
                    adminid: true,
                    username: true,
                    email: true,
                    role: true,
                    createdat: true,
                    updatedat: true
                }
            });
            res.json(admins);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi lấy danh sách super admins' });
        }
    },

    // Lấy super admin theo ID
    getSuperAdminById: async (req, res) => {
        try {
            const { id } = req.params;
            const admin = await prisma.superAdmin.findUnique({
                where: { adminid: parseInt(id) },
                select: {
                    adminid: true,
                    username: true,
                    email: true,
                    role: true,
                    createdat: true,
                    updatedat: true
                }
            });
            
            if (!admin) {
                return res.status(404).json({ error: 'Không tìm thấy super admin' });
            }
            
            res.json(admin);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi lấy thông tin super admin' });
        }
    },

    // Tạo super admin mới
    createSuperAdmin: async (req, res) => {
        try {
            const { username, email, passwordhash, role } = req.body;
            const newAdmin = await prisma.superAdmin.create({
                data: {
                    username,
                    email,
                    passwordhash,
                    role
                },
                select: {
                    adminid: true,
                    username: true,
                    email: true,
                    role: true,
                    createdat: true,
                    updatedat: true
                }
            });
            
            res.status(201).json(newAdmin);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi tạo super admin mới' });
        }
    },

    // Cập nhật super admin
    updateSuperAdmin: async (req, res) => {
        try {
            const { id } = req.params;
            const { username, email, passwordhash, role } = req.body;
            
            const updatedAdmin = await prisma.superAdmin.update({
                where: { adminid: parseInt(id) },
                data: {
                    username,
                    email,
                    ...(passwordhash && { passwordhash }),
                    role,
                    updatedat: new Date()
                },
                select: {
                    adminid: true,
                    username: true,
                    email: true,
                    role: true,
                    createdat: true,
                    updatedat: true
                }
            });
            
            res.json(updatedAdmin);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi cập nhật super admin' });
        }
    },

    // Xóa super admin
    deleteSuperAdmin: async (req, res) => {
        try {
            const { id } = req.params;
            await prisma.superAdmin.delete({
                where: { adminid: parseInt(id) }
            });
            
            res.json({ message: 'Đã xóa super admin thành công' });
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi xóa super admin' });
        }
    }
};

module.exports = superAdminController;