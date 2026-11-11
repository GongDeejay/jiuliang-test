/* 保存、系统分享、长按浮层与文案复制。触屏判定在 isTouch。
   navigator.share 在无头环境会挂起，1.6 秒后仍弹长按浮层，这个兜底不能拿掉。 */
"use strict";

function fileName(){
  var kind = cardMode === "show" ? "出示" : "朋友圈";
  return "酒桌绰号-" + kind + "-" + (R.nick || R.arch) + ".png";
}

function shareSentence(){
  var nick = (R && R.nick) ? R.nick : "";
  var url = resultUrl();
  return "我是" + nick + "，你几两？" + (url ? " " + url : "");
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

function hookToolsHtml(){
  if (cardMode !== "moments" || !state || !state.picks || state.picks.length < 8) return "";
  var cur = activeHook();
  var age = ageHook(state.picks);
  var html = '<div class="imgov-tools">';
  if (cur){
    html += '<p class="imgov-hook">这句上桌：' + esc(cur.text) + '</p>';
    html += '<button type="button" class="imgov-tool" data-act="skip">不上这句</button>';
  } else {
    html += '<p class="imgov-hook">这句没写上朋友圈</p>';
    html += '<button type="button" class="imgov-tool" data-act="restore">写上这句</button>';
  }
  if (age){
    if (state.hookAge && !state.hookSkip){
      html += '<button type="button" class="imgov-tool" data-act="ageoff">不上断片年纪</button>';
    } else {
      html += '<button type="button" class="imgov-tool" data-act="ageon">写上断片年纪</button>';
    }
  }
  html += "</div>";
  return html;
}

function bindHookTools(ov){
  var buttons = ov.querySelectorAll(".imgov-tool");
  for (var i = 0; i < buttons.length; i++){
    buttons[i].addEventListener("click", function(e){
      e.stopPropagation();
      var act = this.getAttribute("data-act");
      if (act === "skip"){ state.hookSkip = true; state.hookAge = false; }
      else if (act === "restore"){ state.hookSkip = false; state.hookAge = false; }
      else if (act === "ageon"){ state.hookSkip = false; state.hookAge = true; }
      else if (act === "ageoff"){ state.hookSkip = false; state.hookAge = false; }
      refreshOverlay(ov);
    });
  }
}

function refreshOverlay(ov){
  var img = ov.querySelector("img");
  var url = cardDataUrl();
  if (url && img){
    img.src = url;
    var hook = activeHook();
    img.setAttribute("data-hook", hook ? hook.text : "");
    img.setAttribute("data-layout", cardMode);
  }
  var tools = ov.querySelector(".imgov-tools");
  var html = hookToolsHtml();
  if (tools){
    if (html) tools.outerHTML = html;
    else tools.parentNode.removeChild(tools);
  } else if (html){
    var hint = ov.querySelector(".imgov-hint");
    if (hint) hint.insertAdjacentHTML("afterend", html);
  }
  bindHookTools(ov);
}

function showImageOverlay(dataUrl){
  if (!dataUrl) { toast("生成失败，请长按页面截图"); return; }
  var hook = activeHook();
  var ov = document.createElement("div");
  ov.className = "imgov";
  ov.innerHTML =
    '<div class="imgov-card">' +
      '<p class="imgov-badge">长按下方图片保存</p>' +
      '<img alt="' + esc(R && R.nick ? R.nick : "结果图") + '" data-layout="' + cardMode + '" data-hook="' + esc(hook ? hook.text : "") + '">' +
      '<p class="imgov-hint">按住图片不放，存到相册或发给朋友</p>' +
      hookToolsHtml() +
      '<button class="imgov-close" type="button">关 闭</button>' +
    "</div>";
  ov.querySelector("img").src = dataUrl;
  document.body.appendChild(ov);
  bindHookTools(ov);
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
  var text = shareSentence();
  cardBlob().then(function(blob){
    if (isTouch()){
      if (canShareFiles(blob)){
        var file = new File([blob], fileName(), {type:"image/png"});
        shareWithFallback(navigator.share({files:[file], title:"我是" + R.nick + "，你几两？", text:text}), btn);
      } else {
        showImageOverlay(cardDataUrl());
      }
    } else {
      copy(text, btn);
    }
  }).catch(function(){ copy(text, btn); });
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
