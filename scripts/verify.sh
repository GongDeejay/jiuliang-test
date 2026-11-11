#!/usr/bin/env bash
# 全流程自动化验证：语法与脚本顺序、酒牌短码、375×667 作答、
# 两套结果图、别人酒牌落地、对照、刻度文案。任何 ❌ 即 exit 1。
# 用法: bash scripts/verify.sh
set -e

PORT=8899
URL="http://127.0.0.1:${PORT}/index.html"
PC="playwright-cli"

fail() { echo "❌ $1"; exit 1; }

# 1. 前置检查
[ -f index.html ] || fail "index.html 不存在，请在项目根目录运行"
command -v "$PC" >/dev/null || fail "playwright-cli 未安装"

# 2. 启动本地服务器（若未运行）
if ! curl -s -o /dev/null "$URL"; then
  echo "▶ 启动本地服务器 :${PORT}"
  python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1 &
  SERVER_PID=$!
  sleep 1
  trap '[ -n "$SERVER_PID" ] && kill $SERVER_PID 2>/dev/null' EXIT
fi

# 3. JS 语法检查，并确认 index.html 按依赖顺序引用（与 README 的脚本清单一致）
JS_FILES="vendor/qrcode.js data.js js/state.js js/layouts.js js/score.js js/sharecode.js js/card.js js/share.js js/result.js js/surname.js js/quiz.js js/invite.js js/boot.js"
for f in $JS_FILES; do
  [ -f "$f" ] || fail "缺少 $f"
  node --check "$f" && echo "✓ 语法 OK: $f" || fail "语法错误: $f"
done
html=$(cat index.html)
offset=0
for f in $JS_FILES; do
  needle="src=\"$f\""
  tail="${html:offset}"
  case "$tail" in
    *"$needle"*) ;;
    *) fail "index.html 未按顺序引用 $f" ;;
  esac
  prefix="${tail%%"$needle"*}"
  offset=$((offset + ${#prefix} + ${#needle}))
done
echo "✓ index.html 脚本顺序 OK"
node scripts/check-sharecode.js

# 4. 浏览器全流程验证
mkdir -p .playwright/evidence
"$PC" close >/dev/null 2>&1 || true
"$PC" open "$URL" >/dev/null
"$PC" resize 375 667 >/dev/null

RESULT=$($PC run-code --filename=scripts/verify-flow.js)
# 提取 JSON 结果行并解析显示
MSG=$(echo "$RESULT" | grep '^"' | head -1)
"$PC" close >/dev/null 2>&1 || true

echo ""
echo "================================"
if [ -z "$MSG" ]; then
  echo "❌ 未取得验证结果（浏览器或服务器异常）"
  exit 1
fi
printf '%s' "$MSG" | python3 -c "import sys, json; print(json.loads(sys.stdin.read()))"
if echo "$MSG" | grep -q "❌"; then
  echo "--------------------------------"
  echo "❌ 验证未通过，禁止上线"
  exit 1
fi
echo "--------------------------------"
echo "✓ 全部通过，可上线"
echo "================================"
