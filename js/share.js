/* 保存、系统分享、长按浮层与文案复制。触屏判定在 isTouch。 */
"use strict";

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
