/* 酒牌短码。编码顺序固定，已经发出去的链接靠它还原绰号。
   线上发布的 ?sharecode= 有时是站点门禁（例如 W4XEIG3UOR），不是结果。
   那种码原样保留，结果写在 from= 上，旧二维码仍能打开页面。 */
"use strict";

/* 顺序即编码，不要改 */
var STYLE_KEYS = ["book", "hero", "gourmet", "host", "escape", "jianghu"];
var B32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function crc16(bytes){
  var crc = 0xFFFF;
  for (var i = 0; i < bytes.length; i++){
    crc ^= bytes[i] << 8;
    for (var b = 0; b < 8; b++){
      if (crc & 0x8000) crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      else crc = (crc << 1) & 0xFFFF;
    }
  }
  return crc;
}

function utf8Encode(str){
  var bytes = [];
  for (var i = 0; i < str.length; i++){
    var c = str.charCodeAt(i);
    if (c < 0x80) bytes.push(c);
    else if (c < 0x800) bytes.push(0xC0 | (c >> 6), 0x80 | (c & 0x3F));
    else bytes.push(0xE0 | (c >> 12), 0x80 | ((c >> 6) & 0x3F), 0x80 | (c & 0x3F));
  }
  return bytes;
}

function utf8Decode(bytes){
  var out = "", i = 0;
  while (i < bytes.length){
    var c = bytes[i];
    if (c < 0x80){ out += String.fromCharCode(c); i++; }
    else if ((c & 0xE0) === 0xC0 && i + 1 < bytes.length){
      out += String.fromCharCode(((c & 31) << 6) | (bytes[i + 1] & 63));
      i += 2;
    } else if ((c & 0xF0) === 0xE0 && i + 2 < bytes.length){
      out += String.fromCharCode(((c & 15) << 12) | ((bytes[i + 1] & 63) << 6) | (bytes[i + 2] & 63));
      i += 3;
    } else return null;
  }
  return out;
}

function b32encode(bytes){
  var out = "", bits = 0, val = 0;
  for (var i = 0; i < bytes.length; i++){
    val = (val << 8) | bytes[i];
    bits += 8;
    while (bits >= 5){
      bits -= 5;
      out += B32.charAt((val >> bits) & 31);
    }
  }
  if (bits > 0) out += B32.charAt((val << (5 - bits)) & 31);
  return out;
}

function b32decode(str){
  var map = {};
  for (var i = 0; i < B32.length; i++) map[B32.charAt(i)] = i;
  var s = String(str || "").toUpperCase().replace(/[IL]/g, "1").replace(/O/g, "0");
  if (!s || s.length > 24) return null;
  var bytes = [], bits = 0, val = 0;
  for (var j = 0; j < s.length; j++){
    var v = map[s.charAt(j)];
    if (v == null) return null;
    val = (val << 5) | v;
    bits += 5;
    if (bits >= 8){
      bits -= 8;
      bytes.push((val >> bits) & 255);
    }
  }
  if (bits > 0 && (val & ((1 << bits) - 1)) !== 0) return null;
  return bytes;
}

function encodeShare(res){
  if (!res) return "";
  var name = cleanName(res.name);
  if (!name || cleanName(name) !== name) return "";
  var nameBytes = utf8Encode(name);
  if (nameBytes.length !== 3 && nameBytes.length !== 6) return "";
  var styleIdx = STYLE_KEYS.indexOf(res.styleKey);
  if (styleIdx < 0) return "";
  var band = res.band | 0;
  if (band < 0 || band > 6) return "";
  var list = nickCandidates(name, band, res.styleKey);
  if (!list.length) return "";
  var nickIdx = list.indexOf(res.nick);
  if (nickIdx < 0) nickIdx = (res.nickIdx || 0) % list.length;
  if (nickIdx > 3) return "";
  var bytes = [(1 << 4) | name.length];
  for (var i = 0; i < nameBytes.length; i++) bytes.push(nameBytes[i]);
  bytes.push((band << 5) | (styleIdx << 2) | nickIdx);
  var c = crc16(bytes);
  bytes.push((c >> 8) & 255, c & 255);
  return b32encode(bytes);
}

