// 生产构建复现 v2：走 我→作品→详情页 路径，检查评论面板
const { launch } = require('./browser.cjs');
const http = require('http');
const fs = require('fs');
const path = require('path');

const DIST = path.resolve(__dirname, '..', 'dist');
const MIME = { '.json': 'application/json', '.html': 'text/html', '.js': 'text/javascript', '.md': 'application/octet-stream' };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  let file = path.join(DIST, p);
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(DIST, 'index.html');
  res.setHeader('Content-Type', MIME[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});

(async () => {
  await new Promise((r) => server.listen(18081, r));
  const ctx = await launch(false);
  const page = await ctx.newPage();
  const failed = [];
  page.on('response', (r) => {
    const u = r.url();
    if (u.includes('/data/comments') || u.includes('/data/videos') || r.status() >= 400)
      failed.push(r.status() + ' ' + u.slice(-75));
  });
  page.on('pageerror', (e) => failed.push('PAGEERROR: ' + e.message.slice(0, 150)));

  await page.goto('http://localhost:18081/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);

  // 底部 tab：我
  await page.evaluate(() => {
    const els = [...document.querySelectorAll('a,div,span')].filter(
      (el) => el.textContent.trim() === '我' && el.children.length <= 2
    );
    els[els.length - 1].click();
  });
  await page.waitForTimeout(3000);

  // 点第一个作品
  const poster = await page.$('.poster-item, .poster');
  if (poster) {
    await poster.click();
    await page.waitForTimeout(4000);
    console.log('URL:', page.url());
    const text = await page.evaluate(() => document.body.innerText.slice(0, 400));
    console.log('--- 页面文本:', text.replace(/\n+/g, '|').slice(0, 260));
  } else {
    console.log('未找到作品九宫格');
  }
  console.log('--- 网络记录:');
  failed.slice(0, 15).forEach((f) => console.log('  ', f));
  if (!failed.length) console.log('   （无失败）');

  await ctx.close().catch(() => {});
  server.close();
  process.exit(0);
})();
