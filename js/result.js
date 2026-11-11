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
  var size = Math.floor((vh - 230) / n * 0.9);
  if (size > 168) size = 168;
  if (size < 42) size = 42;
  for (var i = 0; i < n; i++){
    var s = document.createElement("span");
    s.textContent = nick.charAt(i);
    s.style.fontSize = size + "px";
    el.appendChild(s);
  }
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
      '<p class="show-brand">你，几两？</p>' +
      '<div class="show-nick" id="showNick"></div>' +
      '<p class="show-pct" id="showPct"></p>' +
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
  stage.style.background = face.bg;
  stage.style.color = face.fg;
  fillShowNick($("showNick"), R.nick || "");
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
  var knowPct = Math.round(state.know / 2 * 100);
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
      '<span class="rtag">你的酒桌绰号 · 第 ' + (band + 1) + '/7 级</span>' +
      '<button class="reroll" id="reroll" type="button">↻ 换一个</button>' +
    '</div>' +
    '<h2 class="rtitle" id="rtitle">' + nickHtml(R.nick, band) + '</h2>' +
    '<p class="rsub">' + esc(R.title) + '</p>' +
    '<p class="pctline' + (band === 0 ? " soft" : "") + '" id="pctline">' + esc(claim) + '</p>' +
    vsHtml +
    '<blockquote class="quote">' + esc(R.roast) + '</blockquote>' +
    '<div class="stats">' +
      '<div class="stat">' +
        '<div class="row"><b>酒量基数</b><span>' + R.pct + ' / 100</span></div>' +
        '<div class="track"><i data-w="' + R.pct + '"></i></div>' +
        '<div class="cap">' + esc(R.warn) + '</div>' +
      '</div>' +
      '<div class="stat">' +
        '<div class="row"><b>懂行程度</b><span>' + R.know + ' / 2</span></div>' +
        '<div class="track m"><i data-w="' + knowPct + '"></i></div>' +
        '<div class="cap">' + esc(R.knowDesc) + '</div>' +
      '</div>' +
      '<div class="stat">' +
        '<div class="row"><b>饮酒节奏</b><span>' + esc(R.speedName) + '</span></div>' +
        '<div class="track y"><i data-w="' + (R.speedKey === "fast" ? 88 : R.speedKey === "steady" ? 62 : 34) + '"></i></div>' +
        '<div class="cap">' + esc(SPEED_DESC[R.speedKey]) + '</div>' +
      '</div>' +
    '</div>' +
    '<div class="convert">' +
      '<div class="conv"><b>' + R.ml + ' ml</b><span>52 度白酒 · 约 ' + (R.ml / 50).toFixed(1) + ' 两</span></div>' +
      '<div class="conv"><b>' + R.beer + ' 瓶</b><span>折算啤酒 · 500ml</span></div>' +
    '</div>' +
    '<div class="modes">' +
      '<button type="button" class="mode" id="pass">出示同桌</button>' +
      '<button type="button" class="mode on" id="moments">发朋友圈</button>' +
    '</div>' +
    '<div class="actions">' +
      '<button class="btn" id="save" type="button">保存图片</button>' +
      '<p class="savehint" id="savehint">弹出后请长按图片，才能存进相册</p>' +
      '<div class="row2">' +
        '<button class="btn ghost" id="share" type="button">分享</button>' +
        '<button class="btn ghost" id="again" type="button">再测一次</button>' +
      '</div>' +
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
      sResult.querySelectorAll(".track i").forEach(function(el){ el.style.width = el.dataset.w + "%"; });
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
  $("moments").addEventListener("click", function(){
    markMode("moments");
    saveImage(this);
  });
  $("save").addEventListener("click", function(){ saveImage(this); });
  $("share").addEventListener("click", function(){ shareResult(this); });
}
