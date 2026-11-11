/* canvas 结果图。drawCard 只读 R 与 qrcode，不改页面。 */
"use strict";

/* ---------------- 结果图生成 ---------------- */
var FONT = '"PingFang SC","Hiragino Sans GB","Microsoft YaHei",-apple-system,sans-serif';

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
    } else {
      cur += ch;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

function drawCard(){
  var W = 750;
  var cv = document.createElement("canvas");
  var dpr = 2;
  cv.width = W * dpr;
  var g = cv.getContext("2d");
  g.scale(dpr, dpr);
  g.textBaseline = "alphabetic";

  /* 预计算纵向布局，动态定高 */
  g.font = "800 29px " + FONT;
  var rl = wrapText(g, R.roast, 566);
  var qh = 40 + rl.length * 44;
  var cardY = 322 + qh + 22;
  var cvy = cardY + 320;
  var bdgY = cvy + 122;
  var mY = bdgY + 66;

  var qr = null;
  try {
    qr = qrcode(0, "M");
    qr.addData(location.href.split("#")[0]);
    qr.make();
  } catch (e) { qr = null; }

  var qrCell = 3, qrn = qr ? qr.getModuleCount() : 0;
  var qrW = qrn ? qrn * qrCell + 22 : 0;
  var qrY = mY + 96 + 24;
  var H = qr ? qrY + qrW + 52 : qrY + 60;

  cv.height = H * dpr;
  g.scale(dpr, dpr);

  g.fillStyle = "#FFF7E3";
  g.fillRect(0, 0, W, H);

  g.save();
  g.globalAlpha = .55;
  g.fillStyle = "#FFE9A8";
  g.beginPath(); g.arc(680, 60, 190, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#FFD9C7";
  g.beginPath(); g.arc(40, 1010, 170, 0, Math.PI * 2); g.fill();
  g.restore();

  /* 品牌胶囊 */
  g.font = "800 24px " + FONT;
  var brandText = "你，几两？";
  var bw = g.measureText(brandText).width + 48;
  sticker(g, 48, 44, bw, 48, 24, "#FFCE3A");
  g.fillStyle = "#241C14";
  g.font = "800 24px " + FONT;
  g.fillText(brandText, 72, 76);

  /* 小标签 */
  g.font = "800 22px " + FONT;
  var tagText = "你的酒桌绰号";
  var tw = g.measureText(tagText).width + 40;
  sticker(g, 48, 126, tw, 44, 22, "#37C9AE");
  g.fillStyle = "#0F5548";
  g.font = "800 22px " + FONT;
  g.fillText(tagText, 68, 155);

  /* 绰号 */
  var nk = R.nick || (R.name + LIANG[R.band]);
  var liang = LIANG[R.band];
  var size = 76;
  g.font = "900 " + size + "px " + FONT;
  while (g.measureText(nk).width > 654 && size > 40){ size -= 2; g.font = "900 " + size + "px " + FONT; }
  var titleY = 258;
  var seg = nk.split(liang);
  if (seg.length === 2){
    g.fillStyle = "#241C14";
    g.fillText(seg[0], 48, titleY);
    var w0 = g.measureText(seg[0]).width;
    g.fillStyle = "#FF6B35";
    g.fillText(liang, 48 + w0, titleY);
    var w1 = g.measureText(liang).width;
    g.fillStyle = "#241C14";
    g.fillText(seg[1], 48 + w0 + w1, titleY);
  } else {
    g.fillStyle = "#241C14";
    g.fillText(nk, 48, titleY);
  }

  g.fillStyle = "#7B6E5F";
  g.font = "700 23px " + FONT;
  g.fillText(R.title + " · 酒量第 " + (R.band + 1) + "/7 级", 48, titleY + 48);

  /* 评语卡 */
  g.font = "800 29px " + FONT;
  var rl = wrapText(g, R.roast, 566);
  var qh = 40 + rl.length * 44;
  sticker(g, 48, 322, 654, qh, 20, "#241C14");
  g.fillStyle = "#FFEFC2";
  g.font = "800 29px " + FONT;
  g.fillText("“", 66, 352);
  for (var i = 0; i < rl.length; i++){
    g.fillText(rl[i], 100, 372 + i * 44);
  }

  /* 数据卡 */
  var cardY = 322 + qh + 22;
  sticker(g, 48, cardY, 654, 300, 20, "#FFFFFF");

  var rows = [
    {b:"酒量基数", v:R.pct + " / 100", w:R.pct / 100, c:"#FF6B35", cap:R.warn},
    {b:"懂行程度", v:R.know + " / 2",   w:R.know / 2,    c:"#37C9AE", cap:R.knowDesc},
    {b:"饮酒节奏", v:R.speedName, w:(R.speedKey === "fast" ? .88 : R.speedKey === "steady" ? .62 : .34), c:"#FFCE3A", cap:SPEED_DESC[R.speedKey]}
  ];

  for (var r = 0; r < rows.length; r++){
    var by = cardY + 40 + r * 92;
    g.font = "800 25px " + FONT;
    g.fillStyle = "#4A3F33";
    g.fillText(rows[r].b, 80, by);
    g.fillStyle = "#E4521C";
    g.font = "900 25px " + FONT;
    g.textAlign = "right";
    g.fillText(rows[r].v, 670, by);
    g.textAlign = "left";

    var ty = by + 16;
    g.fillStyle = "#F1E7D2";
    rr(g, 80, ty, 590, 16, 8); g.fill();
    g.fillStyle = rows[r].c;
    var fw = Math.max(16, 590 * rows[r].w);
    rr(g, 80, ty, fw, 16, 8); g.fill();

    g.fillStyle = "#7B6E5F";
    g.font = "600 21px " + FONT;
    g.fillText(rows[r].cap, 80, ty + 44);
  }

  /* 折算 */
  var cvy = cardY + 320;
  sticker(g, 48, cvy, 318, 100, 18, "#FFF1C9");
  sticker(g, 384, cvy, 318, 100, 18, "#E4F6F1");

  g.fillStyle = "#241C14";
  g.font = "900 40px " + FONT;
  g.fillText(R.ml + " ml", 76, cvy + 52);
  g.fillStyle = "#5C5145";
  g.font = "700 20px " + FONT;
  g.fillText("52 度白酒 · 约 " + (R.ml / 50).toFixed(1) + " 两", 76, cvy + 80);

  g.fillStyle = "#241C14";
  g.font = "900 40px " + FONT;
  g.fillText(R.beer + " 瓶", 412, cvy + 52);
  g.fillStyle = "#5C5145";
  g.font = "700 20px " + FONT;
  g.fillText("折算啤酒 · 500ml", 412, cvy + 80);

  /* 徽章 */
  var bdgY = cvy + 122;
  var bdgs = [R.knowName, R.speedName, R.arch + "档"];
  var bx = 48;
  for (var b = 0; b < bdgs.length; b++){
    g.font = "800 21px " + FONT;
    var bwd = g.measureText(bdgs[b]).width + 34;
    sticker(g, bx, bdgY, bwd, 46, 23, R.know >= 2 && b === 0 ? "#FF8FB1" : "#FFFFFF");
    g.fillStyle = "#241C14";
    g.font = "800 21px " + FONT;
    g.fillText(bdgs[b], bx + 17, bdgY + 30);
    bx += bwd + 10;
  }

  /* 金句 */
  var mY = bdgY + 66;
  g.save();
  g.fillStyle = "#FFF3D0";
  rr(g, 48, mY, 654, 96, 18); g.fill();
  g.setLineDash([9, 7]);
  g.lineWidth = 3.5;
  g.strokeStyle = "#241C14";
  rr(g, 48, mY, 654, 96, 18); g.stroke();
  g.restore();

  g.fillStyle = "#8A7A62";
  g.font = "800 19px " + FONT;
  g.fillText("你的酒桌金句", 74, mY + 32);
  g.fillStyle = "#241C14";
  g.font = "800 26px " + FONT;
  g.fillText(R.motto, 74, mY + 68);

  /* 二维码 */
  if (qr){
    var qx = W - 48 - qrW;
    g.fillStyle = "#FFFFFF";
    rr(g, qx, qrY, qrW, qrW, 16); g.fill();
    g.lineWidth = 3.5; g.strokeStyle = "#241C14";
    rr(g, qx, qrY, qrW, qrW, 16); g.stroke();
    g.fillStyle = "#241C14";
    for (var pr = 0; pr < qrn; pr++){
      for (var pc = 0; pc < qrn; pc++){
        if (qr.isDark(pr, pc)){
          g.fillRect(qx + 11 + pc * qrCell, qrY + 11 + pr * qrCell, qrCell + .4, qrCell + .4);
        }
      }
    }
    g.fillStyle = "#241C14";
    g.font = "900 28px " + FONT;
    g.fillText("扫码 · 测测你几两", 48, qrY + qrW / 2 - 4);
    g.fillStyle = "#8A7A62";
    g.font = "700 20px " + FONT;
    g.fillText("jiuliang-test.app.workbuddy.host", 48, qrY + qrW / 2 + 30);
  }

  /* 底部 */
  g.fillStyle = "#7B6E5F";
  g.font = "700 20px " + FONT;
  g.textAlign = "center";
  g.fillText("结果仅供娱乐 · 适度饮酒 · 切勿酒驾", 375, H - 30);
  g.textAlign = "left";

  return cv;
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
