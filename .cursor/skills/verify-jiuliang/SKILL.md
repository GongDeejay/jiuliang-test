---
name: verify-jiuliang
description: 酒量绰号测试（jiuliang-test）的行为验证 skill。以用户视角驱动真实页面，跑通 启动页→八题作答→贵姓揭晓→结算页→保存分享 全流程并留存证据。改动 index.html / style.css / data.js / app.js 之后、上线发布之前必须使用；需要证明某个功能可用时也用它。
---

# verify-jiuliang

本项目是纯静态移动端 H5（375×667 优先），无构建步骤、无后端、无 seed data。验证 = 起本地静态服务器 + playwright-cli 驱动 Chromium 真实点击。写给从没见过这个 app 的 agent 读，所有选择器都是仓库里的真实句柄。

## Launch

```bash
cd <仓库根目录>
python3 -m http.server 8899 --bind 127.0.0.1 >/dev/null 2>&1 &
SERVER_PID=$!   # 记住这个 PID，cleanup 只杀它
```

就绪标准（可用 ≠ 进程在跑）：`curl -sf http://127.0.0.1:8899/index.html -o /dev/null` 返回 200，且页面能渲染出启动页（`#s-intro` 存在且有内容）。无迁移、无种子数据；两次验证实例并行靠换端口隔离（默认 8899，冲突时换 8898 等，别动共享实例）。

## Doctor

出任何异常先跑一次只读体检，判断"这个实例值不值得驱动"：

1. `curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8899/index.html` == `200`
2. `node --check app.js && node --check data.js && node --check vendor/qrcode.js` 全部通过
3. `index.html` 引用了 `data.js`、`app.js`、`vendor/qrcode.js`、`style.css`

任何一条不过，修语法/文件引用，不要继续驱动。

## Drive

工具：`playwright-cli`（未安装则 `fail`）。工作目录必须是仓库根目录，配置 `.playwright/cli.config.json`（禁 Chromium sandbox）会被自动读取；若环境仍报 sandbox 初始化失败，以 `dangerouslyDisableSandbox` 方式运行。

```bash
playwright-cli close || true
playwright-cli open http://127.0.0.1:8899/index.html
playwright-cli resize 375 667
playwright-cli run-code 'async page => { /* 见 features/ 各文件 */ }'
```

优先句柄（稳定，勿用坐标）：`#start`、`#opts [data-i]`（第 n 个选项用 `.nth(n)`）、`.schip`（姓氏块）、`#nameGo`、`#rtitle`、`#reroll`、`#save`、`#share`、`#qimg`、`.imgov`、`.imgov-close`。
八题题型判别选择器：pmap→`.pmap`、vessels→`.vessels`、ages→`.ages`、table→`.tbl-wrap`、knock→`.scene`、digits→`.digits`、chat→`.replies`、battery→`.gchat`。
判定高度用 `page.viewportSize().height`（run-code 环境里 `innerHeight` 不可用）。

## Evidence

证据一律存 `.playwright/evidence/`（cleanup 不得删除）：截图文件 + run-code 返回的 ✓/❌ 文本日志。证明标准：

- 走真实用户路径（点击），不许调内部函数或注入状态绕过 UI
- 同时捕获动作和结果状态：如点击 `#save` 后，既记录按钮反馈，也断言 `.imgov img` 的 src 以 `data:image/png` 开头
- 副作用要验证：二维码看 `#qimg.src.length > 10`；揭晓动画看 `#reveal` 与 `.rv-ch` 字符内容；不要只看最终屏
- headless 环境里 navigator.share 永远挂起，属已知边界，以 1.6s 兜底浮层为证据，不算失败

## Cleanup

```bash
playwright-cli close            # 只关你开的浏览器会话
kill $SERVER_PID                # 只杀你启动时记录的 PID，绝不按进程名杀
ls -la .playwright/evidence/    # cleanup 后确认证据仍在，被吃掉的 cleanup 不合格
```

cleanup 只移除实例与临时状态，`.playwright/evidence/` 里的证明文件必须存活。

## Helpers

- `scripts/verify.sh`：一条命令跑完 JS 语法检查 + 375×667 全流程 12 项断言（启动页/八题题型与溢出/贵姓页无绰号泄漏/揭晓动画/结算页+二维码），任何 ❌ 即 exit 1。用法：仓库根目录 `bash scripts/verify.sh`。做完全量回归优先用它；单功能探查按 features/ 各文件的 recipe 驱动。
