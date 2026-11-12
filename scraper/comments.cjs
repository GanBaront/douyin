// 阶段2：逐条视频抓取真实评论（拦截 /comment/list/ 响应），支持断点续跑
const { launch } = require('./browser.cjs');
const fs = require('fs');
const path = require('path');

const OUT = path.resolve(__dirname, 'out');
const BLOGGERS = [
  { uid: '9900000012', nickname: '小爱是也' },
  { uid: '9900000013', nickname: '吃啥呢给我也来一口' },
  { uid: '9900000014', nickname: '易梦玲' },
  { uid: '9900000015', nickname: '方圆' },
  { uid: '9900000016', nickname: 'Real机智张' }
];
const MAX_COMMENTS = 30; // 每条视频最多抓 30 条顶级评论

async function scrapeVideoComments(ctx, awemeId, outDir) {
  const file = path.join(outDir, awemeId + '.json');
  if (fs.existsSync(file)) return 'skip';
  const page = await ctx.newPage();
  const batches = [];
  let got = false;
  page.on('response', async (r) => {
    try {
      if (r.url().includes('/aweme/v1/web/comment/list/') && r.request().resourceType() === 'xhr') {
        const j = await r.json();
        if (j && j.comments && j.comments.length) batches.push(j);
      }
    } catch (e) {}
  });
  try {
    await page.goto('https://www.douyin.com/video/' + awemeId, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    // 等评论接口返回（最多 8s）
    for (let i = 0; i < 16 && !got; i++) {
      await page.waitForTimeout(500);
      got = batches.some((b) => b.comments && b.comments.length);
    }
    // 再滚动一次加载更多评论
    if (got) {
      await page.mouse.wheel(0, 2500);
      await page.waitForTimeout(2500);
    }
  } catch (e) {
    await page.close().catch(() => {});
    return 'error:' + e.message.slice(0, 60);
  }
  // 合并去重
  const seen = new Set();
  const comments = [];
  for (const b of batches) {
    for (const c of b.comments || []) {
      if (!c.cid || seen.has(c.cid)) continue;
      seen.add(c.cid);
      comments.push({
        cid: c.cid,
        text: c.text,
        digg_count: c.digg_count,
        create_time: c.create_time,
        user: {
          nickname: c.user && c.user.nickname,
          avatar: c.user && c.user.avatar_168x168 && c.user.avatar_168x168.url_list
            ? c.user.avatar_168x168.url_list[0]
            : undefined
        },
        reply_comment_total: c.reply_comment_total
      });
      if (comments.length >= MAX_COMMENTS) break;
    }
    if (comments.length >= MAX_COMMENTS) break;
  }
  fs.writeFileSync(file, JSON.stringify(comments));
  await page.close().catch(() => {});
  return comments.length;
}

(async () => {
  const ctx = await launch(true);
  const summary = {};
  for (const b of BLOGGERS) {
    const vFile = path.join(OUT, b.uid, 'videos.json');
    if (!fs.existsSync(vFile)) continue;
    const list = JSON.parse(fs.readFileSync(vFile, 'utf8'));
    const outDir = path.join(OUT, b.uid, 'comments');
    fs.mkdirSync(outDir, { recursive: true });
    let ok = 0, skip = 0, err = 0, empty = 0;
    for (let i = 0; i < list.length; i++) {
      const r = await scrapeVideoComments(ctx, list[i].aweme_id, outDir);
      if (r === 'skip') skip++;
      else if (typeof r === 'number' && r > 0) ok++;
      else if (r === 0) empty++;
      else { err++; }
      if ((i + 1) % 10 === 0)
        console.log(`[${b.nickname}] ${i + 1}/${list.length} (成功${ok} 空${empty} 错${err} 跳${skip})`);
    }
    summary[b.nickname] = `${ok}成功/${empty}空/${err}错/${skip}跳`;
    console.log(`[${b.nickname}] ✓ 完成 ${summary[b.nickname]}`);
  }
  console.log('[phase2] DONE', JSON.stringify(summary));
  await ctx.close().catch(() => {});
  process.exit(0);
})();
