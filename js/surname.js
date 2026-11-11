/* 贵姓页与绰号揭晓动画。确认后调用 renderResult 与 revealNick。 */
"use strict";

/* ---------------- 贵姓 ---------------- */
function showName(){
  var chips = "";
  SURNAME_LIST.forEach(function(s, i){
    chips += '<button class="schip" data-s="' + s + '" style="animation-delay:' + (i * 12) + 'ms">' + s + '</button>';
  });

  sName.innerHTML =
    '<div class="ntag">8 / 8 · 最后一步</div>' +
    '<h2 class="qtitle">您贵姓？</h2>' +
    '<p class="qsub">留个姓，马上就能看到结果</p>' +
    '<div class="namecard" id="namecard">' +
      '<div class="nclabel">酒 牌 · 请 落 笔</div>' +
      '<input id="surname" type="text" maxlength="2" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="点下面选一个，或直接写（复姓也行）">' +
    '</div>' +
    '<div class="schips" id="schips">' + chips + '</div>' +
    '<button class="btn" id="nameGo" style="margin-top:14px;">确认</button>' +
    '<button class="linkbtn" id="nameRand">帮我随便填一个</button>';

  show(sName);

  var inp = $("surname");

  function sync(){
    var n = cleanName(inp.value);
    sName.querySelectorAll(".schip").forEach(function(c){
      c.classList.toggle("on", c.getAttribute("data-s") === n);
    });
  }

  function go(random){
    var n = cleanName(inp.value);
    if (!n && random){ n = SURNAME_LIST[Math.floor(Math.random() * SURNAME_LIST.length)]; inp.value = n; sync(); }
    if (!n){
      var box = $("namecard");
      box.classList.remove("shake"); void box.offsetWidth; box.classList.add("shake");
      toast("还差一个姓");
      if (inp.focus) inp.focus();
      return;
    }
    R.name = n;
    R.nickIdx = 0;
    renderResult(2400);
    revealNick();
  }

  inp.addEventListener("input", sync);
  inp.addEventListener("keydown", function(e){ if (e.key === "Enter"){ e.preventDefault(); go(); } });

  sName.querySelectorAll(".schip").forEach(function(c){
    c.addEventListener("click", function(){
      inp.value = c.getAttribute("data-s");
      sync();
    });
  });

  $("nameGo").addEventListener("click", function(){ go(); });
  $("nameRand").addEventListener("click", function(){ go(true); });
  sync();
}

/* ---------------- 绰号揭晓 ---------------- */
function revealNick(){
  var nk = R.nick;
  var cnt = nk.length;
  var size = cnt <= 3 ? 78 : cnt === 4 ? 64 : cnt === 5 ? 52 : 44;
  var liang = LIANG[R.band];

  var box = document.createElement("div");
  box.id = "reveal";
  box.innerHTML =
    '<div class="rv-rays"></div><div class="rv-glow"></div>' +
    '<p class="rv-kicker">你的酒桌绰号</p>' +
    '<div class="rv-chars" id="rvChars"></div>' +
    '<p class="rv-tip">点一下继续</p>';

  var holder = box.querySelector("#rvChars");
  for (var i = 0; i < cnt; i++){
    var ch = nk.charAt(i);
    var sp = document.createElement("span");
    sp.className = "rv-ch" + (liang.indexOf(ch) >= 0 ? " q" : "");
    sp.textContent = ch;
    sp.style.fontSize = size + "px";
    sp.style.animationDelay = (0.55 + i * 0.13).toFixed(2) + "s";
    holder.appendChild(sp);
  }

  document.body.appendChild(box);
  requestAnimationFrame(function(){ box.classList.add("in"); });

  var burstAt = 520 + cnt * 130;
  var t1 = setTimeout(function(){ burst(); }, burstAt);
  var t2 = setTimeout(function(){ close(); }, burstAt + 780);

  function burst(){
    for (var i = 0; i < 14; i++){
      var s = document.createElement("i");
      s.className = "rv-spark";
      var a = (Math.PI * 2 / 14) * i + Math.random() * 0.4;
      var d = 90 + Math.random() * 95;
      s.style.setProperty("--dx", (Math.cos(a) * d).toFixed(1) + "px");
      s.style.setProperty("--dy", (Math.sin(a) * d).toFixed(1) + "px");
      s.style.background = ["#FFCE3A", "#FF6B35", "#37C9AE", "#FF8FB1"][i % 4];
      s.style.animationDelay = (Math.random() * 0.08).toFixed(2) + "s";
      box.appendChild(s);
    }
  }

  function close(){
    clearTimeout(t1); clearTimeout(t2);
    box.classList.remove("in");
    setTimeout(function(){ if (box.parentNode) box.parentNode.removeChild(box); }, 240);
  }

  setTimeout(function(){ box.addEventListener("click", close); }, 450);
}
