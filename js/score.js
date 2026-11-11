/* 计分与绰号候选：computeCore 写入 R，cleanName / nickList 供贵姓页和结算页使用。 */
"use strict";

function cleanName(raw){
  var s = String(raw || "").replace(/[^\u4e00-\u9fa5A-Za-z]/g, "");
  if (!s) return "";
  if (s.length >= 2 && COMPOUND.indexOf(s.slice(0, 2)) >= 0) return s.slice(0, 2);
  return s.slice(0, 1);
}

function nickList(name){
  var l = LIANG[R.band];
  var sp = (NICK_SPECIAL[R.styleKey] || NICK_SPECIAL.jianghu)(name, l);
  var raw = [name + l, "老" + name + l, "小" + name + l, sp];
  var out = [];
  raw.forEach(function(x){ if (out.indexOf(x) < 0) out.push(x); });
  return out;
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
