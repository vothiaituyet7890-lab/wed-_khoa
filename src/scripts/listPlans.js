const { prisma } = require('../prisma');

(async () => {
  try {
    const p = await prisma.plans.findMany();
    console.log(p.map(x => ({ planid: x.planid, planname: x.planname })));
  } catch (e) {
    console.error('Err', e);
  } finally {
    await prisma.$disconnect();
  }
})();
