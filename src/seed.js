const { prisma } = require('./prisma');
const { Prisma } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function seed() {
    try {
        const salt = await bcrypt.genSalt(10);

        // === Plans (Prebuilt + Custom) ===
        // Hidden Free (không hiển thị, dùng nội bộ)
        const hiddenFreePlan = await prisma.plans.upsert({
            where: { planname: 'Hidden Free' },
            update: {
                intro: 'Gói mặc định 0đ (ẩn)',
                description: 'Dùng để khởi tạo tenant khi không chọn gói',
                price: new Prisma.Decimal(0),
                durationmonths: 1,
                updatedat: new Date()
            },
            create: {
                planname: 'Hidden Free',
                intro: 'Gói mặc định 0đ (ẩn)',
                description: 'Dùng để khởi tạo tenant khi không chọn gói',
                price: new Prisma.Decimal(0),
                durationmonths: 1
            }
        });

        const prebuiltPlan = await prisma.plans.upsert({
            where: { planname: 'Prebuilt' },
            update: {
                intro: 'Gói có sẵn kèm bộ template HTML dựng sẵn',
                description: 'Chọn nhanh một template và xuất bản ngay',
                price: new Prisma.Decimal(0),
                durationmonths: 1,
                updatedat: new Date()
            },
            create: {
                planname: 'Prebuilt',
                intro: 'Gói có sẵn kèm bộ template HTML dựng sẵn',
                description: 'Chọn nhanh một template và xuất bản ngay',
                price: new Prisma.Decimal(0),
                durationmonths: 1
            }
        });

        const customPlan = await prisma.plans.upsert({
            where: { planname: 'Custom' },
            update: {
                intro: 'Gói tùy biến toàn bộ giao diện',
                description: 'Khách hàng tự sáng tạo, chỉnh sửa HTML/Handlebars tùy ý',
                price: new Prisma.Decimal(150000),
                durationmonths: 1,
                updatedat: new Date()
            },
            create: {
                planname: 'Custom',
                intro: 'Gói tùy biến toàn bộ giao diện',
                description: 'Khách hàng tự sáng tạo, chỉnh sửa HTML/Handlebars tùy ý',
                price: new Prisma.Decimal(150000),
                durationmonths: 1
            }
        });

        console.log('Plans ensured:', { hiddenFreePlanId: hiddenFreePlan.planid, prebuiltPlanId: prebuiltPlan.planid, customPlanId: customPlan.planid });

        // === Templates for Prebuilt plan ===
        const ensureTemplate = async (name, htmlcontent, description = '') => {
            const existing = await prisma.templates.findFirst({
                where: { planid: prebuiltPlan.planid, name }
            });
            if (!existing) {
                await prisma.templates.create({
                    data: {
                        planid: prebuiltPlan.planid,
                        name,
                        description,
                        htmlcontent
                    }
                });
                console.log('Created template for Prebuilt:', name);
            }
        };

        const basicLandingHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset=\"UTF-8\" />
  <title>{{title}}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
    header { background: #1d4ed8; color: #fff; padding: 32px; text-align: center; }
    section { padding: 24px; }
    .stats { display: flex; gap: 16px; }
    .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; flex: 1; }
    footer { background: #0f172a; color: #fff; padding: 16px; text-align: center; }
  </style>
  </head>
<body>
  <header>
    <h1>{{title}}</h1>
    <p>{{subtitle}}</p>
  </header>
  <section>
    <h2>Giới thiệu</h2>
    <p>{{intro}}</p>
    <div class=\"stats\">
      <div class=\"card\">
        <strong>Khoa/Phòng</strong>
        <div>{{departmentsCount}}+</div>
      </div>
      <div class=\"card\">
        <strong>Giảng viên</strong>
        <div>{{lecturersCount}}+</div>
      </div>
      <div class=\"card\">
        <strong>Chương trình</strong>
        <div>{{programsCount}}+</div>
      </div>
    </div>
  </section>
  <section>
    <h2>Tin tức mới</h2>
    <ul>
      {{#each news}}
        <li><strong>{{this.title}}</strong>: {{this.summary}}</li>
      {{/each}}
    </ul>
  </section>
  <footer>© {{year}} {{title}}. Powered by SaaS Platform.</footer>
</body>
</html>
        `;

        await ensureTemplate(
            'University Landing',
            basicLandingHtml,
            'Trang đích trường/khoa sẵn có (Handlebars data binding)'
        );

        // === Super Admin ===
        const passwordHash = await bcrypt.hash('admin123', salt);
        const superAdmin = await prisma.superAdmin.upsert({
            where: { email: 'admin@system.com' },
            update: {},
            create: {
                username: 'superadmin',
                email: 'admin@system.com',
                passwordhash: passwordHash,
                role: 'superadmin'
            }
        });

        console.log('Super Admin ready:', {
            username: superAdmin.username,
            email: superAdmin.email
        });

        // === Demo Tenant & Admin ===
        let tenant = await prisma.tenants.findFirst({ where: { tenantname: 'Demo University' } });
        if (!tenant) {
            tenant = await prisma.tenants.create({
                data: {
                    tenantname: 'Demo University',
                    domain: 'demo.edu',
                    email: 'contact@demo.edu',
                    phone: '0123456789',
                    address: '123 Demo Street',
                    status: 'active'
                }
            });
            console.log('Created Demo Tenant:', { id: tenant.tenantid, name: tenant.tenantname });
        }

        const tenantAdminPassword = await bcrypt.hash('tenant123', salt);
        const tenantAdmin = await prisma.tenantAccounts.upsert({
            where: { email: 'admin@demo.edu' },
            update: {},
            create: {
                tenantid: tenant.tenantid,
                username: 'tenantadmin',
                email: 'admin@demo.edu',
                passwordhash: tenantAdminPassword,
                role: 'admin'
            }
        });
        console.log('Tenant Admin ready:', { username: tenantAdmin.username, email: tenantAdmin.email });

        // Subscription for demo tenant on Prebuilt
        const existingSub = await prisma.subscriptions.findFirst({
            where: { tenantid: tenant.tenantid, planid: prebuiltPlan.planid }
        });
        if (!existingSub) {
            const start = new Date();
            const end = new Date(start);
            end.setMonth(start.getMonth() + prebuiltPlan.durationmonths);
            await prisma.subscriptions.create({
                data: {
                    tenantid: tenant.tenantid,
                    planid: prebuiltPlan.planid,
                    startdate: start,
                    enddate: end,
                    status: 'active'
                }
            });
            console.log('Created subscription for Demo Tenant (Prebuilt)');
        }

        // Copy templates to demo tenant if not exists
        const tenantTemplateCount = await prisma.tenantTemplates.count({ where: { tenantid: tenant.tenantid } });
        if (tenantTemplateCount === 0) {
            const templates = await prisma.templates.findMany({ where: { planid: prebuiltPlan.planid } });
            for (const tpl of templates) {
                await prisma.tenantTemplates.create({
                    data: {
                        tenantid: tenant.tenantid,
                        templateid: tpl.templateid,
                        name: tpl.name,
                        htmlcontent: tpl.htmlcontent,
                        slug: `demo-${tpl.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
                        data: {
                            title: 'Demo University',
                            subtitle: 'Nền tảng số dành cho trường/khoa',
                            intro: 'Giới thiệu ngắn gọn về trường/khoa của bạn.',
                            departmentsCount: 5,
                            lecturersCount: 120,
                            programsCount: 12,
                            news: [{ title: 'Thông báo nhập học', summary: 'Lịch nhập học kỳ mới và hướng dẫn tân sinh viên.' }],
                            year: new Date().getFullYear()
                        }
                    }
                });
            }
            console.log('Copied Prebuilt templates to Demo Tenant');
        }

        console.log('\nInitial Credentials:');
        console.log('1. Super Admin:');
        console.log('   - Email: admin@system.com');
        console.log('   - Password: admin123');
        console.log('\n2. Tenant Admin:');
        console.log('   - Email: admin@demo.edu');
        console.log('   - Password: tenant123');

    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
