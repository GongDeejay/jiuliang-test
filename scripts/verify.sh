#!/usr/bin/env bash
# 全流程自动化验证脚本（借鉴 pstack 的 verify-first 原则）
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

# 3. JS 语法检查
node -e "
const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
scripts.forEach((m,i)=>{ try{ new Function(m[1]); }catch(e){ console.error('❌ script['+i+'] 语法错误: '+e.message); process.exit(1);} });
console.log('✓ JS 语法 OK (' + scripts.length + ' 个 script 块)');
"

# 4. 浏览器全流程验证
"$PC" close >/dev/null 2>&1 || true
"$PC" open "$URL" >/dev/null
"$PC" resize 375 667 >/dev/null

RESULT=$($PC run-code "async page => {
  await page.waitForTimeout(1200);
  const log = [];
  const vh = page.viewportSize().height;

  // 启动页
  const splashH = await page.evaluate(() => document.documentElement.scrollHeight);
  if (splashH > vh) log.push('❌ 启动页溢出: ' + splashH); else log.push('✓ 启动页 ' + splashH + 'px');

  await page.click('#start');
  await page.waitForTimeout(600);

  // 8 题：逐屏高度 + 题型
  const kinds = ['pmap','vessels','ages','table','knock','digits','chat','battery'];
  const picks = [19, 2, 0, 0, 0, 0, 0, 1];
  for (let i = 0; i < 8; i++) {
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    const kindOk = await page.evaluate((k) => {
      const sels = {pmap:'.pmap', vessels:'.vessels', ages:'.ages', table:'.tbl-wrap', knock:'.scene', digits:'.digits', chat:'.replies', battery:'.gchat'};
      return !!document.querySelector(sels[k]);
    }, kinds[i]);
    if (h > vh) log.push('❌ 第' + (i+1) + '题溢出: ' + h);
    else if (sw > 375) log.push('❌ 第' + (i+1) + '题横向溢出: ' + sw);
    else if (!kindOk) log.push('❌ 第' + (i+1) + '题题型不符');
    else log.push('✓ 第' + (i+1) + '题 ' + kinds[i] + ' ' + h + 'px');
    await page.locator('#opts [data-i]').nth(picks[i]).click();
    await page.waitForTimeout(1250);
  }

  // 贵姓页
  const nameOn = await page.evaluate(() => document.getElementById('s-name').classList.contains('on'));
  const noNickLeak = await page.evaluate(() => document.getElementById('s-name').textContent.indexOf('绰号') < 0);
  if (!nameOn || !noNickLeak) log.push('❌ 贵姓页异常'); else log.push('✓ 贵姓页（无绰号提示）');

  // 提交姓氏 → 揭晓动画 → 结算页
  await page.locator('.schip').nth(22).click();
  await page.waitForTimeout(200);
  await page.click('#nameGo');
  await page.waitForTimeout(1100);
  const reveal = await page.evaluate(() => ({
    ov: !!document.getElementById('reveal'),
    chars: [...document.querySelectorAll('.rv-ch')].map(c => c.textContent).join('')
  }));
  if (!reveal.ov || reveal.chars.length < 3) log.push('❌ 揭晓动画未出现'); else log.push('✓ 揭晓动画「' + reveal.chars + '」');
  await page.waitForTimeout(2200);

  const r = await page.evaluate(() => ({
    ovGone: !document.getElementById('reveal'),
    nick: document.getElementById('rtitle') ? document.getElementById('rtitle').textContent : null,
    h: document.documentElement.scrollHeight,
    sw: document.documentElement.scrollWidth,
    qr: !!document.getElementById('qimg') && document.getElementById('qimg').src.length > 10
  }));
  if (!r.ovGone || !r.nick) log.push('❌ 结算页异常');
  else if (r.h > vh) log.push('❌ 结算页溢出: ' + r.h);
  else if (r.sw > 375) log.push('❌ 结算页横向溢出: ' + r.sw);
  else log.push('✓ 结算页「' + r.nick + '」 ' + r.h + 'px' + (r.qr ? ' 二维码✓' : ' ⚠️无二维码'));

  return log.join('\n');
}")
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
