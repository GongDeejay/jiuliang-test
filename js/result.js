/* 结算页：绰号、刻度、对照，并接上出示 / 朋友圈 / 保存 / 分享。 */
"use strict";

function confetti(host){
  var colors = ["#FF6B35", "#FFCE3A", "#37C9AE", "#FF8FB1", "#7C6CE0"];
  var box = document.createElement("div");
  box.className = "confetti";
  for (var i = 0; i < 20; i++){
    var s = document.createElement("i");
    s.style.left = (Math.random() * 98) + "%";
    s.style.background = colors[i % colors.length];
    s.style.animationDelay = (Math.random() * 0.7).toFixed(2) + "s";
    s.style.animationDuration = (1.7 + Math.random() * 1.1).toFixed(2) + "s";
    box.appendChild(s);
  }
  host.appendChild(box);
  setTimeout(function(){ if (box.parentNode) box.parentNode.removeChild(box); }, 3400);
}

function faceAttr(key){
  var f = STYLE_FACE[key] || STYLE_FACE.jianghu;
  return "background:" + f.bg + ";color:" + f.fg;
}

function nickHtml(nick, band){
  var liang = LIANG[band];
  if (nick.indexOf(liang) >= 0) return esc(nick).replace(esc(liang), "<span>" + esc(liang) + "</span>");
  return esc(nick);
}

/* 酒瓶液位：瓶身内壁 y=20..92，液体高度按 pct 比例，rAF 里再填入 */
function bottleSvg(){
  return '<svg class="bottle" viewBox="0 0 44 96" aria-hidden="true">' +
    '<defs><clipPath id="bclip"><rect x="5" y="20" width="34" height="72" rx="9"/></clipPath></defs>' +
    '<rect class="liq" x="5" y="92" width="34" height="0" fill="#FF6B35" clip-path="url(#bclip)"/>' +
    '<rect x="15" y="2" width="14" height="16" rx="2" fill="#FFFDF6" stroke="#241C14" stroke-width="2.5"/>' +
    '<rect x="5" y="18" width="34" height="74" rx="9" fill="none" stroke="#241C14" stroke-width="2.5"/>' +
    '<path d="M11 30 h22" stroke="rgba(36,28,20,.15)" stroke-width="2"/>' +
  '</svg>';
}

/* 酒瓶数量刻度：7 档酒量点亮 band+1 只瓶 */
function bottleRowSvg(band, h){
  var lit = Math.min(band + 1, 7);
  var out = '<svg viewBox="0 0 240 58" style="height:' + h + 'px" aria-hidden="true" class="brow">';
  for (var i = 0; i < 7; i++){
    out += '<g transform="translate(' + (i * 34 + 2) + ' 0)" stroke="#241C14" stroke-width="2.5" stroke-linejoin="round" fill="' + (i < lit ? "#FF6B35" : "none") + '">' +
      '<path d="M12 4 v8 q-8 4 -8 12 v22 q0 7 7 7 h10 q7 0 7 -7 v-22 q0 -8 -8 -12 v-8 z"/>' +
    '</g>';
  }
  return out + '</svg>';
}

function paintPageQr(){
  var url = resultUrl();
  var qimg = $("qimg");
  var line = $("shareline");
  if (line && R) line.textContent = "我是" + R.nick + "，你几两？";
  if (!qimg) return;
  qimg.setAttribute("data-url", url);
  qimg.alt = (R && R.nick ? R.nick + " · " : "") + "扫码测一测";
  try {
    var qr = qrcode(0, "M");
    qr.addData(url);
    qr.make();
    qimg.src = qr.createDataURL(4, 2);
  } catch (e) {
    var row = $("qrow");
    if (row) row.style.display = "none";
  }
}

function fillShowNick(el, nick){
  el.innerHTML = "";
  var n = nick.length;
  var vh = window.innerHeight || 667;
  var size = Math.floor((vh - 320) / n * 0.9);
  if (size > 158) size = 158;
  if (size < 42) size = 42;
  for (var i = 0; i < n; i++){
    var s = document.createElement("span");
    s.textContent = nick.charAt(i);
    s.style.fontSize = size + "px";
    el.appendChild(s);
  }
}

/* 出示层二维码：截图党也能扫进来 */
function paintShowQr(){
  var img = $("showQrImg");
  if (!img) return;
  try {
    var qr = qrcode(0, "M");
    qr.addData(resultUrl() || location.href.split("#")[0]);
    qr.make();
    img.src = qr.createDataURL(4, 2);
  } catch (e) { img.parentNode.style.display = "none"; }
}

function closeShowStage(){
  var stage = $("showstage");
  if (stage) stage.classList.remove("on");
  document.body.classList.remove("showing");
}

