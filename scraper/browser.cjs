// 共享浏览器实例：持久化 profile，保持抖音登录态
const { chromium } = require('playwright-core');
const path = require('path');
const PROFILE = path.resolve(__dirname, '.edge-profile');

async function launch(headful = true) {
  const ctx = await chromium.launchPersistentContext(PROFILE, {
    channel: 'msedge',
    headless: !headful,
    viewport: { width: 1380, height: 900 },
    args: ['--disable-blink-features=AutomationControlled', '--lang=zh-CN']
  });
  return ctx;
}
module.exports = { launch };
