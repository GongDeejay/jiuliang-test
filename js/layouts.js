/* 八种题型的 HTML 版面。只读 data.js，结果交给 quiz.js 的 render。 */
"use strict";

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
  var h = '<div class="ages' + (q.o.length === 5 ? " five" : "") + '" id="opts">';
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
