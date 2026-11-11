(function(){
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

  var $ = function(id){ return document.getElementById(id); };
  var sIntro = $("s-intro"), sQuiz = $("s-quiz"), sName = $("s-name"), sResult = $("s-result");
  var SCREENS = [sIntro, sQuiz, sName, sResult];
  var state, idx, locked, R;

  function reset(){
    state = {cap:0, know:0, sp:{fast:0, steady:0, slow:0}, st:{book:0, hero:0, gourmet:0, host:0, escape:0, jianghu:0}};
    idx = 0; locked = false; R = null;
  }

  function show(el){
    SCREENS.forEach(function(s){ s.classList.remove("on"); });
    el.classList.add("on");
    document.querySelector(".wrap").classList.toggle("splash-mode", el === sIntro);
    window.scrollTo(0, 0);
  }

  function renderPips(){
    var h = "";
    for (var i = 0; i < QUESTIONS.length; i++){
      h += '<i class="' + (i < idx ? "done" : (i === idx ? "now" : "")) + '"></i>';
    }
    $("pips").innerHTML = h;
    $("qcount").textContent = (idx + 1) + " / " + QUESTIONS.length;
  }

  /* ---------- 各题型的版面 ---------- */
  function layoutPMap(q){
    var h = '<div class="pmap-scroll" id="pmapScroll"><div class="pmap" id="opts">';
    PROVINCES.forEach(function(p, i){
      h += '<button class="ptile' + (p.bot ? " gold" : "") + '" data-i="' + i + '" ' +
             'style="grid-area:' + p.r + ' / ' + p.c + ' / span ' + (p.h || 1) + ' / span ' + (p.w || 1) + ';' +
             'background:' + BCOL[p.b] + ';animation-delay:' + (i * 18) + 'ms">' +
           (p.bot ? BOTTLE : "") +
           '<b>' + p.nm + '</b><small>' + p.br + '</small></button>';
    });
    h += '</div></div>';
    h += '<div class="plegend">';
    BUCKETS.forEach(function(b, i){
      h += '<span><i style="background:' + BCOL[i] + '"></i>' + b.nm + '</span>';
    });
    h += '</div>';
    h += '<p class="legend">← 左右滑动找家乡 · 带酒瓶 = 名酒产地 →</p>';
    return h;
  }

  function layoutVessels(q){
    var h = '<div class="vessels" id="opts">';
    q.o.forEach(function(o, i){
      h += '<button class="ves" data-i="' + i + '" style="animation-delay:' + (i * 40) + 'ms">' +
             VESSELS[i] + '<b>' + o.v + '</b><small>' + o.d + '</small>' +
           '</button>';
    });
    h += '</div>';
    return h;
  }

  function layoutAges(q){
    var h = '<div class="ages" id="opts">';
    q.o.forEach(function(o, i){
      h += '<button class="age" data-i="' + i + '" style="animation-delay:' + (i * 45) + 'ms">' +
             AGES[i] + '<span class="yrs">' + o.age + '</span>' +
             '<b>' + o.v + '</b><small>' + o.d + '</small></button>';
    });
    h += '</div>';
    return h;
  }

  function layoutTable(q){
    var h = '<div class="tbl"><div class="tbl-wrap" id="opts">' +
              '<div class="tbltop"><span id="tblTxt">你在<br>哪一格？</span>' +
                '<i class="dish d1"></i><i class="dish d2"></i><i class="dish d3"></i>' +
              '</div>';
    q.o.forEach(function(o, i){
      h += '<button class="seat ' + o.seat + '" data-i="' + i + '" style="animation-delay:' + (i * 45) + 'ms">' +
             '<b>' + o.ch + '</b><em>' + o.v + '</em></button>';
    });
    h += '</div></div>';
    return h;
  }

  function layoutKnock(q){
    var h = '<div class="scene">' +
              '<span class="scene-cap">桌面 · 三下</span>' +
              '<div class="sound">哒 哒 哒</div>' +
              '<div class="tabletop"></div>' +
              '<div class="ripple"></div>' +
              '<div class="hand">' + FINGER + '</div>' +
            '</div>';
    h += '<div class="opts grid2" id="opts">';
    q.o.forEach(function(o, i){
      h += '<button class="opt" data-i="' + i + '" style="animation-delay:' + (i * 40) + 'ms">' +
             '<span class="tag">' + "ABCD"[i] + '</span>' +
             '<span class="txt"><b>' + o.t + '</b></span>' +
           '</button>';
    });
    h += '</div>';
    return h;
  }

  function layoutDigits(q){
    var ds = "12987".split("");
    var h = '<div class="digits">';
    ds.forEach(function(d, i){
      h += '<span class="dg' + (i === 3 ? " hot" : "") + '" id="dg' + i + '" style="animation-delay:' + (i * 60) + 'ms">' + d + '</span>';
    });
    h += '</div><div class="opts grid2" id="opts">';
    q.o.forEach(function(o, i){
      h += '<button class="opt" data-i="' + i + '" style="animation-delay:' + (i * 40) + 'ms">' +
             '<span class="tag">' + "ABCD"[i] + '</span>' +
             '<span class="txt"><b>' + o.t + '</b></span>' +
           '</button>';
    });
    h += '</div>';
    return h;
  }

  function layoutChat(q){
    var h = '<div class="chat">' +
              '<div class="msg"><span class="avatar">哥</span>' +
                '<span class="bubble">我干了，你随意。</span>' +
              '</div>' +
            '</div><div class="replies" id="opts">';
    q.o.forEach(function(o, i){
      h += '<button class="reply" data-i="' + i + '" style="animation-delay:' + (i * 55) + 'ms">' +
             '<span class="bubble">' + o.t + '</span></button>';
    });
    h += '</div>';
    return h;
  }

  function batHTML(lv){
    return '<span class="bat"><i class="shell"><i class="fill" style="width:' + (lv * 25) + '%"></i></i><i class="cap"></i></span>';
  }

  function layoutBattery(q){
    var msgs = [
      {who:"阿强", t:"二场老地方，走不走？"},
      {who:"老李", t:"我已经在路上了"},
      {who:"王总", t:"就等你了兄弟"}
    ];
    var h = '<div class="night"><span class="clock">23:00</span>' +
              '<span class="nighttxt">第一场刚散，桌上人还没走完<br>群里已经开始组二场</span></div>';
    h += '<div class="gchat">';
    msgs.forEach(function(m, i){
      h += '<div class="gmsg" style="animation-delay:' + (0.35 + i * 0.34).toFixed(2) + 's">' +
             '<span class="av">' + m.who.charAt(0) + '</span>' +
             '<span class="bub"><i>' + m.who + '</i>' + m.t + '</span>' +
           '</div>';
    });
    h += '</div>';
    h += '<div class="bcards" id="opts">';
    q.o.forEach(function(o, i){
      h += '<button class="bcard" data-i="' + i + '" style="animation-delay:' + (i * 45) + 'ms">' +
             batHTML(o.lv) +
             '<b>' + o.t + '</b><small>' + o.v + '</small>' +
           '</button>';
    });
    h += '</div>';
    return h;
  }

  var LAYOUT = {
    pmap: layoutPMap, vessels: layoutVessels, ages: layoutAges, table: layoutTable,
    knock: layoutKnock, digits: layoutDigits, chat: layoutChat, battery: layoutBattery
  };

  function render(){
    var q = QUESTIONS[idx];
    renderPips();
    var body = $("qbody");
    body.innerHTML = '<h2 class="qtitle">' + q.t + '</h2><p class="qsub">' + q.s + '</p>' + LAYOUT[q.type](q);
    window.scrollTo(0, 0);

    body.querySelectorAll("[data-i]").forEach(function(el){
      el.addEventListener("click", function(){ pick(el, +el.dataset.i, q); });
    });

    if (q.type === "pmap"){
      var sc = $("pmapScroll");
      if (sc && sc.scrollWidth > sc.clientWidth){
        var max = Math.min(110, sc.scrollWidth - sc.clientWidth);
        sc.scrollTo({left: max, behavior: "smooth"});
        setTimeout(function(){ sc.scrollTo({left: max / 2, behavior: "smooth"}); }, 750);
        setTimeout(function(){ sc.scrollTo({left: 0, behavior: "smooth"}); }, 1500);
      }
    }
  }

  function pick(el, i, q){
    if (locked) return;
    locked = true;
    var o, react;
    if (q.type === "pmap"){
      var prov = PROVINCES[i];
      o = BUCKETS[prov.b];
      react = prov.br + " · " + o.r.replace("{p}", prov.nm);
    } else {
      o = q.o[i];
      react = o.r;
    }
    var box = $("opts");
    if (box) box.classList.add("dim");
    el.classList.add("picked");

    if (q.type === "ages"){
      if (i <= 1) dizzy();
    } else if (q.type === "table"){
      var t = $("tblTxt");
      if (t) t.innerHTML = o.t;
    } else if (q.type === "digits"){
      if (o.know) { var dg = $("dg3"); if (dg) dg.classList.add("reveal"); }
      else { el.animate ? el.animate([{transform:"translateX(0)"},{transform:"translateX(-5px)"},{transform:"translateX(5px)"},{transform:"translateX(0)"}], {duration:220}) : 0; }
    }

    var fb = $("fb");
    fb.textContent = react;
    fb.classList.add("on");

    setTimeout(function(){
      fb.classList.remove("on");
      apply(o);
    }, 1150);
  }

  function dizzy(){
    var w = document.querySelector(".wrap");
    w.classList.add("dizzy");
    setTimeout(function(){ w.classList.remove("dizzy"); }, 520);
  }

  function apply(o){
    state.cap += (o.cap || 0);
    if (o.know) { state.know += o.know; }
    if (o.st) { for (var k in o.st) { state.st[k] += o.st[k]; } }
    if (o.sp) { for (var s in o.sp) { state.sp[s] += o.sp[s]; } }

    idx++;
    locked = false;
    if (idx < QUESTIONS.length) { render(); } else { computeCore(); showName(); }
  }

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

  function fileName(){
    return "酒桌绰号-" + (R.nick || R.arch) + ".png";
  }

  function isTouch(){
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  }

  function canShareFiles(blob){
    try {
      if (!(navigator.canShare && window.File)) return false;
      var f = new File([blob], "a.png", {type:"image/png"});
      return navigator.canShare({files:[f]});
    } catch (e) { return false; }
  }

  function cardDataUrl(){
    try { return drawCard().toDataURL("image/png"); }
    catch (e) { return null; }
  }

  function showImageOverlay(dataUrl){
    if (!dataUrl) { toast("生成失败，请长按页面截图"); return; }
    var ov = document.createElement("div");
    ov.className = "imgov";
    ov.innerHTML =
      '<div class="imgov-card">' +
        '<img alt="长按保存的结果图">' +
        '<p class="imgov-hint">长按图片 · 保存到相册或发给朋友</p>' +
        '<button class="imgov-close" type="button">关 闭</button>' +
      '</div>';
    ov.querySelector("img").src = dataUrl;
    document.body.appendChild(ov);
    requestAnimationFrame(function(){ ov.classList.add("on"); });
    function close(){
      ov.classList.remove("on");
      setTimeout(function(){ if (ov.parentNode) ov.parentNode.removeChild(ov); }, 260);
    }
    ov.addEventListener("click", function(e){
      if (e.target === ov || e.target.classList.contains("imgov-close")) close();
    });
    toast("长按图片可存到相册");
  }

  function shareWithFallback(sharePromise, btn){
    var settled = false;
    var timer = setTimeout(function(){
      if (!settled){ settled = true; showImageOverlay(cardDataUrl()); if (btn) btn.textContent = "长按图片可保存"; }
    }, 1600);
    sharePromise.then(function(){
      settled = true; clearTimeout(timer);
    }).catch(function(err){
      if (settled) return;
      settled = true; clearTimeout(timer);
      if (err && err.name === "AbortError") return; /* 用户主动取消分享面板 */
      showImageOverlay(cardDataUrl());
    });
  }

  function saveImage(btn){
    var old = btn.textContent;
    btn.textContent = "正在生成…";
    cardBlob().then(function(blob){
      if (isTouch()){
        if (canShareFiles(blob)){
          var file = new File([blob], fileName(), {type:"image/png"});
          btn.textContent = old;
          shareWithFallback(navigator.share({files:[file], title:"我的酒桌绰号"}), btn);
        } else {
          showImageOverlay(cardDataUrl());
          btn.textContent = "长按图片可保存";
        }
      } else {
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = fileName();
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function(){ URL.revokeObjectURL(url); }, 4000);
        btn.textContent = "已保存，去相册看看";
        toast("图片已保存");
      }
      setTimeout(function(){ btn.textContent = old; }, 1900);
    }).catch(function(){
      btn.textContent = old;
      toast("生成失败，请长按页面截图");
    });
  }

  function shareResult(btn){
    var shareUrl = location.href.split("#")[0];
    var text = "我的酒桌绰号是「" + R.nick + "」（" + R.title + "）。" + R.roast + " 你也来测测 → " + shareUrl;
    cardBlob().then(function(blob){
      if (isTouch()){
        if (canShareFiles(blob)){
          var file = new File([blob], fileName(), {type:"image/png"});
          shareWithFallback(navigator.share({files:[file], title:"我的酒桌绰号", text:text}), btn);
        } else {
          showImageOverlay(cardDataUrl());
        }
      } else {
        copy(text, btn);
      }
    }).catch(function(){ copy(text, btn); });
  }

  function toast(msg){
    var t = $("toast");
    t.textContent = msg;
    t.classList.add("on");
    setTimeout(function(){ t.classList.remove("on"); }, 1700);
  }

  function copy(text, btn){
    var old = btn.textContent;
    var ok = function(){
      btn.textContent = "已复制";
      toast("文字已复制，去群里发");
      setTimeout(function(){ btn.textContent = old; }, 1700);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(ok, function(){ fallback(text, ok); });
    } else {
      fallback(text, ok);
    }
  }

  function fallback(text, done){
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); done(); } catch (e) { alert(text); }
    document.body.removeChild(ta);
  }

  $("start").addEventListener("click", function(){ reset(); show(sQuiz); render(); });
})();
