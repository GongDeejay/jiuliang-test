# Feature Map — 酒量绰号测试

用户可感知的功能清单，每项一个文件。map 是仓库持续维护的验证事实源：证明了 map 里一个顺手的入口 ≠ 覆盖了全部入口；改了页面行为必须同步改对应 feature 文件（否则用 `/maintain-verification-skill` 修 map）。逻辑分文件在 `js/`（状态、题型版面、答题、计分、短码、贵姓揭晓、结算、两套 canvas、分享、落地、入口），行为约定仍以本目录为准。

| # | 功能 | 文件 | 快速证明入口 |
|---|------|------|--------------|
| 1 | 启动页与开始 | `01-splash-start.md` | 打开首页 → `#start` → 进入第 1/8 题 |
| 2 | 八题作答流程（8 种题型交互） | `02-quiz-flow.md` | `#start` → 逐题点击 `#opts [data-i]` |
| 3 | 您贵姓 → 绰号揭晓动画 | `03-surname-reveal.md` | 答完 8 题 → `.schip` + `#nameGo` → `#reveal` |
| 4 | 结算页结果、刻度与二维码 | `04-result-card.md` | 揭晓后 `#rtitle` / `#pctline` / `#qimg` / `#reroll` |
| 5 | 出示版 / 朋友圈版保存与分享 | `05-save-share.md` | 结算页点 `#save` 或 `#moments` → `.imgov`；`#pass` 出示 |
| 6 | 别人的酒牌落地与对照 | `06-inbound-compare.md` | 打开带结果短码的链接 → `#yourturn` → 测完看 `#vs` |

通用前置（Launch/Doctor/Drive/Evidence/Cleanup）见 `../SKILL.md`。
