<h1 align="center">
  Douyin-Vue
</h1>

`douyin-vue` 是基于zyronon/douyin的一个模仿 `抖音|TikTok` 的移动端短视频项目。`Vue` 在移动端的"最佳实践"，媲美原生 `App` 丝滑流畅的使用体验。使用了最新的 `Vue` 技术栈，基于 [`Vue3`](https://cn.vuejs.org/)、[`Vite5`](https://cn.vitejs.dev/)
、[`Pinia`](https://pinia.vuejs.org/)实现。数据保存在项目本地，通过 [`axios-mock-adapter`](https://github.com/ctimmerm/axios-mock-adapter) 库拦截Api 并返回本地json数据，模拟真实后端请求

<div>
<img width="150px" src='docs/imgs/1.gif' />
<img width="150px" src='docs/imgs/2.gif' />
<img width="150px" src='docs/imgs/3.gif' />
<img width="150px" src='docs/imgs/4.gif' />
<img width="150px" src='docs/imgs/5.gif' />
</div>

[//]: # '**注意**：`PC` 必须将浏览器切到手机模式，先按 `F12` 调出控制台，再按 `Ctrl+Shift+M`才能正常预览'
[//]: # '**注意**：手机请用  [Via 浏览器](https://viayoo.com/zh-cn/)  或 Chrome 浏览器预览。其它浏览器可能会强制将视频全屏，导致无法正常显示'

## 运行

注意：本项目仅适用于学习和研究，不得用于商业使用

### 本地开发

**注意：必须 git 命令 clone 下来才能运行，下载 zip 包是无法运行的。**

```bash
git clone
          https://github.com/GanBaront/douyin.git
cd douyin
npm install
npm run dev
```

打开浏览器并访问: [http://127.0.0.1:3000](http://127.0.0.1:3000)

**注意：需要将浏览器切至手机模式，先按 `F12` 调出控制台，再按 `Ctrl+Shift+M` 才能正常预览**

## 数据来源

视频来源于以下抖音网红

- `刘思瑶nice`: https://v.douyin.com/iYRAaERn
- `小橙子`: https://v.douyin.com/iYRAnudw
- `南恬`: https://v.douyin.com/iYRAbKm3
- `小霸宠`: https://v.douyin.com/iYRSosVB
- `南翔`: https://www.douyin.com/user/MS4wLjABAAAAUx_0_1O2l2nScHoPafDfaCoaZ0Rh58qab7slIEJ66zg
- `江寻千（九月）`: https://www.douyin.com/user/MS4wLjABAAAAigFjTEOAwKibGXwx9X5mWfu1uOUJWfeoHpvaXqzzRc0
- `狼牙土豆饼`: https://www.douyin.com/user/MS4wLjABAAAA0GYT4bsbsfq4Sl4F1Y30CHGsBvTO6I8G6e358xkDfOQeNwJxazdnJAbBOKi88BWS
- `雅儿有点菜.`: https://www.douyin.com/user/MS4wLjABAAAAQMlbBJHPALLVAAmtezq_GCeev1jZhb8IN_9SkPgKHuYLi1nwGeY3JeMnYdNmOb3Z
- `Ke08`: https://www.douyin.com/user/MS4wLjABAAAAN2-T01Wy_KGQw7bD_Wq1Dx2Mk67k8G8IsglbpBqqN4g
- `别吵吵`：https://www.douyin.com/user/MS4wLjABAAAAiGokh5WgO0DXWe_hCbx8c-00UHcImuvgLuMaK75W91E
- `栗子`：https://www.douyin.com/user/MS4wLjABAAAAZc9YoYvv5tVLT51QkG3CWq3fZgtkK9yM4jZXuQGPKtU
- `小爱是也`：https://www.douyin.com/user/MS4wLjABAAAA0SIyL88oqM3THZdXen0Ygw8SWznebv-zlviXVmo21xA
- `吃啥呢给我也来一口`：https://www.douyin.com/user/MS4wLjABAAAAQibgKYA1Tx0lMhNAEvd5KDlGelOWLWCv8ZQcjN7r-7M
- `易梦玲`：https://www.douyin.com/user/MS4wLjABAAAAvpXNvV03ZPRsTM5SlxVVQPoI3YInirJQyzy6U1pwfmc
- `方圆`：https://www.douyin.com/user/MS4wLjABAAAAgVBpvqJSx6v2JPvoHc7fd383yacjuIAPBBrVSNmS-l4
- `Real机智张`：https://www.douyin.com/user/MS4wLjABAAAAQTAK0xJUnVyLDIp38HBkAGkRPECaVHmKZE5d2MMywek

  图片来自于小红书公开笔记

  以上内容均是互联网公开信息

## 功能与建议

目前项目处于开发初期，新功能正在持续添加中，如果你对软件有任何功能与建议，欢迎在 `Issues` 中提出
如果你也喜欢本软件的设计思想，欢迎提交 `PR`，非常感谢你对我们的支持！

## 联系我

您可以联系我的邮箱<a href="https://mail.Gan.YANK04@proton.me">通过 Gan.YANK04@proton.me给我发信</a>

## 许可协议

[GPL](LICENSE)

---

## 项目结构与文件说明

```
douyin/
├── public/                  # 静态资源（构建时原样拷贝）
│   ├── data/                # 全部 Mock 数据（核心）
│   │   ├── videos.json/md   # 推荐流视频数据（441 条，.md 为 7z 包仅供生产环境）
│   │   ├── users.json/md    # 博主资料（16 位，含真实签名/粉丝数/头像）
│   │   ├── comments/        # 每条视频的评论 video_id_{id}.json，一一对应
│   │   ├── user_video_list/ # 各博主的个人作品列表（"我的作品"tab 数据源）
│   │   ├── posts.md/json    # 图集数据
│   │   └── goods.md         # 商城页商品数据
│   ├── images/              # 视频封面图（1100+ 张，封面按文件名引用）
│   └── libarchive.wasm      # 生产环境解压 .md 数据包用
├── src/
│   ├── api/                 # 接口定义（实际被 mock 拦截）
│   │   ├── videos.ts        # 推荐/我的作品/评论等视频接口
│   │   └── user.ts          # 用户资料/作品列表/关注等接口
│   ├── assets/data/         # 打进包里的静态数据（好友列表、歌词、图集）
│   ├── components/
│   │   ├── Comment.vue      # 评论面板（拉取 comments/ 下的评论数据）
│   │   ├── Posters.vue      # 作品九宫格（个人页作品 tab）
│   │   ├── UserPanel.vue    # 博主主页面板（从视频进入作者页）
│   │   ├── BaseFooter.vue   # 底部 TabBar
│   │   └── slide/
│   │       ├── BaseVideo.vue       # 视频播放器核心（播放/暂停/进度/双击赞）
│   │       ├── SlideVerticalInfinite.vue  # 垂直无限滑动列表（上下滑切换）
│   │       ├── SlideItem.vue       # 单个滑页容器
│   │       ├── ItemDesc.vue        # 视频左侧文案/话题/音乐
│   │       └── ItemToolbar.vue     # 右侧点赞/评论/收藏按钮栏
│   ├── mock/index.ts        # axios-mock-adapter 拦截规则（所有接口的数据来源）
│   ├── pages/
│   │   ├── home/index.vue   # 首页骨架（底部 tab、推荐/关注等 5 个滑动页、我、用户面板）
│   │   ├── home/slide/      # 推荐(Slide0)、长视频、关注(Slide2)、社区、同城(Slide4)
│   │   ├── me/Me.vue        # 我的主页（作品/私密/喜欢/收藏 四个 tab）
│   │   └── other/VideoDetail.vue  # 全屏视频详情页（从作品九宫格进入）
│   ├── store/pinia.ts       # 全局状态（当前用户、好友列表）
│   ├── utils/index.tsx      # 工具函数（_checkImgUrl、_fetch、滑动渲染器）
│   └── router/              # 路由表（keep-alive 进出场控制）
├── scraper/                 # 二次开发：抖音真实数据抓取脚本（Node + playwright-core）
│   ├── browser.cjs          # Edge 持久化浏览器实例（登录态保存在 .edge-profile/）
│   ├── login.cjs            # 打开浏览器等待扫码登录
│   ├── videos.cjs           # 抓取博主主页视频列表（拦截页面自身接口）
│   ├── comments.cjs         # 逐条视频抓取真实评论（支持断点续跑）
│   ├── old-comments.cjs     # 为存量视频补抓评论
│   ├── assemble.cjs         # 把抓取数据整合进 public/data/
│   └── retry-comment.cjs    # 单条视频评论补抓
├── node/                    # 上游作者的构建辅助脚本
├── docs/                    # 上游 README 展示图
└── vite.config.ts           # Vite 配置（代理、分包、压缩）
```

### 数据链路说明

1. 页面发请求 → `src/mock/index.ts` 拦截 → 读取 `public/data/` 下对应 JSON 返回
2. 开发环境直接读 `.json`；生产环境读 `.md`（7z 压缩包，规避托管平台审查，`libarchive-wasm` 运行时解压）
3. **新增/替换博主数据的标准流程**：`node scraper/login.cjs` 登录抖音 → `node scraper/videos.cjs` 抓视频列表 → `node scraper/comments.cjs` 抓评论 → `node scraper/assemble.cjs` 整合落盘

### 二次开发改动记录

- 推荐流数据全部替换为真实博主视频（16 位博主 / 441 条视频），评论与视频一一对应
- 修复：同作者内滑动切换视频时评论不刷新；页面切换时双视频同时出声；右侧头像 404
- `.md` 数据文件在开发环境不生效（`_fetch` 会替换为 `.json`），修改数据请改 `.json` 后重新打包 `.md`
