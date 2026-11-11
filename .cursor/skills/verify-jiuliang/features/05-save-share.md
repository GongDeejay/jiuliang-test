# 结果图保存与分享

## Sub-features
- 两套图都走 `drawCard()`：`cardMode === "show"` 是出示版，否则是朋友圈版（酒风色块、一句钩子、金句、刻度、右下角固定二维码）。尺寸在页面全局 `CARD_SPEC`
- 出示版 v4（2026-11-11，用户反馈：印章文字跑出圆外 + 要加二维码）：竖排大字 top=190/**bottom=1030**；印章 (588,400)；刻度句 y=1080；酒瓶行 bottomY=1150；**左下角二维码 `CARD_SPEC.show.qr{x:56,y:1180,box:132}`** + 「扫码 · 测测你几两」。`#showstage` 同步：印章 `.show-stamp`（文字用 flex 居中，**禁止内联 display:block 覆盖**——v3 踩过）+ 酒瓶 `.show-bottles` + **二维码 `.show-qr`（`#showQrImg`，`paintShowQr()` 生成）**。验证双像素不变：`(16,16)`=酒风色、`(16,200)`=奶黄底；另加 show.qr 区域暗像素占比 0.08-0.7 断言
- 出示版设计 v2（2026-11-11，用户嫌满底酒风色难看）：奶黄底 `#FFF7E3` + 墨字，酒风色只留 **26px 顶边条** + 一枚 `.show-tag` 圆签；`#showstage` 全屏层同底同色。验证取双像素：`(16,16)` 设备像素 = 酒风色、`(16,200)` = 奶黄底（dpr=2）
- `#pass`「官方认证」（v5 改名，调侃向）：打开 `#showstage`，手机可以直接递过去。最低档不写百分比。`#showSave` 再走保存管线
- 结算页只有三按钮（v5）：`#pass` / `#share` / `#again`。**`#moments` 和 `#save` 已删**；朋友圈版图只通过 `#share` 的浮层/share 面板出（share.js `shareResult` 开头固定 `markMode("moments")`）
- 长按提示在浮层 `.imgov-badge`/`.imgov-hint` 和 toast 里（页面级 savehint 已删）。微信里保存靠长按 data URL，不要改回 blob:
- `#share` 分享：触屏走 share 面板（带图片 + 「我是某绰号，你几两？」）；桌面复制这句话和链接（按钮变"已复制"）。不分享也能看结果
- 朋友圈浮层里可以「不上这句」，也可以「写上断片年纪」。断片年纪默认不在图上
- `.imgov` 图片浮层：`data:image/png` 的 `<img>` + `.imgov-close`
- `shareWithFallback`：1.6s 内 share 未 settle 则兜底弹浮层。无头环境里 `navigator.share` 会挂起，这个兜底不能删、不能改短

## How to get to it (user POV)
结算页点「官方认证」（看出示层）或「分享」。出示层里可「保存出示图」。

## Driving it with playwright-cli

**桌面/headless 驱动触屏分支**（默认桌面走下载分支不出浮层）：先用 `Object.defineProperty` 覆盖 `maxTouchPoints`，再点 `#share`（朋友圈版）或 `#pass`→`#showSave`（出示版）；headless 的 navigator.share 会挂起，等 `shareWithFallback` 1.6s 兜底浮层出现：
```js
await page.evaluate(() => Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 5 }));
await page.click('#share');
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

**桌面非触屏分支**（不覆盖 maxTouchPoints）：点 `#share` 走复制文案（按钮变"已复制"）；出示层 `#showSave` 走 `a[download]`，不出浮层是正常行为。

## Gotchas
- **DOM 印章居中靠 `.show-stamp{display:flex}`**：openShowStage 不要对 `#showStamp` 设内联 display（v3 曾设 `display:block` 盖掉 flex，文字跑到圆外——用户截图实锤）。canvas 版 `drawStamp` 无此问题。
- **桌面 headless 必须覆盖 `maxTouchPoints` 才能驱动浮层分支**：`isTouch()` 在 `js/share.js`，判定 `ontouchstart in window || navigator.maxTouchPoints > 0`。默认桌面直接走下载分支，直接等 `.imgov-close` 会超时 30s（首跑实测踩过）。
- **浮层必须用 data URL，禁止改回 blob:**：blob: 图片在 iOS 长按不弹保存菜单（用户实测反馈，产品核心路径）。
- `navigator.share` 在 headless Chromium 永远挂起 → `shareWithFallback` 1.6s 兜底浮层是设计行为，勿把等待缩到 <1.6s（会误判）也勿删兜底。
- 桌面/headless 验证时"下载文件"不产生可观察文件（headless 不落盘），证据以 `.imgov` 浮层 src 为准，不要因为没下载文件就判 ❌。
- headless 下 `navigator.clipboard` 可能拒绝授权，`#share` 走 `fallback()`（隐藏 textarea + execCommand）仍应把按钮变"已复制"。
