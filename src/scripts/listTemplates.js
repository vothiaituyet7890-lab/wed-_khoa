const { prisma } = require('../prisma');

(async () => {
  try {
    const t = await prisma.templates.findMany();
    console.log(t.map(x => ({ planid: x.planid, name: x.name, templateid: x.templateid })));
  } catch (e) {
    console.error('Err', e);
  } finally {
    await prisma.$disconnect();
  }
})();
