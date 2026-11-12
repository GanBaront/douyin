// 生产构建复现 v3：原始文件可达性 + 点击评论按钮
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
  await new Promise((r) => server.listen(18082, r));
  const ctx = await launch(false);
  const page = await ctx.newPage();
  const net = [];
  page.on('response', (r) => {
    const u = r.url();
    if (u.includes('/data/comments') || u.includes('/data/videos')) net.push(r.status() + ' ' + u.slice(-80));
  });
  page.on('pageerror', (e) => net.push('PAGEERROR: ' + e.message.slice(0, 150)));

  await page.goto('http://localhost:18082/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);

  // 1. 页面内直接 fetch 评论文件（json 和 md 两种）
  const probe = await page.evaluate(async () => {
    const id = '6686589698707590411';
    const out = {};
    for (const ext of ['.json', '.md']) {
      try {
        const r = await fetch('/data/comments/video_id_' + id + ext);
        const t = await r.text();
        out[ext] = r.status + ' len=' + t.length + ' head=' + t.slice(0, 40);
      } catch (e) {
        out[ext] = 'FETCH-ERROR: ' + e.message.slice(0, 60);
      }
    }
    return out;
  });
  console.log('[原始文件探测]', JSON.stringify(probe, null, 1));

  // 2. 进入详情页并点评论按钮
  await page.evaluate(() => {
    const els = [...document.querySelectorAll('a,div,span')].filter(
      (el) => el.textContent.trim() === '我' && el.children.length <= 2
    );
    els[els.length - 1].click();
  });
  await page.waitForTimeout(2500);
  const poster = await page.$('.poster-item, .poster');
  await poster.click();
  await page.waitForTimeout(3500);

  const clicked = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('.message.mb2r, .message')];
    if (btns.length) {
      btns[0].click();
      return 'clicked .message ×1 (共' + btns.length + '个)';
    }
    return 'NO .message FOUND';
  });
  console.log('[评论按钮]', clicked);
  await page.waitForTimeout(3500);

  const text = await page.evaluate(() => {
    const panel = document.querySelector('.comment-panel, [class*="comment"]');
    return document.body.innerText.slice(0, 300);
  });
  console.log('--- 页面文本:', text.replace(/\n+/g, '|').slice(0, 220));
  console.log('--- 评论相关请求:');
  net.filter((x) => x.includes('comments')).slice(0, 8).forEach((x) => console.log('  ', x));
  net.filter((x) => x.startsWith('PAGEERROR')).slice(0, 3).forEach((x) => console.log('  ', x));

  await ctx.close().catch(() => {});
  server.close();
  process.exit(0);
})();
