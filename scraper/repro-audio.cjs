// 复现双音频 bug：首页播放 → 进我的页面 → 点视频 → 检查有几个 video 在播放
const { launch } = require('./browser.cjs');
(async () => {
  const ctx = await launch(false); // 无头即可
  const page = await ctx.newPage();
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);

  const countPlaying = () =>
    page.evaluate(() =>
      [...document.querySelectorAll('video')]
        .map((v) => ({
          playing: !v.paused && !v.ended && v.readyState > 2,
          muted: v.muted,
          src: (v.currentSrc || v.src || '').slice(0, 60)
        }))
        .filter((x) => x.playing)
    );

  // 首页视频自动播放检测
  let playing = await countPlaying();
  console.log('[首页] 播放中的视频:', JSON.stringify(playing));
  if (!playing.length) {
    // 需要一次交互触发播放
    await page.mouse.click(690, 450);
    await page.waitForTimeout(2500);
    playing = await countPlaying();
    console.log('[首页-点击后] 播放中的视频:', JSON.stringify(playing));
  }

  // 进入我的页面
  await page.evaluate(() => {
    const links = [...document.querySelectorAll('a,div,span')].filter(
      (el) => el.textContent.trim() === '我' && el.children.length <= 2
    );
    if (links.length) links[links.length - 1].click();
  });
  await page.waitForTimeout(2500);
  console.log('[我的页面] 当前URL:', page.url());
  playing = await countPlaying();
  console.log('[我的页面] 播放中的视频:', JSON.stringify(playing));

  // 点击作品集第一个视频
  const poster = await page.$('.poster-item, .poster');
  if (poster) {
    await poster.click();
    await page.waitForTimeout(4000);
    console.log('[视频详情] 当前URL:', page.url());
    playing = await countPlaying();
    console.log('[视频详情] 播放中的视频数:', playing.length, JSON.stringify(playing, null, 1));
  } else {
    console.log('[视频详情] 未找到作品九宫格');
  }
  await ctx.close().catch(() => {});
  process.exit(0);
})();
