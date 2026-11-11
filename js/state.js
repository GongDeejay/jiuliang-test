/* 屏幕切换、答题状态、进度点与轻提示。声明共享绑定 state / idx / locked / R，以及 $、show、reset、toast、renderPips。 */
"use strict";

var $ = function(id){ return document.getElementById(id); };
var sIntro = $("s-intro"), sInvite = $("s-invite"), sQuiz = $("s-quiz"), sName = $("s-name"), sResult = $("s-result");
var SCREENS = [sIntro, sInvite, sQuiz, sName, sResult];
var state, idx, locked, R;
/* peer 是别人酒牌解出来的结果。reset 不清它，再测仍跟同一张牌比。 */
var peer = null;

function esc(s){
  return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
    return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c];
  });
}

function reset(){
  state = {
    cap:0, know:0,
    sp:{fast:0, steady:0, slow:0},
    st:{book:0, hero:0, gourmet:0, host:0, escape:0, jianghu:0},
    picks:[], hookSkip:false, hookAge:false
  };
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

function toast(msg){
  var t = $("toast");
  t.textContent = msg;
  t.classList.add("on");
  setTimeout(function(){ t.classList.remove("on"); }, 1700);
}
