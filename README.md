# 你，几两？| 酒桌绰号

一个趣味「测酒量」H5：8 道题（省份酒窝地图、器皿、年龄群像、圆桌座位、叩指礼、12987、对话、二场电量），答完输入姓氏，生成酒桌绰号（宋三斤、周二两……），可保存结果图/分享，图内带跳转二维码。

**线上地址**：https://jiuliang-test.app.workbuddy.host/?sharecode=W4XEIG3UOR

## 项目结构

```
index.html           # 页面骨架（部署入口，引用下方资源）
style.css            # 全部样式（贴纸风、动画、响应式）
data.js              # 题库与文案：8 题选项/吐槽、33 省品牌数据、42 条评语、绰号模板
app.js               # 全部逻辑：渲染、计分、揭晓动画、canvas 出图、分享
vendor/qrcode.js     # 二维码生成库（MIT，本地内联，无外部请求）
scripts/verify.sh    # 自动化全流程验证脚本（见下）
```

改文案/题目/品牌数据只动 `data.js`；改样式动 `style.css`；改交互逻辑动 `app.js`。

## 本地开发

零依赖，任何静态服务器都能跑：

```bash
python3 -m http.server 8899 --bind 127.0.0.1
# 打开 http://127.0.0.1:8899/index.html
```

用 Cursor / VS Code 直接打开本目录即可编辑 `index.html`。

## 自动化验证（改完代码后必跑）

`scripts/verify.sh` 会用 playwright-cli 在手机视口（375×667）跑完整流程：
启动页 → 8 题逐屏高度与题型校验 → 贵姓页 → 揭晓动画 → 结算页（绰号、一屏无溢出）→ 出图下载。

```bash
bash scripts/verify.sh
```

验证原则（借鉴 pstack）：**改动不算完成，验证证据才算完成**。任何 UI/逻辑改动，至少跑一遍 verify.sh，确认 8 屏无溢出、流程可走通、出图正常，再考虑上线。

## 部署

通过 WorkBuddy 的发布功能部署（static，入口 `index.html`），域名与 sharecode 不变。改完本地验证通过后再发布。

## 浏览器测试注意事项

- playwright-cli 不支持 `file://` 协议，必须走 http 服务器；
- headless Chromium 沙箱失败时，用配置 `.playwright/cli.config.json`（`--no-sandbox`）+ 非沙箱终端运行；
- headless 环境里 `navigator.share` 可能永远挂起，代码中已有 1.6s 超时兜底，验证分享逻辑时注意这一行为差异。
