/* automatically generated by JSCoverage - do not edit */
try {
  if (typeof top === 'object' && top !== null && typeof top.opener === 'object' && top.opener !== null) {
    // this is a browser window that was opened from another window

    if (! top.opener._$jscoverage) {
      top.opener._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null) {
    // this is a browser window

    try {
      if (typeof top.opener === 'object' && top.opener !== null && top.opener._$jscoverage) {
        top._$jscoverage = top.opener._$jscoverage;
      }
    }
    catch (e) {}

    if (! top._$jscoverage) {
      top._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null && top._$jscoverage) {
    _$jscoverage = top._$jscoverage;
  }
}
catch (e) {}
if (typeof _$jscoverage !== 'object') {
  _$jscoverage = {};
}
if (! _$jscoverage['javascript.js']) {
  _$jscoverage['javascript.js'] = [];
  _$jscoverage['javascript.js'][1] = 0;
  _$jscoverage['javascript.js'][2] = 0;
  _$jscoverage['javascript.js'][3] = 0;
  _$jscoverage['javascript.js'][5] = 0;
  _$jscoverage['javascript.js'][7] = 0;
  _$jscoverage['javascript.js'][9] = 0;
  _$jscoverage['javascript.js'][10] = 0;
  _$jscoverage['javascript.js'][11] = 0;
  _$jscoverage['javascript.js'][12] = 0;
  _$jscoverage['javascript.js'][14] = 0;
  _$jscoverage['javascript.js'][15] = 0;
  _$jscoverage['javascript.js'][16] = 0;
  _$jscoverage['javascript.js'][24] = 0;
  _$jscoverage['javascript.js'][25] = 0;
  _$jscoverage['javascript.js'][26] = 0;
  _$jscoverage['javascript.js'][27] = 0;
}
_$jscoverage['javascript.js'].source = ["FB<span class=\"k\">.</span>api<span class=\"k\">(</span><span class=\"s\">'/me/albums'</span><span class=\"k\">,</span>  <span class=\"k\">function</span><span class=\"k\">(</span>res<span class=\"k\">)</span> <span class=\"k\">{</span>","  <span class=\"k\">var</span> albums <span class=\"k\">=</span> res<span class=\"k\">.</span>data<span class=\"k\">;</span>","  <span class=\"k\">var</span> firstPicAdded <span class=\"k\">=</span> <span class=\"k\">false</span><span class=\"k\">;</span>","  ","  <span class=\"k\">for</span> <span class=\"k\">(</span><span class=\"k\">var</span> i<span class=\"k\">=</span><span class=\"s\">0</span><span class=\"k\">;</span> i<span class=\"k\">&lt;</span>albums<span class=\"k\">.</span>length<span class=\"k\">;</span> i<span class=\"k\">++)</span> <span class=\"k\">{</span>","    ","    FB<span class=\"k\">.</span>api<span class=\"k\">(</span><span class=\"s\">'/'</span><span class=\"k\">+</span>albums<span class=\"k\">[</span>i<span class=\"k\">].</span>id <span class=\"k\">+</span> <span class=\"s\">'/photos'</span><span class=\"k\">,</span> <span class=\"k\">function</span><span class=\"k\">(</span>res<span class=\"k\">)</span> <span class=\"k\">{</span>","      ","      \t<span class=\"k\">var</span> pictures <span class=\"k\">=</span> res<span class=\"k\">.</span>data<span class=\"k\">;</span>","\t\t<span class=\"k\">for</span> <span class=\"k\">(</span><span class=\"k\">var</span> j<span class=\"k\">=</span><span class=\"s\">0</span><span class=\"k\">;</span> j<span class=\"k\">&lt;</span>pictures<span class=\"k\">.</span>length<span class=\"k\">;</span> j<span class=\"k\">++)</span> <span class=\"k\">{</span>","        \t<span class=\"k\">if</span> <span class=\"k\">(</span>pictures<span class=\"k\">[</span>j<span class=\"k\">].</span>source<span class=\"k\">)</span> <span class=\"k\">{</span>","          \t\t$<span class=\"k\">(</span><span class=\"s\">\".slides\"</span><span class=\"k\">).</span>append<span class=\"k\">(</span><span class=\"s\">\"&lt;section&gt;&lt;img src='\"</span> <span class=\"k\">+</span> pictures<span class=\"k\">[</span>j<span class=\"k\">].</span>source <span class=\"k\">+</span> <span class=\"s\">\"'&gt;&lt;/section&gt;\"</span><span class=\"k\">);</span>","","              \t<span class=\"k\">if</span> <span class=\"k\">(!</span>firstPicAdded<span class=\"k\">)</span> <span class=\"k\">{</span>","                \tfirstPicAdded <span class=\"k\">=</span> <span class=\"k\">true</span><span class=\"k\">;</span>","                \tdoInit<span class=\"k\">();</span>  \t","              \t<span class=\"k\">}</span>","            <span class=\"k\">}</span>","      \t<span class=\"k\">}</span>","    <span class=\"k\">}</span><span class=\"k\">);</span>","  <span class=\"k\">}</span>","<span class=\"k\">}</span><span class=\"k\">);</span>","","<span class=\"k\">function</span> doInit<span class=\"k\">()</span> <span class=\"k\">{</span>","  \t$<span class=\"k\">(</span>$<span class=\"k\">(</span><span class=\"s\">\"img\"</span><span class=\"k\">)[</span><span class=\"s\">0</span><span class=\"k\">]).</span>load<span class=\"k\">(</span><span class=\"k\">function</span><span class=\"k\">()</span> <span class=\"k\">{</span>","      \t$<span class=\"k\">(</span><span class=\"s\">\"h1.mainText\"</span><span class=\"k\">).</span>html<span class=\"k\">(</span><span class=\"s\">\"Use Arrow keys to navigate album\"</span><span class=\"k\">);</span>","    \tReveal<span class=\"k\">.</span>initialize<span class=\"k\">();</span>","  \t<span class=\"k\">}</span><span class=\"k\">);</span>","<span class=\"k\">}</span>","",""];
_$jscoverage['javascript.js'][1]++;
FB.api("/me/albums", (function (res) {
  _$jscoverage['javascript.js'][2]++;
  var albums = res.data;
  _$jscoverage['javascript.js'][3]++;
  var firstPicAdded = false;
  _$jscoverage['javascript.js'][5]++;
  for (var i = 0; (i < albums.length); (i++)) {
    _$jscoverage['javascript.js'][7]++;
    FB.api(("/" + albums[i].id + "/photos"), (function (res) {
  _$jscoverage['javascript.js'][9]++;
  var pictures = res.data;
  _$jscoverage['javascript.js'][10]++;
  for (var j = 0; (j < pictures.length); (j++)) {
    _$jscoverage['javascript.js'][11]++;
    if (pictures[j].source) {
      _$jscoverage['javascript.js'][12]++;
      $(".slides").append(("<section><img src='" + pictures[j].source + "'></section>"));
      _$jscoverage['javascript.js'][14]++;
      if ((! firstPicAdded)) {
        _$jscoverage['javascript.js'][15]++;
        firstPicAdded = true;
        _$jscoverage['javascript.js'][16]++;
        doInit();
      }
    }
}
}));
}
}));
_$jscoverage['javascript.js'][24]++;
function doInit() {
  _$jscoverage['javascript.js'][25]++;
  $($("img")[0]).load((function () {
  _$jscoverage['javascript.js'][26]++;
  $("h1.mainText").html("Use Arrow keys to navigate album");
  _$jscoverage['javascript.js'][27]++;
  Reveal.initialize();
}));
}
