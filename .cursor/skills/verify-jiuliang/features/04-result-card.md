# 结算页结果与二维码

## Sub-features
- 结果称谓：`#rtitle` 显示绰号大字（如"宋三斤"），配套酒量档位 stats 与酒风徽章
- `#reroll` "↻ 换一个"：同姓重新随机其他候选绰号
- 网址二维码：`#qimg`（qrcode-generator 内联库生成，内容为当前 `location.href` 去掉 hash）
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
  qr: !!document.getElementById('qimg') && document.getElementById('qimg').src.length > 10
}));
// 断言：nick 非空；h <= vh；sw <= 375；qr === true
const before = r.nick;
await page.click('#reroll');
await page.waitForTimeout(400);
const after = await page.textContent('#rtitle');
// 断言（软）：换一个后称谓区域重渲染（文本可能相同也可能不同，DOM 必须刷新）
```

## Gotchas
- QR 内容是 `location.href`：本地验证时编码的是 `http://127.0.0.1:8899/...`，属预期，不是 bug；线上编码线上地址。
- 结算页高度在 375×667 下已被压到极限（qrow margin 等多轮收紧），**新增任何行都要重跑 verify.sh**。
- 二维码依赖 `vendor/qrcode.js` 内联库；若 `#qimg` 无 src，先跑 Doctor 检查脚本引用是否被删。
