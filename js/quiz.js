/* 出题、点选、反馈动画，并把答案推进到下一题或计分。 */
"use strict";

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
    apply(o, i);
  }, 1150);
}

function dizzy(){
  var w = document.querySelector(".wrap");
  w.classList.add("dizzy");
  setTimeout(function(){ w.classList.remove("dizzy"); }, 520);
}

function apply(o, pickAt){
  state.cap += (o.cap || 0);
  if (o.know) { state.know += o.know; }
  if (o.st) { for (var k in o.st) { state.st[k] += o.st[k]; } }
  if (o.sp) { for (var s in o.sp) { state.sp[s] += o.sp[s]; } }
  if (!state.picks) state.picks = [];
  state.picks.push(pickAt);

  idx++;
  locked = false;
  if (idx < QUESTIONS.length) { render(); } else { computeCore(); showName(); }
}
