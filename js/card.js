/* canvas 结果图。两套版式都从这里出：出示（递手机）和朋友圈（带二维码）。 */
"use strict";

var FONT = '"PingFang SC","Hiragino Sans GB","Microsoft YaHei",-apple-system,sans-serif';
var cardMode = "moments";

/* 朋友圈二维码钉在这个盒子里，字数变了也不挪位置。 */
var CARD_SPEC = {
  dpr: 2,
  show: {w:750, h:1334},
  moments: {
    w: 750,
    h: 1120,
    block: {x:40, y:100, w:670, h:440},
    qr: {x:534, y:900, box:176}
  }
};

function markMode(mode){
  cardMode = mode === "show" ? "show" : "moments";
  var p = $("pass"), m = $("moments");
  if (p) p.classList.toggle("on", cardMode === "show");
  if (m) m.classList.toggle("on", cardMode === "moments");
}

function rr(g, x, y, w, h, r){
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function sticker(g, x, y, w, h, r, fill){
  g.fillStyle = "#241C14";
  rr(g, x + 7, y + 7, w, h, r); g.fill();
  g.fillStyle = fill;
  rr(g, x, y, w, h, r); g.fill();
  g.lineWidth = 3.5;
  g.strokeStyle = "#241C14";
  g.stroke();
}

function wrapText(g, text, maxW){
  var lines = [], cur = "";
  for (var i = 0; i < text.length; i++){
    var ch = text.charAt(i);
    if (g.measureText(cur + ch).width > maxW && cur.length){
      lines.push(cur); cur = ch;
    } else cur += ch;
  }
  if (cur) lines.push(cur);
  return lines;
}

function styleFace(key){
  var k = key || (R && R.styleKey) || "jianghu";
  return STYLE_FACE[k] || STYLE_FACE.jianghu;
}

function makeQr(text){
  try {
    var qr = qrcode(0, "M");
    qr.addData(text);
    qr.make();
    return qr;
  } catch (e) { return null; }
}

function paintQrBox(g, qr, x, y, box){
  if (!qr) return;
  var n = qr.getModuleCount();
  var pad = 14;
  var cell = Math.floor((box - pad * 2) / n);
  if (cell < 2) cell = 2;
  var w = n * cell + pad * 2;
  var ox = x + Math.floor((box - w) / 2);
  var oy = y + Math.floor((box - w) / 2);
  g.fillStyle = "#FFFFFF";
  rr(g, ox, oy, w, w, 14); g.fill();
  g.lineWidth = 3.5;
  g.strokeStyle = "#241C14";
  rr(g, ox, oy, w, w, 14); g.stroke();
  g.fillStyle = "#241C14";
  for (var r = 0; r < n; r++){
    for (var c = 0; c < n; c++){
      if (qr.isDark(r, c)) g.fillRect(ox + pad + c * cell, oy + pad + r * cell, cell, cell);
    }
  }
}

function seatLine(i){
  return ["这桌你先起身", "别人的酒你来挡", "菜比酒重要", "中途离席的那个"][i] || "";
}
function batteryLine(i){
  return ["散场还想组二场", "二场能去，先歇会儿", "二场只喝汤", "二场不去，代驾已叫"][i] || "";
}
function vesselLine(i){
  return ["家里长辈不喝酒", "逢节才开一瓶", "家里每餐二两", "酒坛边长大的"][i] || "";
}
function chatLine(i){
  return ["大哥一句话就干了", "听懂了字面意思", "场面话也接得住", "悄悄把酒换成茶"][i] || "";
}
function provinceLine(i){
  var p = PROVINCES[i];
  return p ? ("家乡" + p.nm + "，" + p.br) : "";
}

/* 断片年纪默认不上桌。其余挑一句跟酒风最贴的。 */
function ageHook(picks){
  if (!picks || picks.length < 3) return null;
  var text = ["第一次断片在初中", "第一次断片在高中", "第一次断片在大学", "到现在还没断片"][picks[2]];
  return text ? {text: text, sensitive: true} : null;
}

function defaultHook(picks){
  if (!picks || picks.length < 8 || !R) return null;
  var style = R.styleKey;
  var order;
  if (style === "hero" || style === "host") order = [seatLine(picks[3]), batteryLine(picks[7]), chatLine(picks[6]), vesselLine(picks[1]), provinceLine(picks[0])];
  else if (style === "escape") order = [batteryLine(picks[7]), seatLine(picks[3]), chatLine(picks[6]), vesselLine(picks[1]), provinceLine(picks[0])];
  else if (style === "gourmet") order = [vesselLine(picks[1]), seatLine(picks[3]), chatLine(picks[6]), batteryLine(picks[7]), provinceLine(picks[0])];
  else if (style === "book") order = [chatLine(picks[6]), vesselLine(picks[1]), seatLine(picks[3]), batteryLine(picks[7]), provinceLine(picks[0])];
  else order = [vesselLine(picks[1]), batteryLine(picks[7]), seatLine(picks[3]), chatLine(picks[6]), provinceLine(picks[0])];
  for (var i = 0; i < order.length; i++){
    if (order[i]) return {text: order[i], sensitive: false};
  }
  return null;
}

function activeHook(){
  if (!state || !state.picks || state.hookSkip) return null;
  if (state.hookAge) return ageHook(state.picks);
  return defaultHook(state.picks);
}

function newCanvas(w, h){
  var cv = document.createElement("canvas");
  var dpr = CARD_SPEC.dpr;
  cv.width = w * dpr;
  cv.height = h * dpr;
  var g = cv.getContext("2d");
  g.scale(dpr, dpr);
  g.textBaseline = "alphabetic";
  return {cv: cv, g: g};
}

/* 出示版：绰号竖排铺满，截图也能一眼读完。最低档不写百分比。 */
function drawShowCard(){
  var W = CARD_SPEC.show.w, H = CARD_SPEC.show.h;
  var box = newCanvas(W, H);
  var g = box.g;
  var face = styleFace();
  g.fillStyle = face.bg;
  g.fillRect(0, 0, W, H);

  g.fillStyle = face.fg;
  g.globalAlpha = 0.9;
  g.font = "800 30px " + FONT;
  g.textAlign = "center";
  g.fillText("你，几两？", W / 2, 88);
  g.globalAlpha = 1;

  var nk = R.nick || (R.name + LIANG[R.band]);
  var chars = nk.split("");
  var top = 150, bottom = 1180, avail = bottom - top;
  var size = Math.floor(avail / chars.length * 0.78);
  if (size > 240) size = 240;
  if (size < 64) size = 64;
  g.font = "900 " + size + "px " + FONT;
  var gap = Math.min(size * 1.08, avail / chars.length);
  var blockH = gap * chars.length;
  var y = top + (avail - blockH) / 2 + size * 0.82;
  for (var i = 0; i < chars.length; i++) g.fillText(chars[i], W / 2, y + i * gap);

  var short = pctClaim(R.pct, R.band, true);
  if (short){
    g.globalAlpha = 0.92;
    g.font = "800 34px " + FONT;
    g.fillText(short, W / 2, H - 72);
    g.globalAlpha = 1;
  }
  g.textAlign = "left";
  return box.cv;
}

/* 朋友圈版：酒风色块、一句可讲的、金句、刻度，二维码固定右下。 */
function drawMomentsCard(){
  var spec = CARD_SPEC.moments;
  var W = spec.w, H = spec.h;
  var box = newCanvas(W, H);
  var g = box.g;
  var face = styleFace();
  var block = spec.block;

  g.fillStyle = "#FFF7E3";
  g.fillRect(0, 0, W, H);
  g.save();
  g.globalAlpha = 0.55;
  g.fillStyle = "#FFE9A8";
  g.beginPath(); g.arc(680, 40, 120, 0, Math.PI * 2); g.fill();
  g.restore();

  g.font = "800 24px " + FONT;
  var brand = "你，几两？";
  var bw = g.measureText(brand).width + 48;
  sticker(g, 40, 36, bw, 48, 24, "#FFCE3A");
  g.fillStyle = "#241C14";
  g.font = "800 24px " + FONT;
  g.textAlign = "left";
  g.fillText(brand, 64, 68);

  sticker(g, block.x, block.y, block.w, block.h, 28, face.bg);
  g.fillStyle = face.fg;
  g.textAlign = "center";
  g.font = "800 36px " + FONT;
  g.fillText(STYLE_NAME[R.styleKey] || "", W / 2, block.y + 78);

  var nk = R.nick || (R.name + LIANG[R.band]);
  var size = 92;
  g.font = "900 " + size + "px " + FONT;
  while (g.measureText(nk).width > block.w - 64 && size > 46){
    size -= 2;
    g.font = "900 " + size + "px " + FONT;
  }
  g.fillText(nk, W / 2, block.y + 250);
  g.font = "800 28px " + FONT;
  g.fillText(R.arch || "", W / 2, block.y + block.h - 56);

  var hook = activeHook();
  g.textAlign = "left";
  if (hook){
    g.fillStyle = "#241C14";
    g.font = "900 32px " + FONT;
    g.fillText(hook.text, 48, 588);
  }

  g.save();
  g.fillStyle = "#FFF3D0";
  rr(g, 40, 608, 670, 100, 18); g.fill();
  g.setLineDash([8, 6]);
  g.lineWidth = 3.5;
  g.strokeStyle = "#241C14";
  rr(g, 40, 608, 670, 100, 18); g.stroke();
  g.restore();
  g.fillStyle = "#8A7A62";
  g.font = "800 18px " + FONT;
  g.fillText("酒桌金句", 64, 642);
  g.fillStyle = "#241C14";
  var motto = R.motto || "";
  var mottoSize = 26;
  g.font = "800 " + mottoSize + "px " + FONT;
  while (g.measureText(motto).width > 620 && mottoSize > 18){
    mottoSize -= 1;
    g.font = "800 " + mottoSize + "px " + FONT;
  }
  g.fillText(motto, 64, 680);

  var claim = pctClaim(R.pct, R.band, false);
  var claimFill = R.band === 0 ? "#E4F6F1" : "#FFCE3A";
  sticker(g, 40, 728, 670, 104, 18, claimFill);
  g.fillStyle = "#241C14";
  var claimSize = 26;
  g.font = "900 " + claimSize + "px " + FONT;
  while (g.measureText(claim).width > 610 && claimSize > 18){
    claimSize -= 1;
    g.font = "900 " + claimSize + "px " + FONT;
  }
  var claimLines = wrapText(g, claim, 610);
  if (claimLines.length > 1){
    g.fillText(claimLines[0], 64, 778);
    g.fillText(claimLines[1], 64, 812);
  } else {
    g.fillText(claim, 64, 792);
  }

  var qr = makeQr(resultUrl() || location.href.split("#")[0]);
  paintQrBox(g, qr, spec.qr.x, spec.qr.y, spec.qr.box);
  g.fillStyle = "#241C14";
  g.font = "900 28px " + FONT;
  g.fillText("扫码 · 测测你几两", 48, 968);
  g.font = "800 24px " + FONT;
  var sentence = "我是" + nk + "，你几两？";
  var ss = 24;
  g.font = "800 " + ss + "px " + FONT;
  while (g.measureText(sentence).width > 460 && ss > 16){
    ss -= 1;
    g.font = "800 " + ss + "px " + FONT;
  }
  g.fillText(sentence, 48, 1012);
  g.fillStyle = "#7B6E5F";
  g.font = "700 16px " + FONT;
  g.fillText("结果仅供娱乐 · 按本题刻度 · 切勿酒驾", 48, 1092);
  g.textAlign = "left";
  return box.cv;
}

function drawCard(){
  return cardMode === "show" ? drawShowCard() : drawMomentsCard();
}

function cardBlob(){
  return new Promise(function(res){
    var cv = drawCard();
    if (cv.toBlob) {
      cv.toBlob(function(b){ res(b); }, "image/png", 0.95);
    } else {
      var data = cv.toDataURL("image/png");
      var bin = atob(data.split(",")[1]);
      var arr = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) { arr[i] = bin.charCodeAt(i); }
      res(new Blob([arr], {type:"image/png"}));
    }
  });
}

function cardDataUrl(){
  try { return drawCard().toDataURL("image/png"); }
  catch (e) { return null; }
}
