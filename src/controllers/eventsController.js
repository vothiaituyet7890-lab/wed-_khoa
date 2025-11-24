const { prisma } = require('../prisma');

const eventsController = {
    // Lấy danh sách tất cả events
    getAllEvents: async (req, res) => {
        try {
            const events = await prisma.events.findMany({
                include: {
                    tenant: true
                }
            });
            res.json(events);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi lấy danh sách events' });
        }
    },

    // Lấy event theo ID
    getEventById: async (req, res) => {
        try {
            const { id } = req.params;
            const event = await prisma.events.findUnique({
                where: { eventid: parseInt(id) },
                include: {
                    tenant: true
                }
            });
            
            if (!event) {
                return res.status(404).json({ error: 'Không tìm thấy event' });
            }
            
            res.json(event);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi lấy thông tin event' });
        }
    },

    // Tạo event mới
    createEvent: async (req, res) => {
        try {
            const { tenantid, title, description, startdate, enddate, location } = req.body;
            const newEvent = await prisma.events.create({
                data: {
                    tenantid: parseInt(tenantid),
                    title,
                    description,
                    startdate: startdate ? new Date(startdate) : null,
                    enddate: enddate ? new Date(enddate) : null,
                    location
                }
            });
            
            res.status(201).json(newEvent);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi tạo event mới' });
        }
    },

    // Cập nhật event
    updateEvent: async (req, res) => {
        try {
            const { id } = req.params;
            const { title, description, startdate, enddate, location } = req.body;
            
            const updatedEvent = await prisma.events.update({
                where: { eventid: parseInt(id) },
                data: {
                    title,
                    description,
                    startdate: startdate ? new Date(startdate) : null,
                    enddate: enddate ? new Date(enddate) : null,
                    location,
                    updatedat: new Date()
                }
            });
            
            res.json(updatedEvent);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi cập nhật event' });
        }
    },

    // Xóa event
    deleteEvent: async (req, res) => {
        try {
            const { id } = req.params;
            await prisma.events.delete({
                where: { eventid: parseInt(id) }
            });
            
            res.json({ message: 'Đã xóa event thành công' });
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi xóa event' });
        }
    }
};

module.exports = eventsController;