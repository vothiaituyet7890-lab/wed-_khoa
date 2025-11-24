const { prisma } = require('../prisma');

const subscriptionLogsController = {
    // Lấy danh sách tất cả subscription logs
    getAllLogs: async (req, res) => {
        try {
            const logs = await prisma.subscriptionLogs.findMany({
                include: {
                    subscription: true
                }
            });
            res.json(logs);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi lấy danh sách subscription logs' });
        }
    },

    // Lấy subscription log theo ID
    getLogById: async (req, res) => {
        try {
            const { id } = req.params;
            const log = await prisma.subscriptionLogs.findUnique({
                where: { logid: parseInt(id) },
                include: {
                    subscription: true
                }
            });
            
            if (!log) {
                return res.status(404).json({ error: 'Không tìm thấy subscription log' });
            }
            
            res.json(log);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi lấy thông tin subscription log' });
        }
    },

    // Tạo subscription log mới
    createLog: async (req, res) => {
        try {
            const { subscriptionid, action, actionby, actiondate, notes } = req.body;
            const newLog = await prisma.subscriptionLogs.create({
                data: {
                    subscriptionid: parseInt(subscriptionid),
                    action,
                    actionby,
                    actiondate: actiondate ? new Date(actiondate) : null,
                    notes
                }
            });
            
            res.status(201).json(newLog);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi tạo subscription log mới' });
        }
    },

    // Cập nhật subscription log
    updateLog: async (req, res) => {
        try {
            const { id } = req.params;
            const { action, actionby, actiondate, notes } = req.body;
            
            const updatedLog = await prisma.subscriptionLogs.update({
                where: { logid: parseInt(id) },
                data: {
                    action,
                    actionby,
                    actiondate: actiondate ? new Date(actiondate) : null,
                    notes
                }
            });
            
            res.json(updatedLog);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi cập nhật subscription log' });
        }
    },

    // Xóa subscription log
    deleteLog: async (req, res) => {
        try {
            const { id } = req.params;
            await prisma.subscriptionLogs.delete({
                where: { logid: parseInt(id) }
            });
            
            res.json({ message: 'Đã xóa subscription log thành công' });
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi xóa subscription log' });
        }
    }
};

module.exports = subscriptionLogsController;