var dbox = require("dbox");
var config = require("./config");

var client = dbox.createClient({
  app_key    : config.DropBox.appKey,             // required
  app_secret : config.DropBox.appSecret,
  root       : "sandbox"            // optional (defaults to sandbox)
});

module.exports = {

	getTokenUrl: function(socket) {
		client.request_token(function(status, reply){
  			console.log(reply);
			socket.set("dropboxAuth", reply, function() {});
			socket.emit("dropboxAuth", {"status": status, "token": reply.oauth_token});
		});
	},

	getAccessToken: function(socket) {

	}
};

