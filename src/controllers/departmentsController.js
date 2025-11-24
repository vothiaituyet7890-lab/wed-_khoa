const { prisma } = require('../prisma');

const departmentsController = {
    // Lấy danh sách tất cả departments
    getAllDepartments: async (req, res) => {
        try {
            const departments = await prisma.departments.findMany({
                include: {
                    tenant: true
                }
            });
            res.json(departments);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi lấy danh sách departments' });
        }
    },

    // Lấy department theo ID
    getDepartmentById: async (req, res) => {
        try {
            const { id } = req.params;
            const department = await prisma.departments.findUnique({
                where: { departmentid: parseInt(id) },
                include: {
                    tenant: true,
                    lecturers: true,
                    programs: true
                }
            });
            
            if (!department) {
                return res.status(404).json({ error: 'Không tìm thấy department' });
            }
            
            res.json(department);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi lấy thông tin department' });
        }
    },

    // Tạo department mới
    createDepartment: async (req, res) => {
        try {
            const { tenantid, departmentname, description, head } = req.body;
            const newDepartment = await prisma.departments.create({
                data: {
                    tenantid: parseInt(tenantid),
                    departmentname,
                    description,
                    head
                }
            });
            
            res.status(201).json(newDepartment);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi tạo department mới' });
        }
    },

    // Cập nhật department
    updateDepartment: async (req, res) => {
        try {
            const { id } = req.params;
            const { departmentname, description, head } = req.body;
            
            const updatedDepartment = await prisma.departments.update({
                where: { departmentid: parseInt(id) },
                data: {
                    departmentname,
                    description,
                    head,
                    updatedat: new Date()
                }
            });
            
            res.json(updatedDepartment);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi cập nhật department' });
        }
    },

    // Xóa department
    deleteDepartment: async (req, res) => {
        try {
            const { id } = req.params;
            await prisma.departments.delete({
                where: { departmentid: parseInt(id) }
            });
            
            res.json({ message: 'Đã xóa department thành công' });
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi xóa department' });
        }
    }
};

module.exports = departmentsController;