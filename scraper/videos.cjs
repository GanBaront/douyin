// 阶段1：抓取 5 位博主主页的视频列表（拦截页面自身的 /user/post/ 接口响应）
const { launch } = require('./browser.cjs');
const fs = require('fs');
const path = require('path');

const OUT = path.resolve(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });

const BLOGGERS = [
  { uid: '9900000012', nickname: '小爱是也', sec: 'MS4wLjABAAAA0SIyL88oqM3THZdXen0Ygw8SWznebv-zlviXVmo21xA' },
  { uid: '9900000013', nickname: '吃啥呢给我也来一口', sec: 'MS4wLjABAAAAQibgKYA1Tx0lMhNAEvd5KDlGelOWLWCv8ZQcjN7r-7M' },
  { uid: '9900000014', nickname: '易梦玲', sec: 'MS4wLjABAAAAvpXNvV03ZPRsTM5SlxVVQPoI3YInirJQyzy6U1pwfmc' },
  { uid: '9900000015', nickname: '方圆', sec: 'MS4wLjABAAAAgVBpvqJSx6v2JPvoHc7fd383yacjuIAPBBrVSNmS-l4' },
  { uid: '9900000016', nickname: 'Real机智张', sec: 'MS4wLjABAAAAQTAK0xJUnVyLDIp38HBkAGkRPECaVHmKZE5d2MMywek' }
];

const MAX_PER_BLOGGER = 100; // 每位最多抓 100 条

async function scrapeBlogger(ctx, b) {
  const page = await ctx.newPage();
  const responses = [];
  const profile = { data: null };
  page.on('response', async (r) => {
    const url = r.url();
    try {
      if (url.includes('/aweme/v1/web/aweme/post/')) {
        const j = await r.json();
        if (j && j.aweme_list) responses.push(j);
      } else if (url.includes('/aweme/v1/web/user/profile/other/')) {
        const j = await r.json();
        if (j && j.user) profile.data = j.user;
      }
    } catch (e) {}
  });

  await page.goto('https://www.douyin.com/user/' + b.sec, {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });
  await page.waitForTimeout(4000);

  // 检测验证码
  const bodyText = (await page.textContent('body').catch(() => '')) || '';
  if (bodyText.includes('验证') && bodyText.length < 300) {
    console.log(`[${b.nickname}] ⚠️ 检测到验证码，请在浏览器窗口手动完成（60s 超时）`);
    await page.waitForTimeout(60000);
  }

  // 滚动加载，最多 40 轮
  for (let i = 0; i < 40; i++) {
    const count = new Set(
      responses.flatMap((r) => (r.aweme_list || []).map((a) => a.aweme_id))
    ).size;
    if (count >= MAX_PER_BLOGGER) break;
    await page.mouse.wheel(0, 3000);
    await page.waitForTimeout(1800);
    if (i % 5 === 4) console.log(`[${b.nickname}] 已滚动 ${i + 1} 轮，当前 ${count} 条`);
  }
  await page.waitForTimeout(2000);

  // 去重
  const seen = new Set();
  const videos = [];
  for (const r of responses) {
    for (const a of r.aweme_list || []) {
      if (!a.aweme_id || seen.has(a.aweme_id)) continue;
      if (a.images && !a.video) continue; // 跳过图集
      seen.add(a.aweme_id);
      videos.push(a);
    }
  }
  const stat = profile.data
    ? {
        nickname: profile.data.nickname,
        signature: profile.data.signature,
        follower_count: profile.data.follower_count,
        total_favorited: profile.data.total_favorited,
        aweme_count: profile.data.aweme_count,
        gender: profile.data.gender,
        city: profile.data.city,
        province: profile.data.province,
        country: profile.data.country,
        avatar_168x168: profile.data.avatar_168x168,
        avatar_300x300: profile.data.avatar_300x300,
        cover_url: profile.data.cover_url,
        white_cover_url: profile.data.white_cover_url
      }
    : null;

  const dir = path.join(OUT, b.uid);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'videos.json'), JSON.stringify(videos));
  if (stat) fs.writeFileSync(path.join(dir, 'profile.json'), JSON.stringify(stat));
  console.log(`[${b.nickname}] ✓ 抓到 ${videos.length} 条视频，资料${stat ? ' ✓' : ' ✗'}`);
  await page.close();
  return videos.length;
}

(async () => {
  const ctx = await launch(true);
  const result = {};
  for (const b of BLOGGERS) {
    try {
      result[b.nickname] = await scrapeBlogger(ctx, b);
    } catch (e) {
      console.log(`[${b.nickname}] ✗ 失败: ${e.message}`);
      result[b.nickname] = 0;
    }
  }
  console.log('[phase1] DONE', JSON.stringify(result));
  await ctx.close().catch(() => {});
  process.exit(0);
})();
