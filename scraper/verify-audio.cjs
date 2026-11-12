// 验证双音频修复：首页→我→视频B→返回首页(A应恢复)→我→视频C→全程只允许1个视频在播
const { launch } = require('./browser.cjs');
(async () => {
  const ctx = await launch(false);
  const page = await ctx.newPage();
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);

  const playing = () =>
    page.evaluate(() =>
      [...document.querySelectorAll('video')].filter(
        (v) => !v.paused && !v.ended && v.readyState > 2
      ).length
    );

  const goTab = async (label) => {
    await page.evaluate((t) => {
      const els = [...document.querySelectorAll('a,div,span')].filter(
        (el) => el.textContent.trim() === t && el.children.length <= 2
      );
      if (els.length) els[els.length - 1].click();
    }, label);
    await page.waitForTimeout(2000);
  };

  if (!(await playing())) {
    await page.mouse.click(690, 450);
    await page.waitForTimeout(2500);
  }
  console.log('[1 首页播放] 在播视频数:', await playing());

  await goTab('我');
  console.log('[2 进入我的] 在播视频数(应为0):', await playing());

  const poster = await page.$('.poster-item, .poster');
  await poster.click();
  await page.waitForTimeout(3500);
  console.log('[3 点击视频B] 在播视频数(应为1):', await playing(), '| URL:', page.url());

  await page.goBack();
  await page.waitForTimeout(2500);
  console.log('[4 返回我的] 在播视频数(应为0):', await playing());

  await goTab('首页');
  await page.waitForTimeout(2500);
  console.log('[5 回首页] 在播视频数(应为1,A恢复):', await playing());

  await goTab('我');
  console.log('[6 再进我的] 在播视频数(应为0):', await playing());

  const poster2 = await page.$('.poster-item:nth-child(2), .poster');
  await poster2.click();
  await page.waitForTimeout(3500);
  console.log('[7 点击视频C] 在播视频数(应为1):', await playing());

  await ctx.close().catch(() => {});
  process.exit(0);
})();