function openShowStage(){
  markMode("show");
  var stage = $("showstage");
  if (!stage){
    stage = document.createElement("div");
    stage.id = "showstage";
    stage.className = "showstage";
    stage.innerHTML =
      '<p class="show-tag" id="showTag"></p>' +
      '<div class="show-nick" id="showNick"></div>' +
      '<div class="show-stamp" id="showStamp"></div>' +
      '<div class="show-bottles" id="showBottles"></div>' +
      '<p class="show-pct" id="showPct"></p>' +
      '<div class="show-qr" id="showQr">' +
        '<img id="showQrImg" alt="扫码测一测">' +
        '<b>扫码 · 测测你几两</b>' +
      '</div>' +
      '<div class="show-bar">' +
        '<button type="button" class="btn" id="showSave">保存出示图</button>' +
        '<button type="button" class="btn ghost" id="showClose">收起</button>' +
        '<p class="savehint">弹出后请长按图片，或直接把手机递过去</p>' +
      "</div>";
    document.body.appendChild(stage);
    $("showClose").addEventListener("click", closeShowStage);
    $("showSave").addEventListener("click", function(){
      markMode("show");
      saveImage(this);
    });
  }
  var face = styleFace();
  stage.style.background = "#FFF7E3";
  stage.style.color = "#241C14";
  var tag = $("showTag");
  tag.textContent = STYLE_NAME[R.styleKey] || "";
  tag.style.background = face.bg;
  tag.style.color = face.fg;
  fillShowNick($("showNick"), R.nick || "");
  var stamp = $("showStamp");
  var sw = (STAMP_WORDS[R.band] || "酒桌免检");
  stamp.innerHTML = "<i>" + sw.slice(0, 2) + "<br>" + sw.slice(2) + "</i>";
  var sbot = $("showBottles");
  sbot.innerHTML = bottleRowSvg(R.band, 22);
  paintShowQr();
  var short = pctClaim(R.pct, R.band, true);
  var pct = $("showPct");
  pct.textContent = short;
  pct.style.display = short ? "block" : "none";
  stage.classList.add("on");
  document.body.classList.add("showing");
}

function syncNickBits(){
  var t = $("rtitle");
  if (t){
    t.innerHTML = nickHtml(R.nick, R.band);
    t.classList.remove("swap"); void t.offsetWidth; t.classList.add("swap");
  }
  var me = document.querySelector("#vs .vs-card:last-child b");
  if (me) me.textContent = R.nick;
  var line = $("vsLine");
  if (line && peer && peer.ok) line.textContent = compareTalk(R, peer);
  paintPageQr();
}

function renderResult(delay){
  markMode("moments");
  var band = R.band;
  var list = nickList(R.name);
  R.nickIdx = ((R.nickIdx || 0) + list.length) % list.length;
  R.nick = list[R.nickIdx];

  var claim = pctClaim(R.pct, band, false);
  var vsHtml = "";
  if (peer && peer.ok && peer.nick){
    vsHtml =
      '<div class="vs" id="vs">' +
        '<div class="vs-card" style="' + faceAttr(peer.styleKey) + '"><small>对方</small><b>' + esc(peer.nick) + '</b><em>' + esc(peer.style) + '</em></div>' +
        '<div class="vs-card" style="' + faceAttr(R.styleKey) + '"><small>你</small><b>' + esc(R.nick) + '</b><em>' + esc(R.style) + '</em></div>' +
      '</div>' +
      '<p class="vs-line" id="vsLine">' + esc(compareTalk(R, peer)) + '</p>';
  }

  var html =
    '<div class="rhead">' +
      '<button class="reroll" id="reroll" type="button">↻ 换一个</button>' +
    '</div>' +
    '<div class="rhero">' +
      '<div class="rherotxt">' +
        '<h2 class="rtitle" id="rtitle">' + nickHtml(R.nick, band) + '</h2>' +
        '<p class="rsub">' + esc(R.title) + '</p>' +
      '</div>' +
      '<div class="rfig">' + (STYLE_FIG[R.styleKey] || "") + '</div>' +
    '</div>' +
    '<p class="pctline' + (band === 0 ? " soft" : "") + '" id="pctline">' + esc(claim) + '</p>' +
    vsHtml +
    '<blockquote class="quote">' + esc(R.roast) + '</blockquote>' +
    '<div class="stats">' +
      '<div class="stat">' +
        bottleSvg() +
        '<div class="statmain">' +
          '<div class="row"><b>酒量基数</b><span>' + R.pct + ' / 100</span></div>' +
          '<div class="cap">' + esc(R.warn) + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="stickers">' +
        '<span class="stk stk-red">懂行 ' + R.know + '/2</span>' +
        '<span class="stk stk-teal">' + esc(R.speedName) + '</span>' +
        (R.know === 2 ? '<span class="stk stk-gold">全场最懂</span>' : '') +
      '</div>' +
    '</div>' +
    '<div class="modes single">' +
      '<button type="button" class="mode" id="pass">官方认证</button>' +
    '</div>' +
    '<div class="row2">' +
      '<button class="btn ghost" id="share" type="button">分享</button>' +
      '<button class="btn ghost" id="again" type="button">再测一次</button>' +
    '</div>' +
    '<div class="qrow" id="qrow">' +
      '<img class="qimg" id="qimg" alt="扫码测一测">' +
      '<div class="qtxt"><b id="shareline">我是' + esc(R.nick) + '，你几两？</b><span>扫码进同一局 · 娱乐向 · 切勿酒驾</span></div>' +
    '</div>';

  sResult.innerHTML = html;
  show(sResult);
  confetti(sResult);
  paintPageQr();

  requestAnimationFrame(function(){
    setTimeout(function(){
      var liq = sResult.querySelector(".liq");
      if (liq){
        var hh = 72 * Math.max(3, Math.min(99, R.pct)) / 100;
        liq.setAttribute("y", (92 - hh).toFixed(1));
        liq.setAttribute("height", hh.toFixed(1));
      }
    }, delay || 160);
  });

  $("reroll").addEventListener("click", function(){
    var arr = nickList(R.name);
    R.nickIdx = (R.nickIdx + 1) % arr.length;
    R.nick = arr[R.nickIdx];
    syncNickBits();
  });

  $("again").addEventListener("click", function(){
    closeShowStage();
    reset();
    if (peer && peer.ok) renderInvite();
    else show(sIntro);
  });
  $("pass").addEventListener("click", function(){ openShowStage(); });
  $("share").addEventListener("click", function(){ shareResult(this); });
}
