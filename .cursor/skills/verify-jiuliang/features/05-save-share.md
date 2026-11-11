# 结果图保存与分享

## Sub-features
- `#save` 保存结果图：`drawCard()` 动态画 PNG。`isTouch()` 分流——触屏且有 share-files 能力走 `navigator.share`；触屏无能力走图片浮层；桌面走 `a[download]` 下载（文件名含绰号）
- `#share` 分享：触屏走 share 面板（带图片+文案）；桌面复制邀请文案到剪贴板（按钮变"已复制"）
- `.imgov` 图片浮层：`data:image/png` data URL 的 `<img>` + "长按图片保存"提示 + `.imgov-close` 关闭
- `shareWithFallback`：1.6s 内 share 未 settle 则兜底弹浮层

## How to get to it (user POV)
结算页底部点"保存图片"或"分享"按钮。

## Driving it with playwright-cli

**桌面/headless 驱动触屏分支**（默认桌面走下载分支不出浮层）：先用 `Object.defineProperty` 覆盖 `maxTouchPoints`，再点 `#save`；headless 的 navigator.share 会挂起，等 `shareWithFallback` 1.6s 兜底浮层出现：
```js
await page.evaluate(() => Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 5 }));
await page.click('#save');
await page.waitForTimeout(2000);            // drawCard 生成 + share 兜底窗口 1.6s
const ov = await page.evaluate(() => {
  const img = document.querySelector('.imgov img');
  return { on: !!document.querySelector('.imgov'),
           data: img ? img.src.slice(0, 15) : null };
});
// 断言：ov.on === true 且 ov.data 以 'data:image/png' 开头（副作用验证，不只看按钮文案）
const shot = '证据截图路径 .playwright/evidence/<日期>-f05-save-overlay.png';
await page.screenshot({ path: shot, fullPage: false });
await page.click('.imgov-close');
await page.waitForTimeout(400);
const closed = await page.evaluate(() => !document.querySelector('.imgov'));
// 断言：closed === true（浮层可关闭）
```

**桌面非触屏分支**（不覆盖 maxTouchPoints）：点 `#save` 走 `a[download]`，断言按钮文本依次出现"正在生成…"→"已保存，去相册看看"；不出浮层是正常行为。

## Gotchas
- **桌面 headless 必须覆盖 `maxTouchPoints` 才能驱动浮层分支**：`isTouch()` 在 `js/share.js`，判定 `ontouchstart in window || navigator.maxTouchPoints > 0`。默认桌面直接走下载分支，直接等 `.imgov-close` 会超时 30s（首跑实测踩过）。
- **浮层必须用 data URL，禁止改回 blob:**：blob: 图片在 iOS 长按不弹保存菜单（用户实测反馈，产品核心路径）。
- `navigator.share` 在 headless Chromium 永远挂起 → `shareWithFallback` 1.6s 兜底浮层是设计行为，勿把等待缩到 <1.6s（会误判）也勿删兜底。
- 桌面/headless 验证时"下载文件"不产生可观察文件（headless 不落盘），证据以 `.imgov` 浮层 src 为准，不要因为没下载文件就判 ❌。
- headless 下 `navigator.clipboard` 可能拒绝授权，`#share` 走 `fallback()`（隐藏 textarea + execCommand）仍应把按钮变"已复制"。
