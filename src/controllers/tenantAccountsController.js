 const { prisma } = require('../prisma');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

const tenantAccountsController = {
    // Lấy danh sách tất cả tenant accounts (SuperAdmin thấy hết, TenantAdmin chỉ thấy của tenant mình)
    getAllAccounts: async (req, res) => {
        try {
            const { role, tenantid } = req.user;

            let accounts;
            if (role === 'superadmin') {
                accounts = await prisma.tenantAccounts.findMany({
                    include: {
                        tenant: true
                    },
                    select: {
                        accountid: true,
                        tenantid: true,
                        username: true,
                        email: true,
                        role: true,
                        createdat: true,
                        updatedat: true,
                        tenant: true
                    }
                });
            } else {
                // TenantAdmin chỉ thấy accounts của tenant mình
                accounts = await prisma.tenantAccounts.findMany({
                    where: {
                        tenantid: tenantid
                    },
                    select: {
                        accountid: true,
                        tenantid: true,
                        username: true,
                        email: true,
                        role: true,
                        createdat: true,
                        updatedat: true,
                        tenant: true
                    }
                });
            }
            res.json(accounts);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi lấy danh sách tenant accounts' });
        }
    },

    // Lấy tenant account theo ID
    getAccountById: async (req, res) => {
        try {
            const { id } = req.params;
            const { role, tenantid } = req.user;

            const account = await prisma.tenantAccounts.findUnique({
                where: { accountid: parseInt(id) },
                select: {
                    accountid: true,
                    tenantid: true,
                    username: true,
                    email: true,
                    role: true,
                    createdat: true,
                    updatedat: true,
                    tenant: true
                }
            });
            
            if (!account) {
                return res.status(404).json({ error: 'Không tìm thấy tenant account' });
            }

            // Kiểm tra quyền truy cập
            if (role !== 'superadmin' && account.tenantid !== tenantid) {
                return res.status(403).json({ error: 'Không có quyền truy cập account này' });
            }
            
            res.json(account);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi lấy thông tin tenant account' });
        }
    },

    // Tạo tenant account mới (SuperAdmin tạo được cho mọi tenant, TenantAdmin chỉ tạo được cho tenant của mình)
    createAccount: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { tenantid, username, email, password, role } = req.body;
            const { role: userRole, tenantid: userTenantId } = req.user;

            // Kiểm tra quyền tạo account
            if (userRole !== 'superadmin' && parseInt(tenantid) !== userTenantId) {
                return res.status(403).json({ error: 'Không có quyền tạo account cho tenant này' });
            }

            // Kiểm tra email đã tồn tại
            const existingAccount = await prisma.tenantAccounts.findUnique({
                where: { email }
            });

            if (existingAccount) {
                return res.status(400).json({ error: 'Email đã được sử dụng' });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const passwordhash = await bcrypt.hash(password, salt);

            const newAccount = await prisma.tenantAccounts.create({
                data: {
                    tenantid: parseInt(tenantid),
                    username,
                    email,
                    passwordhash,
                    role: role || 'user' // Mặc định là user nếu không specified
                },
                select: {
                    accountid: true,
                    tenantid: true,
                    username: true,
                    email: true,
                    role: true,
                    createdat: true,
                    updatedat: true
                }
            });
            
            res.status(201).json(newAccount);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi tạo tenant account mới' });
        }
    },

    // Cập nhật tenant account
    updateAccount: async (req, res) => {
        try {
            const { id } = req.params;
            const { username, email, passwordhash, role } = req.body;
            
            const updatedAccount = await prisma.tenantAccounts.update({
                where: { accountid: parseInt(id) },
                data: {
                    username,
                    email,
                    ...(passwordhash && { passwordhash }),
                    role,
                    updatedat: new Date()
                },
                select: {
                    accountid: true,
                    tenantid: true,
                    username: true,
                    email: true,
                    role: true,
                    createdat: true,
                    updatedat: true
                }
            });
            
            res.json(updatedAccount);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi cập nhật tenant account' });
        }
    },

    // Xóa tenant account
    deleteAccount: async (req, res) => {
        try {
            const { id } = req.params;
            const { role: userRole, tenantid: userTenantId } = req.user;

            // Lấy thông tin account cần xóa
            const accountToDelete = await prisma.tenantAccounts.findUnique({
                where: { accountid: parseInt(id) }
            });

            if (!accountToDelete) {
                return res.status(404).json({ error: 'Không tìm thấy account' });
            }

            // Kiểm tra quyền xóa
            if (userRole !== 'superadmin' && accountToDelete.tenantid !== userTenantId) {
                return res.status(403).json({ error: 'Không có quyền xóa account này' });
            }

            // Không cho phép xóa admin account cuối cùng của tenant
            if (accountToDelete.role === 'admin') {
                const adminCount = await prisma.tenantAccounts.count({
                    where: {
                        tenantid: accountToDelete.tenantid,
                        role: 'admin'
                    }
                });

                if (adminCount <= 1) {
                    return res.status(400).json({ 
                        error: 'Không thể xóa admin account cuối cùng của tenant' 
                    });
                }
            }

            await prisma.tenantAccounts.delete({
                where: { accountid: parseInt(id) }
            });
            
            res.json({ message: 'Đã xóa tenant account thành công' });
        } catch (error) {
            res.status(500).json({ error: 'Lỗi khi xóa tenant account' });
        }
    }
};

module.exports = tenantAccountsController;