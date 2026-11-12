// 诊断：打开一位博主主页，记录所有 XHR 请求 URL
const { launch } = require('./browser.cjs');
const fs = require('fs');
(async () => {
  const ctx = await launch(true);
  const page = await ctx.newPage();
  const urls = [];
  page.on('request', (r) => {
    const u = r.url();
    if (u.includes('aweme') || u.includes('post') || u.includes('comment')) {
      urls.push(u.split('?')[0]);
    }
  });
  await page.goto(
    'https://www.douyin.com/user/MS4wLjABAAAAvpXNvV03ZPRsTM5SlxVVQPoI3YInirJQyzy6U1pwfmc',
    { waitUntil: 'domcontentloaded', timeout: 60000 }
  );
  await page.waitForTimeout(5000);
  for (let i = 0; i < 3; i++) {
    await page.mouse.wheel(0, 3000);
    await page.waitForTimeout(2000);
  }
  const counts = {};
  urls.forEach((u) => (counts[u] = (counts[u] || 0) + 1));
  fs.writeFileSync('scraper/out/diag.json', JSON.stringify(counts, null, 2));
  console.log('[diag] 完成，共', urls.length, '个请求');
  await ctx.close().catch(() => {});
  process.exit(0);
})();
