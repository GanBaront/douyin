// 补抓单条视频的评论
const { launch } = require('./browser.cjs');
const fs = require('fs');
const path = require('path');
const id = process.argv[2];
const outDir = process.argv[3];
(async () => {
  const ctx = await launch(true);
  const page = await ctx.newPage();
  const batches = [];
  page.on('response', async (r) => {
    try {
      if (r.url().includes('/aweme/v1/web/comment/list/')) {
        const j = await r.json();
        if (j && j.comments && j.comments.length) batches.push(j);
      }
    } catch (e) {}
  });
  await page.goto('https://www.douyin.com/video/' + id, { waitUntil: 'domcontentloaded', timeout: 30000 });
  for (let i = 0; i < 16; i++) {
    await page.waitForTimeout(500);
    if (batches.length) break;
  }
  await page.mouse.wheel(0, 2500);
  await page.waitForTimeout(2500);
  const seen = new Set();
  const comments = [];
  for (const b of batches) {
    for (const c of b.comments || []) {
      if (!c.cid || seen.has(c.cid)) continue;
      seen.add(c.cid);
      comments.push({
        comment_id: c.cid, create_time: c.create_time, ip_location: '', aweme_id: id,
        content: c.text, is_author_digged: false, is_folded: false, is_hot: Number(c.digg_count) > 1000,
        user_buried: false, user_digged: 0, digg_count: String(c.digg_count), user_id: '', sec_uid: '',
        short_user_id: '', user_unique_id: '', user_signature: '',
        nickname: (c.user && c.user.nickname) || '抖音用户',
        avatar: (c.user && c.user.avatar_168x168 && c.user.avatar_168x168.url_list[0]) || '',
        sub_comment_count: c.reply_comment_total || 0, last_modify_ts: Date.now()
      });
      if (comments.length >= 30) break;
    }
    if (comments.length >= 30) break;
  }
  const json = JSON.stringify(comments, null, 2);
  fs.writeFileSync(path.join(outDir, 'video_id_' + id + '.json'), json);
  fs.writeFileSync(path.join(outDir, 'video_id_' + id + '.md'), json);
  console.log('[retry] saved', comments.length, 'comments for', id);
  await ctx.close().catch(() => {});
  process.exit(0);
})();
