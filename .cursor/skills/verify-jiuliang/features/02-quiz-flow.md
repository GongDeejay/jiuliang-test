# 八题作答流程（8 种题型交互）

## Sub-features
8 道题、每题一种专属交互（`data.js` QUESTIONS[].type）：
1. `pmap` 省份地图格块（`.pmap`，33 省可点，横向滑动可寻）
2. `vessels` 器皿错落分布（`.vessels`：茶杯/小酒杯/白酒瓶/酒坛）
3. `ages` 手绘年龄群像（`.ages`，5 档：初中/高中/大学/工作后/到现在，5 档时走 `.ages.five` 三列网格）
4. `table` 酒桌规矩圆桌（`.tbl-wrap`）
5. `knock` 叩指礼敲桌场景（`.scene`，动画后才切下一题）
6. `digits` 数字卡片（`.digits`）
7. `chat` 二场群聊动画（`.replies`）
8. `battery` 真电池样式（`.gchat`）

另有 `#pips` 进度点与 `#qcount`（"n / 8"）。

## How to get to it (user POV)
启动页点"开始"进入第 1 题；每答一题自动切下一题；第 8 题作答后进入"您贵姓"页。

## Driving it with playwright-cli
```js
const kinds = ['pmap','vessels','ages','table','knock','digits','chat','battery'];
const sels  = {pmap:'.pmap', vessels:'.vessels', ages:'.ages', table:'.tbl-wrap',
               knock:'.scene', digits:'.digits', chat:'.replies', battery:'.gchat'};
const picks = [19, 2, 0, 0, 0, 0, 0, 1];   // 可任意，仅保证可点击
for (let i = 0; i < 8; i++) {
  const vh = page.viewportSize().height;
  const h  = await page.evaluate(() => document.documentElement.scrollHeight);
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  const ok = await page.evaluate(k => !!document.querySelector(sels[k]), kinds[i]);
  // 断言：h <= vh 且 sw <= 375 且 ok（题型渲染正确）
  await page.locator('#opts [data-i]').nth(picks[i]).click();
  await page.waitForTimeout(1250);          // 选项动画 + 切屏，别缩短
}
```

## Gotchas
- 375×667 纵向溢出的历史重灾区：任何新增间距/内容都要重跑 `scripts/verify.sh`（36 项断言含每题高度）。
- 第 3 题 ages 现为 5 档：选项数 = 5 时 layouts.js 自动加 `.ages.five`（三列 3+2）；验证断言 `#opts .age` 数量 === 5。改选项数必须同步改 card.js `ageHook()` 的文案数组（顺序：初中/高中/大学/工作后/到现在）。
- `knock`（第 5 题）有敲桌动画，切题有固定延迟；等待 <1250ms 会误判题型丢失。
- 第 1 题 pmap 依赖 `PROVINCES`（data.js）全 33 省都有条目——没有名酒的省也必须能找到（产品硬要求），改数据时别删省。
- 第 8 题页面实际是"二场"群聊 + 电池混合场景，题型名仍叫 `battery`，判定选择器用 `.gchat`。