function decodeShare(token){
  if (!token || typeof token !== "string") return null;
  if (!/^[0-9A-Za-z]{12}$/.test(token) && !/^[0-9A-Za-z]{16}$/.test(token)) return null;
  var bytes = b32decode(token);
  if (!bytes || (bytes.length !== 7 && bytes.length !== 10)) return null;
  var crc = (bytes[bytes.length - 2] << 8) | bytes[bytes.length - 1];
  var body = bytes.slice(0, bytes.length - 2);
  if (crc16(body) !== crc) return null;
  var ver = body[0] >> 4;
  var nameLen = body[0] & 15;
  if (ver !== 1 || (nameLen !== 1 && nameLen !== 2)) return null;
  var nb = nameLen * 3;
  if (body.length !== 1 + nb + 1) return null;
  var name = utf8Decode(body.slice(1, 1 + nb));
  if (!name || !/^[\u4e00-\u9fa5]{1,2}$/.test(name) || cleanName(name) !== name) return null;
  var flags = body[1 + nb];
  var band = flags >> 5;
  var styleIdx = (flags >> 2) & 7;
  var nickIdx = flags & 3;
  if (band > 6 || styleIdx > 5) return null;
  var styleKey = STYLE_KEYS[styleIdx];
  var list = nickCandidates(name, band, styleKey);
  if (!list.length) return null;
  var nick = list[nickIdx % list.length];
  if (!nick) return null;
  return {
    ok: true,
    name: name,
    band: band,
    styleKey: styleKey,
    style: STYLE_NAME[styleKey],
    arch: ARCH[band].name,
    nickIdx: nickIdx % list.length,
    nick: nick
  };
}

function pageHref(){
  if (typeof location === "undefined" || !location || !location.href) return "";
  return location.href.split("#")[0];
}

function queryOf(href){
  var i = href.indexOf("?");
  return i < 0 ? "" : href.slice(i + 1);
}

function splitQuery(q){
  if (!q) return [];
  var parts = q.split("&"), out = [];
  for (var i = 0; i < parts.length; i++){ if (parts[i]) out.push(parts[i]); }
  return out;
}

function paramKey(part){
  var i = part.indexOf("=");
  var raw = i < 0 ? part : part.slice(0, i);
  try { return decodeURIComponent(raw.replace(/\+/g, " ")); }
  catch (e) { return raw; }
}

function getParam(name){
  var parts = splitQuery(queryOf(pageHref()));
  for (var i = 0; i < parts.length; i++){
    if (paramKey(parts[i]) !== name) continue;
    var eq = parts[i].indexOf("=");
    var raw = eq < 0 ? "" : parts[i].slice(eq + 1);
    try { return decodeURIComponent(raw.replace(/\+/g, " ")); }
    catch (e) { return raw; }
  }
  return "";
}

function setParam(q, key, value){
  var parts = splitQuery(q);
  var out = [];
  var found = false;
  var next = encodeURIComponent(key) + "=" + encodeURIComponent(value);
  for (var i = 0; i < parts.length; i++){
    if (paramKey(parts[i]) === key){
      if (!found){ out.push(next); found = true; }
    } else out.push(parts[i]);
  }
  if (!found) out.push(next);
  return out.join("&");
}

function delParam(q, key){
  var parts = splitQuery(q), out = [];
  for (var i = 0; i < parts.length; i++){
    if (paramKey(parts[i]) !== key) out.push(parts[i]);
  }
  return out.join("&");
}

/* 别人打开这张图的二维码，会先看见这张酒牌，再进入答题。 */
function resultUrl(){
  var href = pageHref();
  if (!href || !R) return href;
  var token = encodeShare(R);
  if (!token) return href;
  var base = href.split("?")[0];
  var q = queryOf(href);
  var sc = getParam("sharecode");
  if (sc && !decodeShare(sc)){
    q = setParam(q, "from", token);
  } else {
    q = setParam(q, "sharecode", token);
    q = delParam(q, "from");
  }
  return q ? base + "?" + q : base;
}

function readInbound(){
  var from = getParam("from");
  if (from){
    var d = decodeShare(from);
    if (d) return d;
    return {invalid: true};
  }
  var sc = getParam("sharecode");
  if (sc){
    var d2 = decodeShare(sc);
    if (d2) return d2;
  }
  return null;
}
