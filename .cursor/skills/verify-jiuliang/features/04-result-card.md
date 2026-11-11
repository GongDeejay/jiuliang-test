# 结算页结果与二维码

## Sub-features
- 结果称谓：`#rtitle` 显示绰号大字（如"宋三斤"），配套酒量档位 stats
- `#pctline`：按这套题的刻度说「你超过了 X%」。X 就是 `R.pct`（`computeCore` 里 `(cap-12)/88*100`，夹在 3–99），不是第二套分，也不是全国普查。最低档不报百分比，写成「今晚你是醒着的那个，这桌靠你收场」
- `#shareline`：预设句「我是宋三斤，你几两？」，不分享也能看见结果
- `#reroll` "↻ 换一个"：同姓换候选绰号，并重写 `#qimg` 的 `data-url`
- 网址二维码：`#qimg`。`data-url` 与图里编码的是同一条 `resultUrl()`：没有门禁码时结果在 `sharecode`，已有解不开的 `sharecode`（线上 `W4XEIG3UOR`）时原样保留、结果在 `from`
- 若是从别人的酒牌进来的，`#vs` / `#vsLine` 并排两个绰号和一句桌边话。这一屏可以高出 667，冷启动结算页不行
- 结算页文案硬要求：不出现"酒桌人格测试"措辞，只叫"酒桌绰号"

## How to get to it (user POV)
绰号揭晓动画结束后自动进入 `#s-result`。

## Driving it with playwright-cli
```js
const vh = page.viewportSize().height;
const r = await page.evaluate(() => ({
  nick: document.getElementById('rtitle') ? document.getElementById('rtitle').textContent : null,
  h:  document.documentElement.scrollHeight,
  sw: document.documentElement.scrollWidth,
  qr: !!document.getElementById('qimg') && document.getElementById('qimg').src.length > 10,
  pct: document.getElementById('pctline').textContent,
  share: document.getElementById('shareline').textContent
}));
// 断言：nick 非空；没有 #vs 时 h <= vh；sw <= 375；qr === true
// pct 含「按这套题的刻度」和 R.pct，且不含「全国 / 全网 / 只超过」
// 最低档（R.band === 0）的 pct 不含百分号
// share === 「我是」+ nick + 「，你几两？」
const before = r.nick;
await page.click('#reroll');
await page.waitForTimeout(400);
const after = await page.textContent('#rtitle');
// 断言（软）：换一个后称谓区域重渲染（文本可能相同也可能不同，DOM 必须刷新）
```

## Gotchas
- 二维码编码的是 `resultUrl()`，不是裸的 `location.href`。本地往往是 `?sharecode=<短码>`；从线上门禁页分享时是 `?sharecode=W4XEIG3UOR&from=<短码>`。
- 冷启动结算页在 375×667 仍要一屏放下。对照块（`#vs`）允许向下滚动，但绰号、刻度和保存按钮应在首屏附近。**新增任何行都要重跑 verify.sh**。
- 二维码依赖 `vendor/qrcode.js` 内联库；若 `#qimg` 无 src，先跑 Doctor 检查脚本引用是否被删。
