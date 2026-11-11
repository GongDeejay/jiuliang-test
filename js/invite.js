/* 带着别人的酒牌进来：先看对方绰号和酒风，再进自己的题。 */
"use strict";

function renderInvite(){
  if (!peer || !peer.ok || !peer.nick){ show(sIntro); return; }
  var face = STYLE_FACE[peer.styleKey] || STYLE_FACE.jianghu;
  var chars = peer.nick.length + 2;
  var nickSize = chars <= 4 ? 64 : chars === 5 ? 54 : chars === 6 ? 46 : 36;
  sInvite.innerHTML =
    '<div class="invite-card">' +
      '<h2 class="invite-line" id="inviteLine"><span class="who">' + esc(peer.name) + '测出了</span><span class="nk" style="font-size:' + nickSize + 'px">「' + esc(peer.nick) + '」</span></h2>' +
      '<div class="invite-style" id="inviteStyle" style="background:' + face.bg + ';color:' + face.fg + '">' + esc(peer.style) + '</div>' +
      '<p class="invite-arch">' + esc(peer.arch) + '</p>' +
      '<button class="btn" id="yourturn" type="button">轮到你了</button>' +
      '<p class="fine">测完把两个绰号摆在一起看</p>' +
    '</div>';
  show(sInvite);
  $("yourturn").addEventListener("click", function(){
    reset();
    show(sQuiz);
    render();
  });
}
