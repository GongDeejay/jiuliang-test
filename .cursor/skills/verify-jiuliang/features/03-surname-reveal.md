# 您贵姓 → 绰号揭晓动画

## Sub-features
- 调研收尾感姓氏页：姓氏块 `.schip`（来自 `data.js` SURNAME_LIST）+ 确认按钮 `#nameGo`
- **惊喜感硬要求**：贵姓页不得出现"绰号/结果"任何预览或提示文案
- 揭晓动画：确认后弹出全屏浮层 `#reveal`，字符块 `.rv-ch` 逐字落下组成绰号（姓 + 量词，如"宋三斤"），随后自动消失进入结算页

## How to get to it (user POV)
答完第 8 题自动进入 `#s-name`；点一个姓氏块再点确认。

## Driving it with playwright-cli
```js
await page.waitForTimeout(600);
const nameOn = await page.evaluate(() => document.getElementById('s-name').classList.contains('on'));
const leak   = await page.evaluate(() => document.getElementById('s-name').textContent.indexOf('绰号') < 0);
// 断言 1：nameOn === true 且 leak === true（惊喜感核心断言）

await page.locator('.schip').nth(22).click();   // 任意块
await page.waitForTimeout(200);
await page.click('#nameGo');
await page.waitForTimeout(1100);
const reveal = await page.evaluate(() => ({
  ov: !!document.getElementById('reveal'),
  chars: [...document.querySelectorAll('.rv-ch')].map(c => c.textContent).join('')
}));
// 断言 2：reveal.ov === true 且 chars.length >= 3（浮层出现且绰号至少 3 字符）
await page.waitForTimeout(2200);
const gone = await page.evaluate(() => !document.getElementById('reveal'));
// 断言 3：动画结束浮层移除，#s-result 进入
```

## Gotchas
- **"绰号"泄漏检查是最容易被改坏的断言**：任何人在贵姓页加提示文案都可能写出"你的绰号是…"，verify.sh 有专门断言，❌ 就不能上线。
- 绰号由"姓 × 酒量档位 × 酒风"计算（`app.js` nickList/LIANG 规则），同一份作答 + 同姓结果确定；`#reroll` 换一个属结算页功能，不在此页。
- 若 `#reveal` 未出现：先查 `showName()`（app.js 约 20 行）是否被改动了移除浮层的逻辑。
