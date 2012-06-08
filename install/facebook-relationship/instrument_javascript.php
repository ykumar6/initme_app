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
  _$jscoverage['javascript.js'][3] = 0;
  _$jscoverage['javascript.js'][6] = 0;
  _$jscoverage['javascript.js'][8] = 0;
  _$jscoverage['javascript.js'][11] = 0;
  _$jscoverage['javascript.js'][12] = 0;
  _$jscoverage['javascript.js'][16] = 0;
  _$jscoverage['javascript.js'][17] = 0;
  _$jscoverage['javascript.js'][21] = 0;
  _$jscoverage['javascript.js'][22] = 0;
  _$jscoverage['javascript.js'][28] = 0;
  _$jscoverage['javascript.js'][30] = 0;
  _$jscoverage['javascript.js'][32] = 0;
  _$jscoverage['javascript.js'][33] = 0;
  _$jscoverage['javascript.js'][34] = 0;
  _$jscoverage['javascript.js'][35] = 0;
  _$jscoverage['javascript.js'][36] = 0;
  _$jscoverage['javascript.js'][37] = 0;
  _$jscoverage['javascript.js'][39] = 0;
}
_$jscoverage['javascript.js'].source = ["FB<span class=\"k\">.</span>api<span class=\"k\">(</span><span class=\"s\">'/me/friends?fields=name,relationship_status'</span><span class=\"k\">,</span> <span class=\"k\">function</span><span class=\"k\">(</span>response<span class=\"k\">)</span> <span class=\"k\">{</span>","","  <span class=\"k\">var</span> relationship_types <span class=\"k\">=</span> <span class=\"k\">{}</span><span class=\"k\">;</span>","  ","  <span class=\"c\">//loop through all friends</span>","  <span class=\"k\">for</span> <span class=\"k\">(</span><span class=\"k\">var</span> i<span class=\"k\">=</span><span class=\"s\">0</span><span class=\"k\">;</span> i<span class=\"k\">&lt;</span>response<span class=\"k\">.</span>data<span class=\"k\">.</span>length<span class=\"k\">;</span> i<span class=\"k\">++)</span> <span class=\"k\">{</span>\t","\t","    \t<span class=\"k\">var</span> friend <span class=\"k\">=</span> response<span class=\"k\">.</span>data<span class=\"k\">[</span>i<span class=\"k\">];</span>","    ","    \t<span class=\"c\">//is this friend single? They should mingle!</span>","    \t<span class=\"k\">if</span> <span class=\"k\">(</span>friend<span class=\"k\">.</span>relationship_status <span class=\"k\">&amp;&amp;</span> friend<span class=\"k\">.</span>relationship_status <span class=\"k\">===</span> <span class=\"s\">\"Single\"</span><span class=\"k\">)</span> <span class=\"k\">{</span>","      \t\t$<span class=\"k\">(</span><span class=\"s\">\"#single\"</span><span class=\"k\">).</span>append<span class=\"k\">(</span>createFriendItem<span class=\"k\">(</span>friend<span class=\"k\">));</span>","    \t<span class=\"k\">}</span>","    ","    \t<span class=\"c\">//is this friend in love?</span>","    \t<span class=\"k\">if</span> <span class=\"k\">(</span>friend<span class=\"k\">.</span>relationship_status <span class=\"k\">&amp;&amp;</span> friend<span class=\"k\">.</span>relationship_status <span class=\"k\">===</span> <span class=\"s\">\"In a relationship\"</span><span class=\"k\">)</span> <span class=\"k\">{</span>","      \t\t$<span class=\"k\">(</span><span class=\"s\">\"#relationship\"</span><span class=\"k\">).</span>append<span class=\"k\">(</span>createFriendItem<span class=\"k\">(</span>friend<span class=\"k\">));</span>","    \t<span class=\"k\">}</span>","        ","    \t<span class=\"c\">//is this friend married? Silly them</span>","    \t<span class=\"k\">if</span> <span class=\"k\">(</span>friend<span class=\"k\">.</span>relationship_status <span class=\"k\">&amp;&amp;</span> friend<span class=\"k\">.</span>relationship_status <span class=\"k\">===</span> <span class=\"s\">\"Married\"</span><span class=\"k\">)</span> <span class=\"k\">{</span>","      \t\t$<span class=\"k\">(</span><span class=\"s\">\"#married\"</span><span class=\"k\">).</span>append<span class=\"k\">(</span>createFriendItem<span class=\"k\">(</span>friend<span class=\"k\">));</span>","    \t<span class=\"k\">}</span>","  <span class=\"k\">}</span>","<span class=\"k\">}</span><span class=\"k\">);</span>","","<span class=\"c\">//create HTML String</span>","<span class=\"k\">function</span> createFriendItem<span class=\"k\">(</span>friend<span class=\"k\">)</span> <span class=\"k\">{</span>","  ","  \t<span class=\"k\">var</span> htmlString <span class=\"k\">=</span> <span class=\"s\">\"\"</span><span class=\"k\">;</span>","  ","    htmlString <span class=\"k\">+=</span> <span class=\"s\">'&lt;li class=\"item\"&gt;'</span><span class=\"k\">;</span>","    htmlString <span class=\"k\">+=</span> <span class=\"s\">'&lt;div class=\"pic\"&gt;'</span><span class=\"k\">;</span>","    htmlString <span class=\"k\">+=</span> <span class=\"s\">'&lt;img src=\"https://graph.facebook.com/'</span> <span class=\"k\">+</span> friend<span class=\"k\">.</span>id  <span class=\"k\">+</span> <span class=\"s\">'/picture\"/&gt;'</span><span class=\"k\">;</span>","    htmlString <span class=\"k\">+=</span> <span class=\"s\">'&lt;/div&gt;'</span><span class=\"k\">;</span>","    htmlString <span class=\"k\">+=</span> <span class=\"s\">'&lt;div class=\"picName\"&gt;'</span> <span class=\"k\">+</span> friend<span class=\"k\">.</span>name <span class=\"k\">+</span> <span class=\"s\">'&lt;/div&gt;'</span><span class=\"k\">;</span> ","  \thtmlString <span class=\"k\">+=</span> <span class=\"s\">'&lt;/li&gt;'</span><span class=\"k\">;</span>","  ","  \t<span class=\"k\">return</span> htmlString","<span class=\"k\">}</span> ","",""];
_$jscoverage['javascript.js'][1]++;
FB.api("/me/friends?fields=name,relationship_status", (function (response) {
  _$jscoverage['javascript.js'][3]++;
  var relationship_types = {};
  _$jscoverage['javascript.js'][6]++;
  for (var i = 0; (i < response.data.length); (i++)) {
    _$jscoverage['javascript.js'][8]++;
    var friend = response.data[i];
    _$jscoverage['javascript.js'][11]++;
    if ((friend.relationship_status && (friend.relationship_status === "Single"))) {
      _$jscoverage['javascript.js'][12]++;
      $("#single").append(createFriendItem(friend));
    }
    _$jscoverage['javascript.js'][16]++;
    if ((friend.relationship_status && (friend.relationship_status === "In a relationship"))) {
      _$jscoverage['javascript.js'][17]++;
      $("#relationship").append(createFriendItem(friend));
    }
    _$jscoverage['javascript.js'][21]++;
    if ((friend.relationship_status && (friend.relationship_status === "Married"))) {
      _$jscoverage['javascript.js'][22]++;
      $("#married").append(createFriendItem(friend));
    }
}
}));
_$jscoverage['javascript.js'][28]++;
function createFriendItem(friend) {
  _$jscoverage['javascript.js'][30]++;
  var htmlString = "";
  _$jscoverage['javascript.js'][32]++;
  htmlString += "<li class=\"item\">";
  _$jscoverage['javascript.js'][33]++;
  htmlString += "<div class=\"pic\">";
  _$jscoverage['javascript.js'][34]++;
  htmlString += ("<img src=\"https://graph.facebook.com/" + friend.id + "/picture\"/>");
  _$jscoverage['javascript.js'][35]++;
  htmlString += "</div>";
  _$jscoverage['javascript.js'][36]++;
  htmlString += ("<div class=\"picName\">" + friend.name + "</div>");
  _$jscoverage['javascript.js'][37]++;
  htmlString += "</li>";
  _$jscoverage['javascript.js'][39]++;
  return htmlString;
}