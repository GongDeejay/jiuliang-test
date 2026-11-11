# 别人的酒牌落地与对照

## Sub-features
- 链接里有解得开的结果时，不要先掉进冷启动。`#s-invite` 显示「宋测出了「宋一斤」」、酒风色块（`#inviteStyle`）和 `#yourturn`「轮到你了」
- 结果写在 `from`，或（没有门禁码时）写在 `sharecode`。`js/sharecode.js` 的版本 1：姓 + 档位 + 酒风 + 绰号序号 + CRC-16。解不开就不是一张酒牌
- 线上 `?sharecode=W4XEIG3UOR` 是发布门禁，CRC 对不上，仍进 `#s-intro`，不要 toast
- `from` 有值但解不开：停在启动页，toast「这张酒牌对不上，你先测自己的」，页面上不能出现半截绰号
- 测完后 `#vs` 并排两个绰号和酒风，`#vsLine` 是按这两人的酒量词写的一句，不是每对都同一句。最低档不拿「谁先倒」起哄
- 新图的二维码若当前页带着解不开的门禁码，必须原样保留，把自己的结果放进 `from`

## How to get to it (user POV)
打开 `?from=<短码>`，或 `?sharecode=W4XEIG3UOR&from=<短码>`，或本地 `?sharecode=<短码>`。先看对方，再点「轮到你了」答完八题。

短码可以从刚测完的人的 `#qimg` 的 `data-url` 里拿，那就是图上二维码的内容。

## Driving it with playwright-cli
```js
const home = await page.evaluate(() => location.href.split('#')[0].split('?')[0]);
const token = new URL(await page.getAttribute('#qimg', 'data-url')).searchParams.get('sharecode')
  || new URL(await page.getAttribute('#qimg', 'data-url')).searchParams.get('from');
await page.goto(home + '?sharecode=W4XEIG3UOR&from=' + token);
await page.waitForSelector('#yourturn');
const line = await page.textContent('#inviteLine'); // 「宋测出了「老宋一斤」」
await page.click('#yourturn');
// 答完八题并确认姓氏后：
const vs = await page.textContent('#vs');
const talk = await page.textContent('#vsLine');
// 断言：vs 同时含对方绰号和自己的绰号；talk 含双方的酒量词（如「一斤对一口」）
```

坏码：
```js
await page.goto(home + '?from=AAAAAA');
// #s-intro 带 .on，#s-invite 不带，#toast 含「对不上」
await page.goto(home + '?sharecode=W4XEIG3UOR');
// 冷启动，toast 为空
```

## Gotchas
- 不要把门禁码 `W4XEIG3UOR` 改掉或当成某人的结果。换掉它，线上宿主会 403，旧图里的二维码也打不开。
- 篡改校验失败必须当没有这张牌，不能靠截断或替换字符硬解出一个姓。
- `reset()` 不清 `peer`。再测一次会回到这张酒牌的落地页，对照对象还是同一个人。
- 落地页本身在 375×667 不应溢出。对照结算页可以比一屏高。
