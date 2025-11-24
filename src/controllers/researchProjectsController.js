const { prisma } = require('../prisma');

const researchProjectsController = {
    // Lấy danh sách tất cả research projects
    getAllProjects: async (req, res) => {
        try {
            const projects = await prisma.researchProjects.findMany({
                include: {
                    tenant: true,
                    leader: true
                }
            });
            res.json(projects);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi lấy danh sách research projects' });
        }
    },

    // Lấy research project theo ID
    getProjectById: async (req, res) => {
        try {
            const { id } = req.params;
            const project = await prisma.researchProjects.findUnique({
                where: { projectid: parseInt(id) },
                include: {
                    tenant: true,
                    leader: true
                }
            });
            
            if (!project) {
                return res.status(404).json({ error: 'Không tìm thấy research project' });
            }
            
            res.json(project);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi lấy thông tin research project' });
        }
    },

    // Tạo research project mới
    createProject: async (req, res) => {
        try {
            const { tenantid, projectname, description, startdate, enddate, leaderid } = req.body;
            const newProject = await prisma.researchProjects.create({
                data: {
                    tenantid: parseInt(tenantid),
                    projectname,
                    description,
                    startdate: startdate ? new Date(startdate) : null,
                    enddate: enddate ? new Date(enddate) : null,
                    leaderid: leaderid ? parseInt(leaderid) : null
                }
            });
            
            res.status(201).json(newProject);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi tạo research project mới' });
        }
    },

    // Cập nhật research project
    updateProject: async (req, res) => {
        try {
            const { id } = req.params;
            const { projectname, description, startdate, enddate, leaderid } = req.body;
            
            const updatedProject = await prisma.researchProjects.update({
                where: { projectid: parseInt(id) },
                data: {
                    projectname,
                    description,
                    startdate: startdate ? new Date(startdate) : null,
                    enddate: enddate ? new Date(enddate) : null,
                    leaderid: leaderid ? parseInt(leaderid) : null,
                    updatedat: new Date()
                }
            });
            
            res.json(updatedProject);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi cập nhật research project' });
        }
    },

    // Xóa research project
    deleteProject: async (req, res) => {
        try {
            const { id } = req.params;
            await prisma.researchProjects.delete({
                where: { projectid: parseInt(id) }
            });
            
            res.json({ message: 'Đã xóa research project thành công' });
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi xóa research project' });
        }
    }
};

module.exports = researchProjectsController;