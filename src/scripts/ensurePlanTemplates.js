const { prisma } = require('../prisma');

async function upsert() {
  try {
    const plans = [
      { planname: 'Basic', intro: 'Gói Basic: website đơn giản', description: 'Gói Basic cung cấp giao diện đơn giản để bắt đầu.', price: 0, durationmonths: 12 },
      { planname: 'Professional', intro: 'Gói Professional: nhiều tính năng hơn', description: 'Professional dành cho các đơn vị cần trang tin và chương trình.', price: 49.99, durationmonths: 12 },
      { planname: 'Premium', intro: 'Gói Premium: đầy đủ và tuỳ chỉnh', description: 'Premium cho doanh nghiệp/đại học cần cấu hình riêng.', price: 199.99, durationmonths: 12 }
    ];

    for (const p of plans) {
      let plan = await prisma.plans.findFirst({ where: { planname: p.planname } });
      if (plan) {
        plan = await prisma.plans.update({ where: { planid: plan.planid }, data: { intro: p.intro, description: p.description, price: p.price, durationmonths: p.durationmonths, updatedat: new Date() } });
      } else {
        plan = await prisma.plans.create({ data: { planname: p.planname, intro: p.intro, description: p.description, price: p.price, durationmonths: p.durationmonths } });
      }

      // create template for this plan if not exists
      const existing = await prisma.templates.findFirst({ where: { planid: plan.planid } });
      if (!existing) {
        let html = '';
        if (p.planname === 'Basic') {
          html = `<!doctype html><html><head><meta charset="utf-8"><title>{{title}}</title><style>body{font-family:Arial;padding:20px}header{border-bottom:1px solid #eee;padding-bottom:12px;margin-bottom:18px}footer{margin-top:24px;color:#666}</style></head><body><header><h1>{{title}}</h1><p>{{tagline}}</p></header><main><h2>About</h2><p>{{description}}</p></main><footer>Contact: {{contactEmail}}</footer></body></html>`;
        } else if (p.planname === 'Professional') {
          html = `<!doctype html><html><head><meta charset="utf-8"><title>{{title}}</title><style>body{font-family:Helvetica,Arial;margin:0} .hero{background:#0047b3;color:#fff;padding:40px;text-align:center} .container{padding:20px} .cards{display:flex;gap:12px} .card{flex:1;border:1px solid #ddd;padding:12px;border-radius:6px}</style></head><body><div class="hero"><h1>{{title}}</h1><p>{{subtitle}}</p></div><div class="container"><section class="cards"><div class="card"><h3>News</h3><p>{{newsSnippet}}</p></div><div class="card"><h3>Programs</h3><p>{{programSnippet}}</p></div><div class="card"><h3>Contact</h3><p>{{contact}}</p></div></section></div></body></html>`;
        } else { // Premium
          html = `<!doctype html><html><head><meta charset="utf-8"><title>{{title}}</title><style>body{font-family:Inter,Arial;margin:0;background:#f6f7fb} .nav{background:#111;color:#fff;padding:12px} .wrap{max-width:1000px;margin:24px auto;background:#fff;padding:20px;border-radius:8px} .hero{display:flex;gap:20px} .btn{display:inline-block;padding:8px 14px;background:#0066ff;color:#fff;border-radius:6px;text-decoration:none}</style></head><body><div class="nav">{{siteName}}</div><div class="wrap"><div class="hero"><div><h1>{{title}}</h1><p>{{subtitle}}</p><a class="btn" href="#contact">Liên hệ</a></div><div><img src="{{heroImage}}" alt="hero" style="max-width:300px;border-radius:6px"/></div></div><section><h2>Highlights</h2><p>{{highlights}}</p></section></div></body></html>`;
        }

        await prisma.templates.create({ data: { planid: plan.planid, name: `${p.planname} Starter`, description: `Template mặc định cho ${p.planname}`, htmlcontent: html } });
        console.log('Created template for plan', p.planname);
      } else {
        console.log('Template already exists for plan', p.planname);
      }
    }

    console.log('Plan templates ensured.');
  } catch (err) {
    console.error('Error ensuring plan templates', err);
  } finally {
    await prisma.$disconnect();
  }
}

upsert();
