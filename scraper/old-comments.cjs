// 阶段4：为原 11 位博主的 144 条视频抓取真实评论（覆盖此前的随机拷贝）
const { launch } = require('./browser.cjs');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CDIR = path.join(ROOT, 'public/data/comments');
// 这 16 条视频的评论文件本来就是真实的，跳过不覆盖
const KEEP = new Set(['6686589698707590411','6826943630775831812','6882368275695586568','6923214072347512068','7000587983069957383','7005490661592026405','7110263965858549003','7128686458763889956','7161000281575148800','7194815099381484860','7260749400622894336','7267478481213181238','7270431418822446370','7293100687989148943','7295697246132227343','7321200290739326262']);

(async () => {
  const videos = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/data/videos.json'), 'utf8'));
  const targets = videos.filter((v) => {
    const uid = String(v.author_user_id);
    return uid >= '9900000001' && uid <= '9900000011' && !KEEP.has(String(v.aweme_id));
  });
  console.log('[old-comments] 目标视频:', targets.length);

  const ctx = await launch(true);
  const page = await ctx.newPage();
  let ok = 0, empty = 0, err = 0;

  for (let i = 0; i < targets.length; i++) {
    const v = targets[i];
    const id = String(v.aweme_id);
    const batches = [];
    const handler = async (r) => {
      try {
        if (r.url().includes('/aweme/v1/web/comment/list/')) {
          const j = await r.json();
          if (j && j.comments && j.comments.length) batches.push(j);
        }
      } catch (e) {}
    };
    page.on('response', handler);
    try {
      await page.goto('https://www.douyin.com/video/' + id, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });
      let got = false;
      for (let t = 0; t < 16 && !got; t++) {
        await page.waitForTimeout(500);
        got = batches.some((b) => b.comments && b.comments.length);
      }
      await page.mouse.wheel(0, 2500);
      await page.waitForTimeout(2200);

      const seen = new Set();
      const comments = [];
      for (const b of batches) {
        for (const c of b.comments || []) {
          if (!c.cid || seen.has(c.cid)) continue;
          seen.add(c.cid);
          comments.push({
            comment_id: c.cid,
            create_time: c.create_time,
            ip_location: '',
            aweme_id: id,
            content: c.text,
            is_author_digged: false,
            is_folded: false,
            is_hot: Number(c.digg_count) > 1000,
            user_buried: false,
            user_digged: 0,
            digg_count: String(c.digg_count),
            user_id: '',
            sec_uid: '',
            short_user_id: '',
            user_unique_id: '',
            user_signature: '',
            nickname: (c.user && c.user.nickname) || '抖音用户',
            avatar:
              (c.user && c.user.avatar_168x168 && c.user.avatar_168x168.url_list[0]) ||
              (c.user && c.user.avatar_300x300 && c.user.avatar_300x300.url_list[0]) ||
              '',
            sub_comment_count: c.reply_comment_total || 0,
            last_modify_ts: Date.now()
          });
          if (comments.length >= 30) break;
        }
        if (comments.length >= 30) break;
      }
      const json = JSON.stringify(comments, null, 2);
      fs.writeFileSync(path.join(CDIR, 'video_id_' + id + '.json'), json);
      fs.writeFileSync(path.join(CDIR, 'video_id_' + id + '.md'), json);
      if (comments.length) ok++; else empty++;
    } catch (e) {
      err++;
      console.log('  ✗', id, e.message.slice(0, 50));
    }
    page.off('response', handler);
    if ((i + 1) % 10 === 0) console.log(`[old-comments] ${i + 1}/${targets.length} (成功${ok} 空${empty} 错${err})`);
  }
  console.log('[old-comments] DONE', `成功${ok} 空${empty} 错${err}`);
  await ctx.close().catch(() => {});
  process.exit(0);
})();
