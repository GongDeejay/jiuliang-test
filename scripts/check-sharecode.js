/* 酒牌短码、刻度文案、对照句。不启浏览器。由 scripts/verify.sh 调用。 */
"use strict";

var fs = require("fs");
var vm = require("vm");
var path = require("path");

var root = path.resolve(__dirname, "..");
var ctx = {};
vm.createContext(ctx);
["data.js", "js/score.js", "js/sharecode.js"].forEach(function(f){
  vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), ctx, {filename: f});
});

var failed = 0;
function assert(cond, msg){
  if (!cond){
    failed++;
    console.error("❌ " + msg);
  }
}

var styles = ctx.STYLE_KEYS;
["宋", "李", "欧阳"].forEach(function(name){
  for (var band = 0; band < 7; band++){
    styles.forEach(function(style){
      var list = ctx.nickCandidates(name, band, style);
      list.forEach(function(nick, i){
        var token = ctx.encodeShare({name: name, band: band, styleKey: style, nick: nick, nickIdx: i});
        assert(token, "编码为空 " + name + band + style + i);
        var d = ctx.decodeShare(token);
        assert(d && d.nick === nick && d.band === band && d.styleKey === style && d.name === name, "往返失败 " + name + " " + nick);
        var tampered = (token.charAt(0) === "0" ? "1" : "0") + token.slice(1);
        assert(ctx.decodeShare(tampered) === null, "篡改仍能解开 " + token);
        assert(ctx.decodeShare(token.toLowerCase()) && ctx.decodeShare(token.toLowerCase()).nick === nick, "小写失败 " + token);
      });
    });
  }
});

assert(ctx.decodeShare("W4XEIG3UOR") === null, "门禁码被当成结果");
assert(ctx.decodeShare("AAAA") === null, "过短");
assert(ctx.decodeShare("") === null, "空串");
assert(ctx.encodeShare({name:"A", band:1, styleKey:"book", nick:"A一口", nickIdx:0}) === "", "字母姓不该编码");

var golden = ctx.encodeShare({name:"宋", band:5, styleKey:"hero", nick:"宋一斤", nickIdx:0});
assert(golden === "27JTX2X42CWG", "宋一斤短码变了: " + golden);
assert(ctx.decodeShare("27JTX2X42CWG").nick === "宋一斤", "金样例解不开");

assert(ctx.pctClaim(5, 0, false).indexOf("%") < 0, "最低档不该报百分比");
assert(ctx.pctClaim(5, 0, false).indexOf("只") < 0, "最低档不该用「只」");
assert(ctx.pctClaim(5, 0, true) === "", "出示版最低档应留空");
assert(ctx.pctClaim(74, 5, false).indexOf("按这套题的刻度") >= 0, "刻度依据");
assert(ctx.pctClaim(74, 5, false).indexOf("74%") >= 0, "74");
assert(ctx.pctClaim(74, 5, false).indexOf("全国") < 0 && ctx.pctClaim(74, 5, false).indexOf("全网") < 0, "不要写成普查");
assert(ctx.pctClaim(22, 1, false).indexOf("盖过了 22%") >= 0, "次低档用盖过");

var low = ctx.compareTalk({band:5, styleKey:"hero"}, {band:0, styleKey:"escape"});
assert(low.indexOf("一斤对一口") >= 0 && low.indexOf("醒着") >= 0, low);
var gap = ctx.compareTalk({band:6, styleKey:"jianghu"}, {band:2, styleKey:"book"});
assert(gap.indexOf("三斤对三两") >= 0 && gap !== low, gap);
var tie = ctx.compareTalk({band:3, styleKey:"book"}, {band:3, styleKey:"book"});
assert(tie.indexOf("都是半斤") >= 0, tie);
var clash = ctx.compareTalk({band:3, styleKey:"book"}, {band:3, styleKey:"hero"});
assert(clash.indexOf("半斤对半斤") >= 0 && clash.indexOf("书生碰豪侠") >= 0, clash);

ctx.location = {href: "https://jiuliang-test.app.workbuddy.host/?sharecode=W4XEIG3UOR"};
ctx.R = {name:"宋", band:5, styleKey:"hero", nick:"宋一斤", nickIdx:0};
var kept = ctx.resultUrl();
assert(kept.indexOf("sharecode=W4XEIG3UOR") >= 0, "门禁码被覆盖 " + kept);
assert(kept.indexOf("from=27JTX2X42CWG") >= 0, "结果没写进 from " + kept);
assert(ctx.readInbound() === null, "裸门禁码不该落地");

ctx.location = {href: "https://jiuliang-test.app.workbuddy.host/?sharecode=W4XEIG3UOR&from=27JTX2X42CWG"};
var inbound = ctx.readInbound();
assert(inbound && inbound.nick === "宋一斤" && inbound.style === "豪侠", "from 落地失败");

ctx.location = {href: "http://127.0.0.1:8899/index.html"};
assert(ctx.resultUrl() === "http://127.0.0.1:8899/index.html?sharecode=27JTX2X42CWG", ctx.resultUrl());
ctx.location = {href: "http://127.0.0.1:8899/index.html?sharecode=27JTX2X42CWG"};
assert(ctx.readInbound().nick === "宋一斤", "sharecode 结果码");

ctx.location = {href: "http://127.0.0.1:8899/index.html?from=AAAAAA"};
assert(ctx.readInbound() && ctx.readInbound().invalid === true, "坏 from 应标无效");

if (failed){
  console.error("❌ 短码检查 " + failed + " 项失败");
  process.exit(1);
}
console.log("✓ 短码 / 刻度 / 对照句");
