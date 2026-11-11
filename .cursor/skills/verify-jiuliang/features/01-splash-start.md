# 启动页与开始

## Sub-features
- App 启动页感首屏：大标题 + 品牌氛围，不是调研说明文（产品硬要求：不得出现"测试说明/共 8 题"之类的说明书文案）
- `#start` 开始按钮：点击后重置全部状态（`reset()`）进入第 1 题，支持反复重测

## How to get to it (user POV)
打开站点根 URL 即是启动页（`#s-intro` 默认带 `screen on`）。点"开始"进入答题。

## Driving it with playwright-cli
```js
await page.waitForTimeout(1200);                       // 等首屏渲染
const vh = page.viewportSize().height;
const h = await page.evaluate(() => document.documentElement.scrollHeight);
// 断言 1：h <= vh（375×667 下启动页不纵向溢出）
await page.click('#start');
await page.waitForTimeout(600);
const on = await page.evaluate(() => document.getElementById('s-quiz').classList.contains('on'));
const qcount = await page.textContent('#qcount');     // 断言 2：on === true 且 qcount === '1 / 8'
```

## Gotchas
- 历史事故：`#s-intro` 专用 ID 选择器写过 `display` 规则，优先级压过 `.screen`，导致点开始后启动页残留。规则：**CSS 里禁止给单个 screen 写 ID 级 display 规则**，统一走 `.screen` / `.screen.on`。
- 文案改动后人工过一眼"启动页感"——自动化只能验溢出，验不出语气跑偏。
