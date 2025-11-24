const { prisma } = require('../prisma');

const lecturersController = {
    // Lấy danh sách tất cả lecturers
    getAllLecturers: async (req, res) => {
        try {
            const lecturers = await prisma.lecturers.findMany({
                include: {
                    tenant: true,
                    department: true
                }
            });
            res.json(lecturers);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi lấy danh sách lecturers' });
        }
    },

    // Lấy lecturer theo ID
    getLecturerById: async (req, res) => {
        try {
            const { id } = req.params;
            const lecturer = await prisma.lecturers.findUnique({
                where: { lecturerid: parseInt(id) },
                include: {
                    tenant: true,
                    department: true,
                    research: true,
                    news: true
                }
            });
            
            if (!lecturer) {
                return res.status(404).json({ error: 'Không tìm thấy lecturer' });
            }
            
            res.json(lecturer);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi lấy thông tin lecturer' });
        }
    },

    // Tạo lecturer mới
    createLecturer: async (req, res) => {
        try {
            const { tenantid, name, email, phone, departmentid, title } = req.body;
            const newLecturer = await prisma.lecturers.create({
                data: {
                    tenantid: parseInt(tenantid),
                    name,
                    email,
                    phone,
                    departmentid: departmentid ? parseInt(departmentid) : null,
                    title
                }
            });
            
            res.status(201).json(newLecturer);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi tạo lecturer mới' });
        }
    },

    // Cập nhật lecturer
    updateLecturer: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, email, phone, departmentid, title } = req.body;
            
            const updatedLecturer = await prisma.lecturers.update({
                where: { lecturerid: parseInt(id) },
                data: {
                    name,
                    email,
                    phone,
                    departmentid: departmentid ? parseInt(departmentid) : null,
                    title,
                    updatedat: new Date()
                }
            });
            
            res.json(updatedLecturer);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi cập nhật lecturer' });
        }
    },

    // Xóa lecturer
    deleteLecturer: async (req, res) => {
        try {
            const { id } = req.params;
            await prisma.lecturers.delete({
                where: { lecturerid: parseInt(id) }
            });
            
            res.json({ message: 'Đã xóa lecturer thành công' });
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi xóa lecturer' });
        }
    }
};

module.exports = lecturersController;