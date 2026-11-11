/* 结算页：绰号、档位条、二维码，并接上保存 / 分享 / 再测。 */
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

function renderResult(delay){
  var band = R.band;
  var knowPct = Math.round(state.know / 2 * 100);
  var list = nickList(R.name);
  R.nickIdx = ((R.nickIdx || 0) + list.length) % list.length;
  R.nick = list[R.nickIdx];

  var liang = LIANG[band];
  var nickHtml = R.nick.indexOf(liang) >= 0
    ? R.nick.replace(liang, '<span>' + liang + '</span>')
    : R.nick;

  var html =
    '<div class="rhead">' +
      '<span class="rtag">你的酒桌绰号 · 第 ' + (band + 1) + '/7 级</span>' +
      '<button class="reroll" id="reroll">↻ 换一个</button>' +
    '</div>' +
    '<h2 class="rtitle" id="rtitle">' + nickHtml + '</h2>' +
    '<p class="rsub">' + R.title + '</p>' +
    '<blockquote class="quote">' + R.roast + '</blockquote>' +
    '<div class="stats">' +
      '<div class="stat">' +
        '<div class="row"><b>酒量基数</b><span>' + R.pct + ' / 100</span></div>' +
        '<div class="track"><i data-w="' + R.pct + '"></i></div>' +
        '<div class="cap">' + R.warn + '</div>' +
      '</div>' +
      '<div class="stat">' +
        '<div class="row"><b>懂行程度</b><span>' + R.know + ' / 2</span></div>' +
        '<div class="track m"><i data-w="' + knowPct + '"></i></div>' +
        '<div class="cap">' + R.knowDesc + '</div>' +
      '</div>' +
      '<div class="stat">' +
        '<div class="row"><b>饮酒节奏</b><span>' + R.speedName + '</span></div>' +
        '<div class="track y"><i data-w="' + (R.speedKey === "fast" ? 88 : R.speedKey === "steady" ? 62 : 34) + '"></i></div>' +
        '<div class="cap">' + SPEED_DESC[R.speedKey] + '</div>' +
      '</div>' +
    '</div>' +
    '<div class="convert">' +
      '<div class="conv"><b>' + R.ml + ' ml</b><span>52 度白酒 · 约 ' + (R.ml / 50).toFixed(1) + ' 两</span></div>' +
      '<div class="conv"><b>' + R.beer + ' 瓶</b><span>折算啤酒 · 500ml</span></div>' +
    '</div>' +
    '<div class="badges">' +
      '<span class="badge' + (R.know >= 2 ? " hot" : "") + '">' + R.knowName + '</span>' +
      '<span class="badge">' + R.speedName + '</span>' +
    '</div>' +
    '<div class="actions">' +
      '<button class="btn" id="save">保存结果图，发群里</button>' +
      '<div class="row2">' +
        '<button class="btn ghost" id="share">分享</button>' +
        '<button class="btn ghost" id="again">再测一次</button>' +
      '</div>' +
    '</div>' +
    '<div class="qrow" id="qrow">' +
      '<img class="qimg" id="qimg" alt="扫码测一测">' +
      '<div class="qtxt"><b>扫码 · 测测你几两</b><span>结果仅供娱乐 · 适度饮酒 · 切勿酒驾</span></div>' +
    '</div>';

  sResult.innerHTML = html;
  show(sResult);
  confetti(sResult);

  var qimg = $("qimg");
  if (qimg){
    try {
      var qr = qrcode(0, "M");
      qr.addData(location.href.split("#")[0]);
      qr.make();
      qimg.src = qr.createDataURL(4, 2);
    } catch (e) { $("qrow").style.display = "none"; }
  }

  requestAnimationFrame(function(){
    setTimeout(function(){
      sResult.querySelectorAll(".track i").forEach(function(el){ el.style.width = el.dataset.w + "%"; });
    }, delay || 160);
  });

  $("reroll").addEventListener("click", function(){
    var arr = nickList(R.name);
    R.nickIdx = (R.nickIdx + 1) % arr.length;
    R.nick = arr[R.nickIdx];
    var t = $("rtitle");
    t.innerHTML = R.nick.indexOf(LIANG[R.band]) >= 0
      ? R.nick.replace(LIANG[R.band], '<span>' + LIANG[R.band] + '</span>')
      : R.nick;
    t.classList.remove("swap"); void t.offsetWidth; t.classList.add("swap");
  });

  $("again").addEventListener("click", function(){ reset(); show(sIntro); });
  $("save").addEventListener("click", function(){ saveImage(this); });
  $("share").addEventListener("click", function(){ shareResult(this); });
}
