/* 入口：其余脚本就位后绑定「开始」，有酒牌短码就先落地再答题。 */
"use strict";

$("start").addEventListener("click", function(){ reset(); show(sQuiz); render(); });

function boot(){
  var inbound = null;
  try { inbound = readInbound(); }
  catch (e) { inbound = null; }
  if (inbound && inbound.ok){
    peer = inbound;
    renderInvite();
  } else if (inbound && inbound.invalid){
    toast("这张酒牌对不上，你先测自己的");
  }
}
boot();
