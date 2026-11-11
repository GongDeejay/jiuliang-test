  var FINGER = '<svg viewBox="0 0 40 62" xmlns="http://www.w3.org/2000/svg">' +
    '<g stroke="#241C14" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">' +
      '<rect x="12" y="3" width="16" height="40" rx="8" fill="#FFD9B8"/>' +
      '<path d="M9 36 q11 5 22 0 l3 16 q-14 6 -28 0 z" fill="#FFD9B8"/>' +
    '</g></svg>';

  /* ---------- Q2 四件器皿 ---------- */
  var VESSELS = [
    /* 茶杯 */
    '<svg viewBox="0 0 80 88" xmlns="http://www.w3.org/2000/svg">' +
      '<g stroke="#241C14" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">' +
        '<path d="M21 36 h34 v20 a12 12 0 0 1 -12 12 h-10 a12 12 0 0 1 -12 -12 z" fill="#FFFDF6"/>' +
        '<path d="M55 41 h7 a8 8 0 0 1 0 16 h-7" fill="none"/>' +
        '<ellipse cx="38" cy="36" rx="17" ry="4.6" fill="#37C9AE"/>' +
        '<path d="M32 27 q4 -6 0 -10" fill="none" stroke="#8A7A62" stroke-width="2"/>' +
        '<path d="M42 27 q4 -6 0 -10" fill="none" stroke="#8A7A62" stroke-width="2"/>' +
        '<path d="M18 77 h48" fill="none" stroke-opacity=".28"/>' +
      '</g></svg>',
    /* 白酒瓶 */
    '<svg viewBox="0 0 80 88" xmlns="http://www.w3.org/2000/svg">' +
      '<g stroke="#241C14" stroke-width="2.5" stroke-linejoin="round">' +
        '<rect x="35" y="6" width="10" height="8" rx="2.5" fill="#FF6B35"/>' +
        '<path d="M35 14 v9 q-11 6 -11 18 v29 a7 7 0 0 0 7 7 h18 a7 7 0 0 0 7 -7 v-29 q0 -12 -11 -18 v-9" fill="#FFD9C7"/>' +
        '<rect x="30" y="46" width="20" height="24" rx="3" fill="#FFF7E3"/>' +
        '<text x="40" y="64" text-anchor="middle" font-size="13" font-weight="800" fill="#241C14" stroke="none">酒</text>' +
      '</g></svg>',
    /* 小酒杯 */
    '<svg viewBox="0 0 80 88" xmlns="http://www.w3.org/2000/svg">' +
      '<g stroke="#241C14" stroke-width="2.5" stroke-linejoin="round">' +
        '<path d="M27 32 h26 l-3.6 28 a9 9 0 0 1 -9 8.4 h-.8 a9 9 0 0 1 -9 -8.4 z" fill="#FFFDF6"/>' +
        '<path d="M28.6 48 h22.8 l-2.4 15.6 a7.5 7.5 0 0 1 -7.2 6.4 h-3.6 a7.5 7.5 0 0 1 -7.2 -6.4 z" fill="#FFCE3A"/>' +
        '<path d="M20 77 h40" fill="none" stroke-opacity=".28"/>' +
      '</g></svg>',
    /* 酒坛子 */
    '<svg viewBox="0 0 80 88" xmlns="http://www.w3.org/2000/svg">' +
      '<g stroke="#241C14" stroke-width="2.5" stroke-linejoin="round">' +
        '<path d="M22 32 q18 -7 36 0 q6 3 6 10 v22 q0 9 -9 9 h-30 q-9 0 -9 -9 v-22 q0 -7 6 -10 z" fill="#FFE1EA"/>' +
        '<path d="M16 32 q24 -12 48 0 v-8 q-24 -10 -48 0 z" fill="#FF6B35"/>' +
        '<rect x="31" y="44" width="18" height="16" rx="2.5" fill="#FFF7E3"/>' +
        '<text x="40" y="57" text-anchor="middle" font-size="11" font-weight="800" fill="#241C14" stroke="none">酒</text>' +
        '<path d="M17 77 h46" fill="none" stroke-opacity=".28"/>' +
      '</g></svg>'
  ];

  /* ---------- Q3 年龄手绘 ---------- */
  var AGES = [
    /* 初中：个子小、书包快比人大 */
    '<svg viewBox="0 0 84 104" xmlns="http://www.w3.org/2000/svg">' +
      '<g stroke="#241C14" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" fill="none">' +
        '<circle cx="46" cy="25" r="10.5" fill="#FFE9CF"/>' +
        '<path d="M36 22 q10 -9 20 0"/>' +
        '<path d="M46 35.5 v19"/>' +
        '<path d="M46 41 l-9 8"/>' +
        '<path d="M46 41 l9 8"/>' +
        '<path d="M46 54 l-6 23 M46 54 l7 23"/>' +
        '<path d="M40 77 h-6 M53 77 h6"/>' +
        '<rect x="20" y="44" width="15" height="21" rx="4.5" fill="#FF6B35" stroke-width="2.2"/>' +
        '<path d="M23 44 q4.5 -8 9 0" stroke-width="2.2"/>' +
      '</g></svg>',
    /* 高中：眼镜、卷子不离手 */
    '<svg viewBox="0 0 84 104" xmlns="http://www.w3.org/2000/svg">' +
      '<g stroke="#241C14" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" fill="none">' +
        '<circle cx="43" cy="21" r="10.5" fill="#FFE9CF"/>' +
        '<path d="M33 18 q10 -8 20 0"/>' +
        '<circle cx="39" cy="21" r="4" stroke-width="2"/>' +
        '<circle cx="47.5" cy="21" r="4" stroke-width="2"/>' +
        '<path d="M43 21 h.4" stroke-width="2"/>' +
        '<path d="M43 31.5 v21"/>' +
        '<path d="M43 37 l-11 11"/>' +
        '<path d="M43 37 l10 5"/>' +
        '<rect x="52" y="38" width="14" height="18" rx="2" fill="#FFF7E3" stroke-width="2.2" transform="rotate(12 59 47)"/>' +
        '<path d="M55 45 l8 2 M54 50 l8 2" stroke-width="1.6" stroke-opacity=".7"/>' +
        '<path d="M43 52 l-7 25 M43 52 l8 25"/>' +
        '<path d="M36 78 h-6 M51 78 h6"/>' +
      '</g></svg>',
    /* 大学：乱发、拖鞋、手里一瓶 */
    '<svg viewBox="0 0 84 104" xmlns="http://www.w3.org/2000/svg">' +
      '<g stroke="#241C14" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" fill="none">' +
        '<circle cx="42" cy="20" r="10" fill="#FFE9CF"/>' +
        '<path d="M32 17 q3 -8 8 -4 q3 -8 9 -3 q6 -4 6 6"/>' +
        '<path d="M32 30 q10 -5 20 0 l2 20 q-12 4 -24 0 z" fill="#EAF7F3"/>' +
        '<path d="M40 50 h10 l1 9 h-12 z" fill="#FFCE3A"/>' +
        '<path d="M42 59 l-1 14 M49 59 l1 14"/>' +
        '<ellipse cx="38" cy="76" rx="7" ry="3.5" fill="#FF6B35"/>' +
        '<ellipse cx="52" cy="76" rx="7" ry="3.5" fill="#FF6B35"/>' +
        '<path d="M52 36 l9 -4"/>' +
        '<path d="M61 20 v6" stroke-width="2"/>' +
        '<path d="M58 26 q3 -4 6 0 v7 l-6 0 z" fill="#FFD9C7" stroke-width="2.2"/>' +
      '</g></svg>',
    /* 工作后：领带、公文包、应酬举杯 */
    '<svg viewBox="0 0 84 104" xmlns="http://www.w3.org/2000/svg">' +
      '<g stroke="#241C14" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" fill="none">' +
        '<circle cx="42" cy="20" r="10.5" fill="#FFE9CF"/>' +
        '<path d="M31 17 q11 -9 22 0"/>' +
        '<path d="M31 32 q11 -5 22 0 l2 24 q-13 4 -26 0 z" fill="#FFFFFF"/>' +
        '<path d="M42 32 l-3.5 6 l3.5 10 l3.5 -10 z" fill="#FF6B35" stroke-width="2"/>' +
        '<path d="M53 37 l10 8"/>' +
        '<rect x="59" y="38" width="11" height="13" rx="2" fill="#FFD9C7" stroke-width="2.2"/>' +
        '<path d="M31 37 l-9 6"/>' +
        '<rect x="16" y="46" width="13" height="16" rx="2.5" fill="#8A6B4F" stroke-width="2.2"/>' +
        '<path d="M20.5 46 v-3 q0 -2 2 -2 q2 0 2 2 v3" stroke-width="2"/>' +
        '<path d="M38 58 l-3 19 M46 58 l3 19"/>' +
        '<path d="M35 78 h-6 M49 78 h6"/>' +
      '</g></svg>',
    /* 现在：衬衫、保温杯 */
    '<svg viewBox="0 0 84 104" xmlns="http://www.w3.org/2000/svg">' +
      '<g stroke="#241C14" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" fill="none">' +
        '<circle cx="41" cy="20" r="11" fill="#FFE9CF"/>' +
        '<path d="M30 17 q11 -9 22 0"/>' +
        '<path d="M31 32 q10 -5 20 0 l2 26 q-12 4 -24 0 z" fill="#FFFFFF"/>' +
        '<path d="M37 32 l4 7 l4 -7" stroke-width="2"/>' +
        '<path d="M41 39 v6" stroke-width="2"/>' +
        '<path d="M51 39 l9 9"/>' +
        '<rect x="56" y="52" width="12" height="15" rx="3" fill="#FFCE3A" stroke-width="2.2"/>' +
        '<rect x="55" y="47" width="14" height="6" rx="2" fill="#FFF7E3" stroke-width="2.2"/>' +
        '<path d="M41 58 l-3 18 M48 58 l3 18"/>' +
        '<path d="M38 77 h-6 M51 77 h6"/>' +
      '</g></svg>'
  ];


  var QUESTIONS = [
    /* ---------- 1. 省份酒窝地图 ---------- */
    {
      type: "pmap",
      t: "你的家乡，落在哪个酒窝里？",
      s: "左右滑动地图，找到你的家乡"
    },
    /* ---------- 2. 四件器物 ---------- */
    {
      type: "vessels",
      t: "小时候，家里的长辈怎么喝酒？",
      s: "看器皿点 · 用什么喝，就是什么量",
      o: [
        {v:"茶杯", d:"滴酒不沾", t:"滴酒不沾，家里没酒味", cap:0,  st:{book:2, escape:1}, r:"家里没酒味，全靠后天努力。"},
        {v:"白酒瓶", d:"逢节才开一瓶", t:"逢年过节才开一瓶", cap:6,  st:{book:1}, r:"仪式感选手，一年三回。"},
        {v:"小酒杯", d:"每餐二两", t:"每餐二两，雷打不动", cap:14, st:{jianghu:2, gourmet:1}, r:"这是刻在基因里的作息，服。"},
        {v:"酒坛子", d:"自酿藏酒", t:"自酿、存酒、还藏两坛", cap:18, st:{gourmet:3, jianghu:1}, r:"酒坛边长大的，藏不住。"}
      ]
    },
    /* ---------- 3. 年龄群像 ---------- */
    {
      type: "ages",
      t: "第一次喝到断片，是几岁？",
      s: "往左边点 · 屏幕会跟着你一起断片",
      o: [
        {v:"初中", age:"13 岁前", d:"偷偷尝的第一口", t:"初中，甚至更早", cap:5,  st:{jianghu:2, hero:1}, sp:{fast:2}, r:"起点太早，这笔账身体记着。"},
        {v:"高中", age:"16 岁上下", d:"跟同学比胆量", t:"高中，偷偷喝的", cap:10, st:{hero:2}, sp:{fast:2}, r:"胆子比酒量大，这是实话。"},
        {v:"大学", age:"19 岁上下", d:"宿舍那晚", t:"大学，宿舍那晚", cap:13, st:{host:1, hero:1}, sp:{fast:1}, r:"青春的标准结局，懂的都懂。"},
        {v:"工作后", age:"23 岁上下", d:"入职酒局练出来的", t:"工作后，酒局教的", cap:13, st:{host:1, jianghu:1}, sp:{steady:1}, r:"团建喝出来的量，账都记在公司头上。"},
        {v:"到现在", age:"还没断过", d:"纪录保持者", t:"从没断片过", cap:8,  st:{book:2, escape:1}, sp:{steady:1}, r:"从没断过，要么克制，要么没喝。"}
      ]
    },
    /* ---------- 4. 圆桌 ---------- */
    {
      type: "table",
      t: "上了酒桌，你坐哪一格？",
      s: "点座位 · 瞒不住的，早被人看穿了",
      o: [
        {seat:"top",    ch:"敬", v:"敬酒", d:"你先起身，别人才敢动", t:"领头敬酒的那个", cap:12, st:{host:3}, sp:{fast:1, steady:1}, r:"你先起身，别人才敢动。"},
        {seat:"right",  ch:"挡", v:"挡酒", d:"你的肝替别人值班", t:"帮别人挡酒的那个", cap:10, st:{hero:3}, sp:{fast:1}, r:"你的肝在替别人值班。"},
        {seat:"bottom", ch:"吃", v:"吃菜", d:"菜是主角，酒是背景音", t:"埋头吃菜的那个", cap:4, st:{gourmet:3}, sp:{slow:1}, r:"菜是主角，这个我支持。"},
        {seat:"left",   ch:"溜", v:"先走", d:"再出现时已在发红包", t:"中途消失的那个", cap:2, st:{escape:3}, sp:{slow:2}, r:"再出现时，你已经在群里发红包了。"}
      ]
    },
    /* ---------- 5. 敲桌 ---------- */
    {
      type: "knock",
      t: "别人给你倒酒，对方用食指和中指在桌面敲三下，这是在？",
      s: "看它敲完再答 · 答对亮徽章",
      o: [
        {t:"叩指道谢",     d:"一种从茶桌借来的礼数", know:1, cap:4, r:"答对了。这是从茶桌借到酒桌上的谢礼。"},
        {t:"催你快点儿",   d:"越敲越急的那种",       cap:0, r:"敲得急是想让你停，不是催你。"},
        {t:"嫌你倒太多了", d:"倒多了会直接说",       cap:0, r:"嫌多会直接说，不用这么客气。"},
        {t:"让你自罚一杯", d:"罚酒不用敲桌子",       cap:0, r:"罚酒不用敲桌子，这题你亏了。"}
      ]
    },
    /* ---------- 6. 数字 ---------- */
    {
      type: "digits",
      t: "酱香型白酒的「12987」里，那个「8」指什么？",
      s: "知识题 · 答对亮徽章",
      o: [
        {t:"八个轮次取酒", cap:0, r:"差一点。取酒是 7 次。"},
        {t:"八次发酵",     know:1, cap:6, r:"内行。这题能刷掉九成人。"},
        {t:"八年窖藏",     cap:0, r:"好酒确实要存，但数字不对。"},
        {t:"八种粮食",     cap:0, r:"高粱才是主角，不是八种。"}
      ]
    },
    /* ---------- 7. 对话 ---------- */
    {
      type: "chat",
      t: "北方大哥拍着你的肩说了句话，你怎么接？",
      s: "酒桌上最危险的一句话",
      o: [
        {t:"那就一起干了",         d:"气势不能输",       cap:16, st:{hero:3}, sp:{fast:3}, r:"气势满分，后果自负。"},
        {t:"真随意，抿一小口",     d:"你听懂了字面意思", cap:4,  st:{book:2, escape:1}, sp:{slow:2}, r:"你听懂了字面意思，聪明。"},
        {t:"「那我也陪你干了」",   d:"还加了一句场面话", cap:13, st:{host:2, hero:2}, sp:{fast:2, steady:1}, r:"场面话都接住了，高手。"},
        {t:"悄悄把酒换成茶",       d:"你活到了最后",     cap:2,  st:{escape:3}, sp:{slow:3}, r:"你活到了最后，这局你赢。"}
      ]
    },
    /* ---------- 8. 二场 ---------- */
    {
      type: "battery",
      t: "第一场刚散，群里又开始组二场。",
      s: "看看你还剩几格电",
      o: [
        {lv:4, v:"满格 · 还能再战",   t:"我来组，我订位", cap:20, st:{host:3}, sp:{steady:2, fast:1}, r:"你根本不知道累字怎么写。"},
        {lv:3, v:"三格 · 得找插座",   t:"能去，先坐会儿", cap:12, st:{jianghu:2, book:1}, sp:{steady:3}, r:"知道自己的电量，成熟。"},
        {lv:1, v:"一格 · 省电模式",   t:"去了，只喝汤", cap:4,  st:{escape:2, book:1}, sp:{slow:3}, r:"汤是你的护身符，稳。"},
        {lv:0, v:"已关机 · 明早说",   t:"不去，叫代驾了", cap:0,  st:{escape:3}, sp:{slow:3}, r:"全场唯一清醒的人，敬你。"}
      ]
    }
  ];

  /* ---------- 酒区分组与省份地图数据 ---------- */
  var BUCKETS = [
    {nm:"酱香高地",   cap:16, st:{jianghu:2, gourmet:1}, r:"{p}的空气里都飘着酒糟味，出厂自带免疫，稳。"},
    {nm:"浓香窝",     cap:15, st:{host:2, gourmet:1},    r:"{p}人从小闻着酒糟长大，酒量不掺水。"},
    {nm:"清香带",     cap:13, st:{book:2},               r:"{p}人喝酒，干净利落，第二杯才刚上路。"},
    {nm:"豪饮圈",     cap:14, st:{hero:3},               r:"{p}的酒桌，杯子没有底。"},
    {nm:"黄酒乡",     cap:7,  st:{book:3},               r:"{p}人喝黄酒都要温一温，讲究。"},
    {nm:"米酒洋酒区", cap:9,  st:{gourmet:2, escape:1},  r:"{p}人米香洋酒两手抓，狠人。"}
  ];
  var BCOL = ["#FFD9C7", "#FFF1C9", "#EAF7F3", "#FFE1EA", "#E3EEFF", "#EDE7FA"];

  var BOTTLE = '<svg class="btl" viewBox="0 0 20 34" xmlns="http://www.w3.org/2000/svg">' +
    '<g stroke="#241C14" stroke-width="2" stroke-linejoin="round">' +
      '<rect x="7" y="1" width="6" height="6" fill="#FFF7E3"/>' +
      '<path d="M7 7 L7 13 Q2 15 2 21 L2 30 Q2 33 5 33 L15 33 Q18 33 18 30 L18 21 Q18 15 13 13 L13 7 Z" fill="#FF6B35"/>' +
    '</g></svg>';

  /* nm=显示名 br=代表品牌 c/r=格位 w=横向跨格 b=酒区分组 bot=名酒产地(画酒瓶) */
  var PROVINCES = [
    {nm:"黑龙江", br:"北大仓",   c:11, r:1, w:2, b:3},
    {nm:"吉林",   br:"榆树钱",   c:12, r:2, b:3},
    {nm:"辽宁",   br:"老龙口",   c:11, r:3, b:3},
    {nm:"内蒙古", br:"河套王",   c:5,  r:1, w:4, b:2},
    {nm:"北京",   br:"二锅头",   c:10, r:2, b:3, bot:1},
    {nm:"天津",   br:"津酒",     c:11, r:2, b:3},
    {nm:"河北",   br:"老白干",   c:9,  r:2, b:3},
    {nm:"山西",   br:"汾酒",     c:8,  r:2, b:2, bot:1},
    {nm:"陕西",   br:"西凤",     c:7,  r:2, b:2, bot:1},
    {nm:"宁夏",   br:"老银川",   c:6,  r:2, b:2},
    {nm:"甘肃",   br:"金徽酒",   c:3,  r:1, w:2, b:2},
    {nm:"新疆",   br:"伊力特",   c:1,  r:1, w:2, b:2, bot:1},
    {nm:"西藏",   br:"青稞酒",   c:1,  r:2, w:2, b:2},
    {nm:"青海",   br:"天佑德",   c:3,  r:2, b:2},
    {nm:"四川",   br:"五粮液",   c:4,  r:2, w:2, b:1, bot:1},
    {nm:"重庆",   br:"江小白",   c:5,  r:3, b:1},
    {nm:"云南",   br:"玉林泉",   c:3,  r:3, b:0},
    {nm:"贵州",   br:"茅台",     c:4,  r:3, b:0, bot:1},
    {nm:"湖北",   br:"白云边",   c:6,  r:3, b:3},
    {nm:"河南",   br:"仰韶",     c:7,  r:3, w:2, b:3},
    {nm:"山东",   br:"景芝",     c:9,  r:3, b:3, bot:1},
    {nm:"江苏",   br:"洋河",     c:10, r:3, b:4, bot:1},
    {nm:"广西",   br:"三花酒",   c:3,  r:4, w:2, b:5},
    {nm:"广东",   br:"玉冰烧",   c:5,  r:4, b:5, bot:1},
    {nm:"湖南",   br:"酒鬼酒",   c:6,  r:4, b:3},
    {nm:"江西",   br:"四特酒",   c:7,  r:4, b:3},
    {nm:"安徽",   br:"古井贡",   c:8,  r:4, b:3},
    {nm:"浙江",   br:"绍兴酒",   c:9,  r:4, b:4},
    {nm:"上海",   br:"石库门",   c:10, r:4, b:4},
    {nm:"海南",   br:"海口大曲", c:4,  r:5, b:5},
    {nm:"港澳",   br:"澳门花酒", c:5,  r:5, b:5},
    {nm:"福建",   br:"福矛",     c:9,  r:5, b:5},
    {nm:"台湾",   br:"金门高粱", c:10, r:5, b:5}
  ];

  var ARCH = [
    {name:"三步倒",   min:0,  max:18,  lo:45,  hi:95},
    {name:"一杯就红", min:18, max:32,  lo:95,  hi:170},
    {name:"三两微醺", min:32, max:46,  lo:150, hi:250},
    {name:"半斤正好", min:46, max:60,  lo:250, hi:360},
    {name:"八两不倒", min:60, max:74,  lo:360, hi:500},
    {name:"一斤开外", min:74, max:88,  lo:500, hi:700},
    {name:"千杯不醉", min:88, max:101, lo:700, hi:900}
  ];

  var STYLE_NAME = {book:"书生", hero:"豪侠", gourmet:"老饕", host:"场面人", escape:"逃兵", jianghu:"江湖"};
  /* 酒风色块：出示 / 朋友圈 / 落地页共用，跟贴纸色板同一套 */
  var STYLE_FACE = {
    book:    {bg:"#FFCE3A", fg:"#241C14"},
    hero:    {bg:"#FF6B35", fg:"#241C14"},
    gourmet: {bg:"#37C9AE", fg:"#10241F"},
    host:    {bg:"#FF8FB1", fg:"#3A1020"},
    escape:  {bg:"#D9E4FF", fg:"#241C14"},
    jianghu: {bg:"#241C14", fg:"#FFCE3A"}
  };

  var ROAST = {
    "0-book":"翻开酒单先做笔记，闻到酒味就已经脸红。",
    "0-hero":"口号喊得最响，第三杯就被人扶出门。",
    "0-gourmet":"菜点了八个，酒一口没动。",
    "0-host":"敬得最勤，倒得最快，最后被抬得最远。",
    "0-escape":"洗手间是你的第二个座位。",
    "0-jianghu":"嘴上千年老酒，杯中一口见底。",

    "1-book":"脸红了，脑子还清醒，嘴还更利索了。",
    "1-hero":"先干为敬，后干为躺。",
    "1-gourmet":"全场下酒菜消耗冠军，酒剩半杯。",
    "1-host":"热场全靠嗓门，酒量全靠别人。",
    "1-escape":"茶杯里泡着你的战术。",
    "1-jianghu":"典故一箩筐，酒量一勺。",

    "2-book":"三杯之后开始引经据典，居然句句在理。",
    "2-hero":"敢干三杯，第四杯开始讲兄弟。",
    "2-gourmet":"酒是配角，菜是主角，你是评委。",
    "2-host":"敬一圈刚好，再敬一圈趴下。",
    "2-escape":"离席的时机，永远恰到好处。",
    "2-jianghu":"三杯下肚，开始点评全场。",

    "3-book":"半斤之后，你会开始讲人生哲学。",
    "3-hero":"半斤起步，敬酒不看人，只看杯。",
    "3-gourmet":"酒菜双修，两样都不肯将就。",
    "3-host":"控场、劝酒、然后自己先倒。",
    "3-escape":"能喝，但总是刚好有事。",
    "3-jianghu":"上桌第一件事，是看别人的杯底。",

    "4-book":"醉了也字正腔圆，还能纠正别人的发音。",
    "4-hero":"越喝越清醒，清醒到记得谁还没结账。",
    "4-gourmet":"酒过八两，开始点评后厨。",
    "4-host":"全场酒局的定海神针，也是主犯。",
    "4-escape":"神秘力量：永远比别人少一杯。",
    "4-jianghu":"喝到后半场，开始满桌认亲。",

    "5-book":"一斤之后和你谈康德，逻辑居然没错。",
    "5-hero":"喝完还能把三个人送回家。",
    "5-gourmet":"酒精与美食的双料行家，双份账单。",
    "5-host":"酒局的发动机，偶尔也当刹车。",
    "5-escape":"深藏不露，只在你醉倒之后才现身。",
    "5-jianghu":"一桌人的酒，一个人的肝。",

    "6-book":"酒桌上的百科全书，页码是酒精度。",
    "6-hero":"酒厂的年度大客户，财报靠你。",
    "6-gourmet":"酒精代谢学名誉博士。",
    "6-host":"在座至少三个人的婚礼，是你主持的。",
    "6-escape":"传说级人物，只在别人的回忆里出现。",
    "6-jianghu":"不是能喝，是不肯认输。"
  };

  var WARN = [
    "建议以茶代酒，你的肝会感谢你。",
    "一杯是礼貌，两杯就是冒险了。",
    "微醺刚好，别再被人劝第三杯。",
    "半斤是你的舒适区，也是你的红线。",
    "八两不倒，不代表八两无害。",
    "你赢的是酒局，输的是第二天。",
    "世上没有千杯不醉，只有还没到量。"
  ];

  var SPEED_DESC = {
    fast:   "三杯之内解决战斗，之后的事记不清",
    steady: "匀速推进，全程不掉队也不冒尖",
    slow:   "半杯能抿一小时，靠时间换空间"
  };

  var MOTTO = {
    book:    "白酒是液体的文献，我负责逐页批注。",
    hero:    "杯不满，话不实；话不实，不算兄弟。",
    gourmet: "菜不好可以忍，酒不好不能喝。",
    host:    "这桌上，没有我摆不平的局。",
    escape:  "我以茶代酒，敬各位的肝。",
    jianghu: "酒桌上没有陌生人，只有还没碰杯的人。"
  };

  /* ---------------- 绰号生成：姓 + 酒量 + 酒风 ---------------- */
  var SURNAME_LIST = ["王","李","张","刘","陈","杨","黄","赵","吴","周","徐","孙","马","朱","胡","郭","何","高","林","罗","郑","梁","宋"];
  var COMPOUND = ["欧阳","司马","上官","诸葛","东方","皇甫","慕容","令狐","司徒","公孙","尉迟","长孙","独孤","南宫","西门","夏侯","宇文","轩辕","端木","澹台"];
  var LIANG = ["一口","二两","三两","半斤","八两","一斤","三斤"];

  var NICK_SPECIAL = {
    book:    function(n, l){ return n + l + "先生"; },
    hero:    function(n, l){ return n + "三碗"; },
    gourmet: function(n, l){ return n + "记" + l + "馆"; },
    host:    function(n, l){ return "主陪" + n + l; },
    escape:  function(n, l){ return n + "半杯"; },
    jianghu: function(n, l){ return "江湖" + n + l; }
  };

