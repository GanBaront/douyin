// 阶段3：整合抓取数据 → 项目数据文件
const fs = require('fs');
const path = require('path');

const OUT = path.resolve(__dirname, 'out');
const ROOT = path.resolve(__dirname, '..');
const BLOGGERS = [
  { uid: '9900000012', nickname: '小爱是也' },
  { uid: '9900000013', nickname: '吃啥呢给我也来一口' },
  { uid: '9900000014', nickname: '易梦玲' },
  { uid: '9900000015', nickname: '方圆' },
  { uid: '9900000016', nickname: 'Real机智张' }
];

// 1. 转换视频对象：保留抖音原始结构，替换播放地址为免签名构造链接
function mapVideo(a, uid) {
  const playUrl = a.video && a.video.play_addr
    ? 'https://www.douyin.com/aweme/v1/play/?video_id=' + a.video.play_addr.uri + '&line=0&is_play_url=1&source=PackSourceEnum_PUBLISH'
    : undefined;
  const v = {
    aweme_id: a.aweme_id,
    desc: a.desc || '',
    create_time: a.create_time,
    music: a.music || null,
    video: {
      play_addr: a.video && a.video.play_addr
        ? { ...a.video.play_addr, url_list: [playUrl] }
        : null,
      cover: a.video && a.video.cover ? a.video.cover : null,
      height: a.video && a.video.height,
      width: a.video && a.video.width,
      duration: a.video && a.video.duration
    },
    share_url: 'https://www.iesdouyin.com/share/video/' + a.aweme_id + '/',
    statistics: a.statistics || {},
    status: a.status || null,
    text_extra: a.text_extra || [],
    is_top: 0,
    share_info: { share_url: 'https://www.iesdouyin.com/share/video/' + a.aweme_id + '/' },
    duration: a.duration,
    image_infos: null,
    author_user_id: uid,
    prevent_download: false,
    long_video: null,
    aweme_control: a.aweme_control || null,
    images: a.images || null
  };
  return v;
}

// 2. 评论映射到 App 的读取 schema
function mapComment(c, awemeId) {
  return {
    comment_id: c.cid,
    create_time: c.create_time,
    ip_location: '',
    aweme_id: awemeId,
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
    avatar: (c.user && c.user.avatar) || '',
    sub_comment_count: c.reply_comment_total || 0,
    last_modify_ts: Date.now()
  };
}

const newVideos = [];
const summaries = [];
for (const b of BLOGGERS) {
  const dir = path.join(OUT, b.uid);
  const raw = JSON.parse(fs.readFileSync(path.join(dir, 'videos.json'), 'utf8'));
  const mapped = raw.map((a) => mapVideo(a, b.uid));
  mapped.forEach((v) => newVideos.push(v));

  // 写入真实评论文件
  const cDir = path.join(dir, 'comments');
  let cMade = 0;
  if (fs.existsSync(cDir)) {
    for (const f of fs.readdirSync(cDir)) {
      if (!f.endsWith('.json')) continue;
      const id = f.replace('.json', '');
      const list = JSON.parse(fs.readFileSync(path.join(cDir, f), 'utf8'));
      const mapped = list.map((c) => mapComment(c, id));
      const json = JSON.stringify(mapped, null, 2);
      fs.writeFileSync(path.join(ROOT, 'public/data/comments', 'video_id_' + id + '.json'), json);
      fs.writeFileSync(path.join(ROOT, 'public/data/comments', 'video_id_' + id + '.md'), json);
      cMade++;
    }
  }
  summaries.push(`${b.nickname}: ${mapped.length}条视频/${cMade}个评论文件`);
}
console.log('[transform]', summaries.join(' | '));

