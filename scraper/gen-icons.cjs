// 用 抖音.svg 生成 Android 全套图标
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SVG_PATH = 'D:/Data/抖音.svg';
const RES = 'D:/Data/Develop/douyin/android/app/src/main/res';

const svg = fs.readFileSync(SVG_PATH, 'utf8');
// 去掉黑色圆角方块背景 → 得到纯音符前景（自适应图标用）
const noteOnly = svg.replace(
  /<path d="M0 0m184\.32[^>]*><\/path>/,
  ''
);

const DENSITIES = [
  ['mdpi', 48, 108],
  ['hdpi', 72, 162],
  ['xhdpi', 96, 216],
  ['xxhdpi', 144, 324],
  ['xxxhdpi', 192, 432]
];

(async () => {
  const full = Buffer.from(svg);
  const note = Buffer.from(noteOnly);

  for (const [dpi, launcher, fg] of DENSITIES) {
    const dir = path.join(RES, 'mipmap-' + dpi);
    // 普通图标：完整图标（含黑底圆角方块）
    await sharp(full, { density: 300 }).resize(launcher, launcher).png().toFile(path.join(dir, 'ic_launcher.png'));
    await sharp(full, { density: 300 }).resize(launcher, launcher).png().toFile(path.join(dir, 'ic_launcher_round.png'));
    // 自适应图标前景：纯音符居中，占画布约 60%（安全区要求）
    const noteSize = Math.round(fg * 0.6);
    const pad = Math.round((fg - noteSize) / 2);
    await sharp(note, { density: 300 })
      .resize(noteSize, noteSize)
      .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(dir, 'ic_launcher_foreground.png'));
    console.log('✓ mipmap-' + dpi, launcher + 'px / fg ' + fg + 'px');
  }

  // 自适应图标背景色 = 图标的黑
  const colorsPath = path.join(RES, 'values', 'ic_launcher_background.xml');
  if (fs.existsSync(colorsPath)) {
    fs.writeFileSync(colorsPath, `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#111111</color>\n</resources>`);
    console.log('✓ ic_launcher_background = #111111');
  }
  console.log('DONE');
})();
