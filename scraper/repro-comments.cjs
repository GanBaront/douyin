// 生产构建复现：评论区请求失败诊断
const { launch } = require('./browser.cjs');
const http = require('http');
const fs = require('fs');
const path = require('path');

const DIST = path.resolve(__dirname, '..', 'dist');
const MIME = { '.json': 'application/json', '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.md': 'application/octet-stream', '.wasm': 'application/wasm' };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  let file = path.join(DIST, p);
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    file = path.join(DIST, 'index.html'); // SPA fallback
  }
  res.setHeader('Content-Type', MIME[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});

(async () => {
  await new Promise((r) => server.listen(18080, r));
  const ctx = await launch(false);
  const page = await ctx.newPage();
  const failed = [];
  page.on('response', (r) => {
    if (r.url().includes('/data/comments') || r.status() >= 400)
      failed.push(r.status() + ' ' + r.url().slice(-70));
  });
  page.on('pageerror', (e) => failed.push('PAGEERROR: ' + e.message.slice(0, 120)));

  await page.goto('http://localhost:18080/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);
  await page.mouse.click(690, 450); // 触发播放
  await page.waitForTimeout(2500);

  // 打开评论区
  await page.evaluate(() => {
    const icons = [...document.querySelectorAll('svg, .message, [class*="comment"]')];
    // 点击评论按钮（右侧栏）
    const msg = document.querySelector('.message, [class*="message mb2r"]');
    if (msg) msg.click();
  });
  await page.waitForTimeout(3500);

  const text = await page.evaluate(() => document.body.innerText.slice(0, 500));
  console.log('--- 页面文本片段:', text.replace(/\n+/g, '|').slice(0, 200));
  console.log('--- 失败/异常记录:');
  failed.slice(0, 10).forEach((f) => console.log('  ', f));
  if (!failed.length) console.log('   （无失败请求）');

  await ctx.close().catch(() => {});
  server.close();
  process.exit(0);
})();
