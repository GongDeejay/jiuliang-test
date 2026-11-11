/* 计分与绰号候选：computeCore 写入 R，cleanName / nickList 供贵姓页和结算页使用。 */
"use strict";

function cleanName(raw){
  var s = String(raw || "").replace(/[^\u4e00-\u9fa5A-Za-z]/g, "");
  if (!s) return "";
  if (s.length >= 2 && COMPOUND.indexOf(s.slice(0, 2)) >= 0) return s.slice(0, 2);
  return s.slice(0, 1);
}

function nickCandidates(name, band, styleKey){
  var l = LIANG[band];
  var spArr = NICK_SPECIAL[styleKey] || NICK_SPECIAL.jianghu;
  var tier = band <= 1 ? "low" : band <= 4 ? "mid" : "high";
  var fun = NICK_FUN.all.concat(NICK_FUN[tier]);
  var raw = [name + l, "老" + name + l, spArr[0](name, l), spArr[1](name, l)];
  fun.forEach(function(f){ raw.push(f(name, l)); });
  raw.push("小" + name + l);
  var out = [];
  raw.forEach(function(x){ if (x && out.indexOf(x) < 0) out.push(x); });
  return out;
}

function nickList(name){
  return nickCandidates(name, R.band, R.styleKey);
}

/* R.pct 就是 computeCore 里那条刻度，不是另一套分，也不是实时普查。
   short=true 给出示版用的短句；最低档不报百分比，避免把手机递到桌上时当众念个位数。 */
function pctClaim(pct, band, short){
  pct = Math.round(Number(pct) || 0);
  if (band === 0) return short ? "" : "今晚你是醒着的那个，这桌靠你收场";
  if (short) return (band === 1 ? "盖过 " : "超过 ") + pct + "% 酒友";
  if (band === 1) return "按这套题的刻度，你盖过了 " + pct + "% 的酒友";
  return "按这套题的刻度，你超过了 " + pct + "% 的酒友";
}

/* 按两人的酒量词和酒风写一句桌边话。高的那个词在前，最低档不拿「谁先倒」起哄。 */
function compareTalk(me, other){
  var a = LIANG[me.band];
  var b = LIANG[other.band];
  var gap = me.band - other.band;
  if (gap === 0){
    if (me.styleKey !== other.styleKey){
      return a + "对" + a + "，" + STYLE_NAME[me.styleKey] + "碰" + STYLE_NAME[other.styleKey];
    }
    return "都是" + a + "，这桌不用让着喝";
  }
  var hi = gap > 0 ? a : b;
  var lo = gap > 0 ? b : a;
  var abs = Math.abs(gap);
  var lowBand = gap >= 0 ? other.band : me.band;
  if (lowBand === 0) return hi + "对" + lo + "，一口那位今晚负责醒着";
  if (abs === 1) return hi + "对" + lo + "，就差一杯的事";
  if (abs === 2) return hi + "对" + lo + "，今晚谁先倒还不好说";
  if (abs === 3) return hi + "对" + lo + "，劝酒的人悠着点";
  return hi + "对" + lo + "，这桌得留个清醒的";
}

function computeCore(){
  var pct = Math.round((state.cap - 12) / 88 * 100);
  pct = Math.max(3, Math.min(99, pct));

  var band = 0;
  for (var bi = 0; bi < ARCH.length; bi++) { if (pct >= ARCH[bi].min) { band = bi; } }
  var BD = ARCH[band];
  var t = Math.max(0, Math.min(1, (pct - BD.min) / (BD.max - BD.min)));
  var ml = Math.round(BD.lo + (BD.hi - BD.lo) * t);
  var beer = (ml * 0.52 / 20).toFixed(1);

  var styleKey = "book", best = -1;
  ["book","hero","gourmet","host","escape","jianghu"].forEach(function(k){
    if (state.st[k] > best) { best = state.st[k]; styleKey = k; }
  });

  var speedKey = "steady", sb = -1;
  ["fast","steady","slow"].forEach(function(k){
    if (state.sp[k] > sb) { sb = state.sp[k]; speedKey = k; }
  });
  var speedName = {fast:"快干型", steady:"匀速型", slow:"慢品型"}[speedKey];

  var knowName, knowDesc;
  if (state.know >= 2) { knowName = "内行 · 规矩通"; knowDesc = "两题全中，报菜名前先报工艺"; }
  else if (state.know === 1) { knowName = "半懂行"; knowDesc = "知道一点，够唬住半桌人"; }
  else { knowName = "外行 · 但真诚"; knowDesc = "不懂规矩，所以没人防着你"; }

  R = {
    band: band,
    styleKey: styleKey,
    title: ARCH[band].name + " · " + STYLE_NAME[styleKey],
    arch: ARCH[band].name,
    style: STYLE_NAME[styleKey],
    roast: ROAST[band + "-" + styleKey],
    pct: pct, ml: ml, beer: beer,
    know: state.know, knowName: knowName, knowDesc: knowDesc,
    speedName: speedName, speedKey: speedKey,
    warn: WARN[band], motto: MOTTO[styleKey],
    name: "", nick: "", nickIdx: 0
  };
}
