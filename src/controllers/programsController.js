const { prisma } = require('../prisma');

const programsController = {
    // Lấy danh sách tất cả programs
    getAllPrograms: async (req, res) => {
        try {
            const programs = await prisma.programs.findMany({
                include: {
                    tenant: true,
                    department: true
                }
            });
            res.json(programs);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi lấy danh sách programs' });
        }
    },

    // Lấy program theo ID
    getProgramById: async (req, res) => {
        try {
            const { id } = req.params;
            const program = await prisma.programs.findUnique({
                where: { programid: parseInt(id) },
                include: {
                    tenant: true,
                    department: true
                }
            });
            
            if (!program) {
                return res.status(404).json({ error: 'Không tìm thấy program' });
            }
            
            res.json(program);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi lấy thông tin program' });
        }
    },

    // Tạo program mới
    createProgram: async (req, res) => {
        try {
            const { tenantid, programname, departmentid, description, durationyears } = req.body;
            const newProgram = await prisma.programs.create({
                data: {
                    tenantid: parseInt(tenantid),
                    programname,
                    departmentid: departmentid ? parseInt(departmentid) : null,
                    description,
                    durationyears: durationyears ? parseInt(durationyears) : null
                }
            });
            
            res.status(201).json(newProgram);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi tạo program mới' });
        }
    },

    // Cập nhật program
    updateProgram: async (req, res) => {
        try {
            const { id } = req.params;
            const { programname, departmentid, description, durationyears } = req.body;
            
            const updatedProgram = await prisma.programs.update({
                where: { programid: parseInt(id) },
                data: {
                    programname,
                    departmentid: departmentid ? parseInt(departmentid) : null,
                    description,
                    durationyears: durationyears ? parseInt(durationyears) : null,
                    updatedat: new Date()
                }
            });
            
            res.json(updatedProgram);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi cập nhật program' });
        }
    },

    // Xóa program
    deleteProgram: async (req, res) => {
        try {
            const { id } = req.params;
            await prisma.programs.delete({
                where: { programid: parseInt(id) }
            });
            
            res.json({ message: 'Đã xóa program thành công' });
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi xóa program' });
        }
    }
};

module.exports = programsController;