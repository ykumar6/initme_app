
body {
  text-align: center;
  margin: 0;
}

#log {
  width: 466px;
  height: 25px;
  background: #404040;
  padding: 10px;
  /*margin-left: -243px;*/
  margin: 25px auto 0 auto;
  border: 1px solid #d4d4d4;
  text-decoration: none;
  font:18px/normal sans-serif;
  color: white;
  white-space: nowrap;
  outline: none;
  background-color: #404040;
  background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#000), to(#404040));
  background-image: -moz-linear-gradient(#000, #404040);
  background-image: -o-linear-gradient(#000, #404040);
  background-image: linear-gradient(#000, #404040);
  -webkit-background-clip: padding;
  -moz-background-clip: padding;
  -o-background-clip: padding-box;
  /*background-clip: padding-box;*/ /* commented out due to Opera 11.10 bug */
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  line-height: 25px;
  border-radius: 5px;
  /* IE hacks */
  zoom: 1;
  *display: inline;
}

button.call, button.hangup, input {
    -moz-box-shadow: 1px 2px 10px #BBB;
    -webkit-box-shadow: 1px 2px 10px #BBB;
    box-shadow: 1px 2px 10px #BBB;
}

button.call, button.hangup {
    position: relative;
    overflow: visible;
    display: inline-block;
    padding: 0.5em 1em;
    border: 1px solid #d4d4d4;
    margin: 50px 0 0 0;
    text-decoration: none;
    text-shadow: 1px 1px 0 #fff;
    font:35px/normal sans-serif;
    font-weight: bold;
    color: #333;
    white-space: nowrap;
    cursor: pointer;
    outline: none;
    background-color: #ececec;
    background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#f4f4f4), to(#ececec));
    background-image: -moz-linear-gradient(#f4f4f4, #ececec);
    background-image: -o-linear-gradient(#f4f4f4, #ececec);
    background-image: linear-gradient(#f4f4f4, #ececec);
    -webkit-background-clip: padding;
    -moz-background-clip: padding;
    -o-background-clip: padding-box;
    /*background-clip: padding-box;*/ /* commented out due to Opera 11.10 bug */
    -webkit-border-radius: 10px;
    -moz-border-radius: 10px;
    border-radius: 10px;
    /* IE hacks */
    zoom: 1;
    *display: inline;
}

button.call:hover,
button.call:focus,
button.call:active,
button.call.active,
button.hangup:hover,
button.hangup:focus,
button.hangup:active,
button.hangup.active {
    border-color: #3072b3;
    border-bottom-color: #2a65a0;
    text-decoration: none;
    text-shadow: -1px -1px 0 rgba(0,0,0,0.3);
    color: #fff;
    background-color: #3C8DDE;
    background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#ff0000), to(#dd0000));
    background-image: -moz-linear-gradient(#599bdc, #3072b3);
    background-image: -o-linear-gradient(#599bdc, #3072b3);
    background-image: linear-gradient(#599bdc, #3072b3);
}

button.call:active,
button.call.active,
button.hangup:active,
button.hangup.active {
    border-color: #2a65a0;
    border-bottom-color: #3884CF;
    background-color: #3072b3;
    background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#3072b3), to(#599bdc));
    background-image: -moz-linear-gradient(#3072b3, #599bdc);
    background-image: -o-linear-gradient(#3072b3, #599bdc);
    background-image: linear-gradient(#3072b3, #599bdc);
}

/* overrides extra padding on button elements in Firefox */
button.call::-moz-focus-inner,
button.hangup::-moz-focus-inner {
    padding: 0;
    border: 0;
}

input {
  display: block;
  margin: 25px auto 0 auto;
  outline: none;
  border: 1px solid #999;
  line-height: 1.4em;
  font-size: 24px;
  padding: 10px;
  width: 466px;
}

/* ............................................................................................................. Icons */

button.call:before,
button.hangup:before {
    content: "";
    position: relative;
    top: 1px;
    float:left;
    width: 44px;
    height: 37px;
    margin: 0 0.75em 0 -0.25em;
    background: url("http://static0.twilio.com/packages/quickstart/buttons.png") 0 99px no-repeat;
}

button.call:before { background-position: 0 -48px; }
button.call:hover:before,
button.call:focus:before,
button.call:active:before { background-position: 0 0; }

button.hangup {
   margin-left: 25px;
}

button.hangup:before { background-position: 0 -131px; }
button.hangup:hover:before,
button.hangup:focus:before,
button.hangup:active:before { background-position: 0 -88px; }

