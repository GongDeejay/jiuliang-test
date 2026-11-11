async page => {
  const log = [];
  const bad = (m) => log.push("❌ " + m);
  const ok = (m) => log.push("✓ " + m);
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("dialog", (d) => d.dismiss());
  const vh = page.viewportSize().height;
  const shot = async (name) => {
    await page.screenshot({path: ".playwright/evidence/" + name, fullPage: false});
  };

  await page.waitForTimeout(600);
  const splashH = await page.evaluate(() => document.documentElement.scrollHeight);
  if (splashH > vh) bad("启动页溢出: " + splashH); else ok("启动页 " + splashH + "px");

  await page.click("#start");
  await page.waitForTimeout(400);

  const kinds = ["pmap", "vessels", "ages", "table", "knock", "digits", "chat", "battery"];
  const picks = [19, 2, 0, 0, 0, 0, 0, 1];
  for (let i = 0; i < 8; i++) {
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    const kindOk = await page.evaluate((k) => {
      const sels = {pmap:".pmap", vessels:".vessels", ages:".ages", table:".tbl-wrap", knock:".scene", digits:".digits", chat:".replies", battery:".gchat"};
      return !!document.querySelector(sels[k]);
    }, kinds[i]);
    if (h > vh) bad("第" + (i + 1) + "题溢出: " + h);
    else if (sw > 375) bad("第" + (i + 1) + "题横向溢出: " + sw);
    else if (!kindOk) bad("第" + (i + 1) + "题题型不符");
    else ok("第" + (i + 1) + "题 " + kinds[i] + " " + h + "px");
    await page.locator("#opts [data-i]").nth(picks[i]).click();
    await page.waitForTimeout(1250);
  }

  const nameOn = await page.evaluate(() => document.getElementById("s-name").classList.contains("on"));
  const noNickLeak = await page.evaluate(() => document.getElementById("s-name").textContent.indexOf("绰号") < 0);
  if (!nameOn || !noNickLeak) bad("贵姓页异常"); else ok("贵姓页（无绰号提示）");

  await page.locator(".schip").nth(22).click();
  await page.waitForTimeout(200);
  await page.click("#nameGo");
  await page.waitForTimeout(1100);
  const reveal = await page.evaluate(() => ({
    ov: !!document.getElementById("reveal"),
    chars: [...document.querySelectorAll(".rv-ch")].map((c) => c.textContent).join("")
  }));
  if (!reveal.ov || reveal.chars.length < 3) bad("揭晓动画未出现"); else ok("揭晓动画「" + reveal.chars + "」");
  await page.waitForTimeout(2300);

  const home = await page.evaluate(() => location.href.split("#")[0].split("?")[0]);
  const result = await page.evaluate(() => {
    const url = document.getElementById("qimg").dataset.url;
    const u = new URL(url);
    const token = u.searchParams.get("from") || u.searchParams.get("sharecode");
    const d = decodeShare(token);
    const pct = document.getElementById("pctline").textContent;
    return {
      ovGone: !document.getElementById("reveal"),
      nick: document.getElementById("rtitle").textContent,
      h: document.documentElement.scrollHeight,
      sw: document.documentElement.scrollWidth,
      qr: document.getElementById("qimg").src.length > 10,
      pct: pct,
      share: document.getElementById("shareline").textContent,
      hint: document.getElementById("savehint").textContent,
      band: R.band,
      n: R.pct,
      decoded: d && d.nick,
      url: url,
      hasVs: !!document.getElementById("vs")
    };
  });
  if (!result.ovGone || !result.nick) bad("结算页异常");
  else if (result.hasVs) bad("冷启动不该出现对照");
  else if (result.h > vh) bad("结算页溢出: " + result.h);
  else if (result.sw > 375) bad("结算页横向溢出: " + result.sw);
  else if (!result.qr) bad("结算页无二维码");
  else ok("结算页「" + result.nick + "」 " + result.h + "px 二维码✓");
  if (result.band < 2) bad("这组答案应落在较高档，实际 " + result.band);
  else if (result.pct.indexOf("按这套题的刻度") < 0 || result.pct.indexOf(String(result.n) + "%") < 0) bad("刻度文案不对: " + result.pct);
  else if (/全国|全网|只超过/.test(result.pct)) bad("刻度写成了普查: " + result.pct);
  else ok("刻度「" + result.pct + "」");
  if (result.share !== "我是" + result.nick + "，你几两？") bad("分享句不对: " + result.share);
  else ok("分享句「" + result.share + "」");
  if (result.hint.indexOf("长按") < 0) bad("保存提示不够显眼");
  else ok("保存长按提示");
  if (result.decoded !== result.nick) bad("二维码短码解出的绰号对不上");
  else ok("短码对得上「" + result.decoded + "」");
  await shot("result.png");

  await page.click("#reroll");
  await page.waitForTimeout(300);
  const rolled = await page.evaluate(() => {
    const u = new URL(document.getElementById("qimg").dataset.url);
    const d = decodeShare(u.searchParams.get("sharecode") || u.searchParams.get("from"));
    return {nick: document.getElementById("rtitle").textContent, decoded: d && d.nick};
  });
  if (!rolled.nick || rolled.nick === result.nick || rolled.decoded !== rolled.nick) bad("换一个后短码没跟上");
  else ok("换一个「" + rolled.nick + "」短码已更新");

  await page.click("#share");
  await page.waitForTimeout(800);
  const copied = await page.textContent("#share");
  if (copied !== "已复制") bad("桌面分享未复制，按钮是「" + copied + "」");
  else ok("桌面分享已复制");

  await page.evaluate(() => Object.defineProperty(navigator, "maxTouchPoints", {configurable: true, get: () => 5}));
  await page.click("#save");
  await page.waitForTimeout(2200);
  const moments = await page.evaluate(() => {
    const img = document.querySelector(".imgov img");
    if (!img || !img.complete) return null;
    const c = document.createElement("canvas");
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const g = c.getContext("2d", {willReadFrequently: true});
    g.drawImage(img, 0, 0);
    const spec = CARD_SPEC.moments;
    const dpr = CARD_SPEC.dpr;
    const p = g.getImageData((spec.block.x + 24) * dpr, (spec.block.y + 24) * dpr, 1, 1).data;
    const qr = spec.qr;
    const data = g.getImageData(qr.x * dpr, qr.y * dpr, qr.box * dpr, qr.box * dpr).data;
    let dark = 0, n = 0;
    for (let i = 0; i < data.length; i += 16) {
      n++;
      if (data[i] < 60 && data[i + 1] < 60 && data[i + 2] < 60) dark++;
    }
    return {
      w: img.naturalWidth,
      h: img.naturalHeight,
      hook: img.getAttribute("data-hook"),
      layout: img.getAttribute("data-layout"),
      src: img.src.slice(0, 15),
      badge: (document.querySelector(".imgov-badge") || {}).textContent || "",
      hint: (document.querySelector(".imgov-hint") || {}).textContent || "",
      color: [p[0], p[1], p[2]],
      dark: dark / n
    };
  });
  if (!moments) bad("朋友圈保存浮层没出现");
  else if (moments.src !== "data:image/png;" || moments.layout !== "moments") bad("朋友圈图不是 png");
  else if (moments.w !== 1500 || moments.h !== 2240) bad("朋友圈图尺寸 " + moments.w + "x" + moments.h);
  else if (moments.color[0] !== 255 || moments.color[1] !== 107 || moments.color[2] !== 53) bad("酒风色块不是豪侠橙 " + moments.color.join(","));
  else if (!(moments.dark > 0.08 && moments.dark < 0.7)) bad("固定位置没有二维码");
  else if (moments.hook !== "这桌你先起身") bad("朋友圈钩子不对: " + moments.hook);
  else if (moments.hook.indexOf("断片") >= 0) bad("断片年纪默认上了桌");
  else if (moments.badge.indexOf("长按") < 0 || moments.hint.indexOf("按住") < 0) bad("浮层长按提示不明显");
  else ok("朋友圈图 色块✓ 二维码✓ 钩子「" + moments.hook + "」");
  await shot("moments-overlay.png");

  if (moments) {
    await page.click('.imgov-tool[data-act="ageon"]');
    await page.waitForTimeout(200);
    const aged = await page.getAttribute(".imgov img", "data-hook");
    if (!aged || aged.indexOf("断片") < 0) bad("写上断片年纪没生效");
    else ok("可选写上「" + aged + "」");
    await page.click('.imgov-tool[data-act="ageoff"]');
    await page.waitForTimeout(150);
    await page.click('.imgov-tool[data-act="skip"]');
    await page.waitForTimeout(150);
    const skipped = await page.evaluate(() => ({
      hook: document.querySelector(".imgov img").getAttribute("data-hook"),
      text: document.querySelector(".imgov-hook").textContent
    }));
    if (skipped.hook) bad("不上这句后钩子还在");
    else if (skipped.text.indexOf("没写上") < 0) bad("跳过文案不对");
    else ok("钩子可以不上桌");
    await page.click(".imgov-close");
    await page.waitForTimeout(400);
  }

  await page.click("#moments");
  await page.waitForTimeout(2200);
  const again = await page.evaluate(() => {
    const img = document.querySelector(".imgov img");
    return img ? {layout: img.getAttribute("data-layout"), src: img.src.slice(0, 15)} : null;
  });
  if (!again || again.layout !== "moments" || again.src !== "data:image/png;") bad("发朋友圈按钮没出图");
  else ok("发朋友圈按钮出图");
  await page.click(".imgov-close");
  await page.waitForTimeout(400);

  await page.click("#pass");
  await page.waitForTimeout(300);
  const stage = await page.evaluate(() => {
    const span = document.querySelector("#showNick span");
    return {
      on: document.getElementById("showstage").classList.contains("on"),
      nick: document.getElementById("showNick").textContent,
      pct: document.getElementById("showPct").textContent,
      expect: pctClaim(R.pct, R.band, true),
      size: span ? parseFloat(getComputedStyle(span).fontSize) : 0
    };
  });
  if (!stage.on || stage.nick !== rolled.nick) bad("出示层绰号不对");
  else if (stage.size < 72) bad("出示字不够大 " + stage.size);
  else if (stage.pct !== stage.expect) bad("出示刻度「" + stage.pct + "」");
  else ok("出示「" + stage.nick + "」 " + stage.size + "px");
  await shot("show-stage.png");

  await page.click("#showSave");
  await page.waitForTimeout(2200);
  const showImg = await page.evaluate(() => {
    const img = document.querySelector(".imgov img");
    if (!img) return null;
    const c = document.createElement("canvas");
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const g = c.getContext("2d", {willReadFrequently: true});
    g.drawImage(img, 0, 0);
    const p = g.getImageData(16, 16, 1, 1).data;
    return {
      w: img.naturalWidth,
      h: img.naturalHeight,
      layout: img.getAttribute("data-layout"),
      src: img.src.slice(0, 15),
      color: [p[0], p[1], p[2]]
    };
  });
  if (!showImg || showImg.layout !== "show" || showImg.src !== "data:image/png;") bad("出示图没生成");
  else if (showImg.w !== 1500 || showImg.h !== 2668) bad("出示图尺寸 " + showImg.w + "x" + showImg.h);
  else if (showImg.color.join(",") !== "255,107,53") bad("出示底色不对");
  else ok("出示图铺满酒风色");
  await page.click(".imgov-close");
  await page.waitForTimeout(300);
  await page.click("#showClose");
  await page.waitForTimeout(200);

  const shareUrl = await page.getAttribute("#qimg", "data-url");
  const token = new URL(shareUrl).searchParams.get("sharecode") || new URL(shareUrl).searchParams.get("from");
  await page.goto(home + "?sharecode=W4XEIG3UOR&from=" + encodeURIComponent(token));
  await page.waitForTimeout(400);
  const invite = await page.evaluate(() => ({
    on: document.getElementById("s-invite").classList.contains("on"),
    intro: document.getElementById("s-intro").classList.contains("on"),
    line: (document.getElementById("inviteLine") || {}).textContent || "",
    style: (document.getElementById("inviteStyle") || {}).textContent || "",
    h: document.documentElement.scrollHeight,
    sw: document.documentElement.scrollWidth
  }));
  const expectLine = "宋测出了「" + rolled.nick + "」";
  if (!invite.on || invite.intro) bad("酒牌落地没出现");
  else if (invite.line !== expectLine) bad("落地句「" + invite.line + "」");
  else if (invite.style !== "豪侠") bad("落地酒风不对");
  else if (invite.h > vh || invite.sw > 375) bad("落地页溢出 " + invite.h);
  else ok("落地「" + invite.line + "」· 豪侠");
  await shot("invite.png");

  await page.click("#yourturn");
  await page.waitForTimeout(400);
  const lowPicks = [21, 0, 0, 3, 1, 0, 3, 3];
  let qOverflow = "";
  for (let i = 0; i < 8; i++) {
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    if (h > vh || sw > 375) qOverflow = "第" + (i + 1) + "题 " + h + "x" + sw;
    await page.locator("#opts [data-i]").nth(lowPicks[i]).click();
    await page.waitForTimeout(1250);
  }
  if (qOverflow) bad("对照作答溢出 " + qOverflow); else ok("对照作答八题无溢出");
  await page.locator(".schip").nth(1).click();
  await page.waitForTimeout(150);
  await page.click("#nameGo");
  await page.waitForTimeout(3400);

  const cmp = await page.evaluate(() => {
    const u = new URL(document.getElementById("qimg").dataset.url);
    const d = decodeShare(u.searchParams.get("from"));
    return {
      vs: document.getElementById("vs") ? document.getElementById("vs").innerText : "",
      line: (document.getElementById("vsLine") || {}).textContent || "",
      pct: document.getElementById("pctline").textContent,
      nick: document.getElementById("rtitle").textContent,
      band: R.band,
      n: R.pct,
      host: u.searchParams.get("sharecode"),
      fromNick: d && d.nick,
      sw: document.documentElement.scrollWidth
    };
  });
  if (cmp.sw > 375) bad("对照页横向溢出");
  else if (cmp.vs.indexOf(rolled.nick) < 0 || cmp.vs.indexOf(cmp.nick) < 0) bad("对照没摆开两个绰号");
  else if (cmp.vs.indexOf("豪侠") < 0 || cmp.vs.indexOf("逃兵") < 0) bad("对照没写酒风");
  else if (cmp.line.indexOf("一斤对一口") < 0) bad("桌边话不对: " + cmp.line);
  else ok("对照「" + cmp.line + "」");
  if (cmp.band !== 0) bad("这组答案应是最低档");
  else if (/\d+%|只超过|全国|全网/.test(cmp.pct)) bad("最低档不该报百分比: " + cmp.pct);
  else if (cmp.pct.indexOf("醒着") < 0) bad("最低档文案不对: " + cmp.pct);
  else ok("最低档「" + cmp.pct + "」（刻度 " + cmp.n + " 不上嘴）");
  if (cmp.host !== "W4XEIG3UOR" || cmp.fromNick !== cmp.nick) bad("新二维码没保住门禁码或写错了人");
  else ok("新图仍带门禁码，from 是自己的「" + cmp.fromNick + "」");
  await shot("compare.png");

  await page.click("#pass");
  await page.waitForTimeout(250);
  const lowShow = await page.evaluate(() => ({
    pct: document.getElementById("showPct").textContent,
    display: document.getElementById("showPct").style.display,
    nick: document.getElementById("showNick").textContent
  }));
  if (lowShow.nick !== cmp.nick) bad("最低档出示绰号不对");
  else if (lowShow.pct || lowShow.display !== "none") bad("最低档出示不该写百分比");
  else ok("最低档出示只有绰号");
  await page.click("#showClose");

  await page.goto(home + "?sharecode=W4XEIG3UOR");
  await page.waitForTimeout(300);
  const legacy = await page.evaluate(() => ({
    intro: document.getElementById("s-intro").classList.contains("on"),
    invite: document.getElementById("s-invite").classList.contains("on"),
    toast: document.getElementById("toast").textContent
  }));
  if (!legacy.intro || legacy.invite || legacy.toast) bad("旧 sharecode 不该被当成酒牌");
  else ok("旧门禁码仍是冷启动");

  await page.goto(home + "?from=AAAAAA");
  await page.waitForTimeout(250);
  const badFrom = await page.evaluate(() => ({
    intro: document.getElementById("s-intro").classList.contains("on"),
    invite: document.getElementById("s-invite").classList.contains("on"),
    toast: document.getElementById("toast").textContent
  }));
  if (!badFrom.intro || badFrom.invite || badFrom.toast.indexOf("对不上") < 0) bad("坏 from 没有拦住");
  else ok("坏 from 退回冷启动");

  const flipped = (token.charAt(0) === "A" ? "B" : "A") + token.slice(1);
  await page.goto(home + "?from=" + flipped);
  await page.waitForTimeout(250);
  const tampered = await page.evaluate((nick) => ({
    intro: document.getElementById("s-intro").classList.contains("on"),
    invite: document.getElementById("s-invite").classList.contains("on"),
    toast: document.getElementById("toast").textContent,
    leaked: document.body.textContent.indexOf(nick) >= 0
  }), rolled.nick);
  if (!tampered.intro || tampered.invite || tampered.leaked || tampered.toast.indexOf("对不上") < 0) bad("篡改短码拼出了结果");
  else ok("篡改短码对不上，没有半截绰号");

  if (errors.length) bad("页面异常 " + errors[0]);
  return log.join("\n");
}
