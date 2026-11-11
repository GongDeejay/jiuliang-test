# pstack Feature Map 实践总结（2026-11-11）

## 做了什么
按 pstack `/create-verification-skill` 技能规范，为本项目（酒量绰号测试）生成了项目本地的 verify skill + feature map：

```
.cursor/skills/verify-jiuliang/
├── SKILL.md                  # Launch / Doctor / Drive / Evidence / Cleanup / Helpers
└── features/
    ├── README.md             # 索引表（5 个功能 → 文件 → 快速证明入口）
    ├── 01-splash-start.md    # 启动页与开始
    ├── 02-quiz-flow.md       # 八题作答（8 种题型）
    ├── 03-surname-reveal.md  # 您贵姓 → 绰号揭晓
    ├── 04-result-card.md     # 结算页结果与二维码
    └── 05-save-share.md      # 结果图保存与分享
```

每个 feature 文件固定四段：Sub-features / How to get to it (user POV) / Driving it with playwright-cli / Gotchas。所有选择器、等待时长、断言都是从仓库真实代码提炼，非示例。

## 关键决策与发现
- **feature map 不是文档，是可执行的验证事实源**：它把"功能 ↔ 怎么驱动 ↔ 什么证据算通过 ↔ 哪里有坑"绑定，给从未见过这个 app 的 agent 冷读使用。
- **实测证明（规范第 4 步）跑了 Feature 5**：首跑踩坑——桌面 headless 默认走 `a[download]` 分支不出浮层，等 `.imgov-close` 超时 30s。修正 recipe：用 `Object.defineProperty(navigator,'maxTouchPoints',{get:()=>5})` 覆盖触点后走 share 挂起 → 1.6s 兜底浮层路径，断言全过。这个坑已写进 05 的 Gotchas，后人不会再踩。
- **Cleanup 发现并清掉了 8899 端口的残留 server**（早前 verify.sh 遗留，PID 31936），确认证据截图存活于 `.playwright/evidence/`。
- `.gitignore` 白名单了 `.playwright/cli.config.json`（坑：目录整体忽略时例外必须写 `.playwright/*` + `!`）。

## 交付与后续
- 已推送 GitHub（commit 93e68e1，仓库 GongDeejay/jiuliang-test）。线上托管是快照式，本次只动开发工具链，**无需重新部署**。
- 维护闭环：以后 app 行为变了，对应 feature 文件要同步改（即 pstack 的 `/maintain-verification-skill` 时机）；改完 app.js/data.js/style.css 后上线前跑 `bash scripts/verify.sh`。
- 全量回归仍以 `scripts/verify.sh`（12 项断言）为准，feature map 用于单功能探查与知识沉淀。