// 3. 重建 videos.json：真实 160 条（作者 9900000001-11）+ 新博主真实视频
const current = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/data/videos.json'), 'utf8'));
const newUids = new Set(BLOGGERS.map((b) => b.uid));
const originals = current.filter((v) => !newUids.has(String(v.author_user_id)));
console.log('originals:', originals.length, 'new real:', newVideos.length);
const final = originals.concat(newVideos);
// 打乱顺序
let seed = 20261117;
const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
for (let i = final.length - 1; i > 0; i--) {
  const j = Math.floor(rnd() * (i + 1));
  [final[i], final[j]] = [final[j], final[i]];
}
fs.writeFileSync(path.join(ROOT, 'public/data/videos.json'), JSON.stringify(final, null, 2));
fs.writeFileSync(path.join(ROOT, 'public/data/videos.md'), JSON.stringify(final));
console.log('total videos:', final.length);

// 4. 更新 5 位博主的真实主页资料
const users = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/data/users.json'), 'utf8'));
for (const b of BLOGGERS) {
  const pf = path.join(OUT, b.uid, 'profile.json');
  if (!fs.existsSync(pf)) continue;
  const p = JSON.parse(fs.readFileSync(pf, 'utf8'));
  const u = users.find((x) => String(x.uid) === b.uid);
  if (!u) continue;
  u.nickname = p.nickname || b.nickname;
  u.signature = p.signature || '';
  u.follower_count = p.follower_count || 0;
  u.max_follower_count = p.follower_count || 0;
  u.mplatform_followers_count = p.follower_count || 0;
  u.total_favorited = String(p.total_favorited || 0);
  u.aweme_count = p.aweme_count || 0;
  u.gender = p.gender || 0;
  u.city = p.city || '';
  u.province = p.province || '';
  if (p.avatar_168x168) u.avatar_168x168 = p.avatar_168x168;
  if (p.avatar_300x300) u.avatar_300x300 = p.avatar_300x300;
  if (p.cover_url) u.cover_url = p.cover_url;
  if (p.white_cover_url) u.white_cover_url = p.white_cover_url;
}
fs.writeFileSync(path.join(ROOT, 'public/data/users.json'), JSON.stringify(users, null, 2));
fs.writeFileSync(path.join(ROOT, 'public/data/users.md'), JSON.stringify(users));
console.log('users updated');

// 5. 清理孤儿评论文件（不在任何已知视频集合里的）
const known = new Set(final.map((v) => String(v.aweme_id)));
for (const f of fs.readdirSync(path.join(ROOT, 'public/data/user_video_list'))) {
  if (f.endsWith('.json')) {
    try { JSON.parse(fs.readFileSync(path.join(ROOT, 'public/data/user_video_list', f), 'utf8')).forEach((v) => known.add(String(v.aweme_id))); } catch (e) {}
  }
}
try { JSON.parse(fs.readFileSync(path.join(ROOT, 'public/data/posts6.json'), 'utf8')).forEach((v) => { if (v.aweme_id) known.add(String(v.aweme_id)); }); } catch (e) {}
['6686589698707590411','6826943630775831812','6882368275695586568','6923214072347512068','7000587983069957383','7005490661592026405','7110263965858549003','7128686458763889956','7161000281575148800','7194815099381484860','7260749400622894336','7267478481213181238','7270431418822446370','7293100687989148943','7295697246132227343','7321200290739326262'].forEach((id) => known.add(id));
let removed = 0;
for (const f of fs.readdirSync(path.join(ROOT, 'public/data/comments'))) {
  const m = f.match(/^video_id_(\d+)\.(md|json)$/);
  if (m && !known.has(m[1])) { fs.unlinkSync(path.join(ROOT, 'public/data/comments', f)); removed++; }
}
console.log('orphan comment files removed:', removed);

// 6. mock 接口 total 同步
const mockPath = path.join(ROOT, 'src/mock/index.ts');
let mock = fs.readFileSync(mockPath, 'utf8');
mock = mock.replace(/total: \d+,\n(\s+)list: \(await getAllVideos\(\)\)/g, (m, sp) => `total: ${final.length},\n${sp}list: (await getAllVideos())`);
fs.writeFileSync(mockPath, mock);
console.log('mock total updated to', final.length);
