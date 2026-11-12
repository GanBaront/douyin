// 拉起 Edge（持久化 profile），打开抖音让用户登录；轮询登录态
const { launch } = require('./browser.cjs');
(async () => {
  const ctx = await launch(true);
  const page = ctx.pages()[0] || (await ctx.newPage());
  await page.goto('https://www.douyin.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  console.log('[login] Edge 已打开 douyin.com，请在窗口里登录（扫码/验证码均可）');
  let ok = false;
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    try {
      const cookies = await ctx.cookies('https://www.douyin.com');
      if (cookies.some((c) => c.name === 'sessionid' || c.name === 'sessionid_ss')) {
        console.log('[login] 登录成功 ✓');
        ok = true;
        break;
      }
      if (i % 6 === 5) console.log('[login] 等待登录中...', (i + 1) * 5 + 's');
    } catch (e) {}
  }
  console.log(ok ? '[login] DONE' : '[login] TIMEOUT：5分钟未检测到登录，可重跑本脚本继续等');
  await ctx.close().catch(() => {});
  process.exit(ok ? 0 : 2);
})();
