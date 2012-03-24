var dbox = require("dbox");
var config = require("./config");

var client = dbox.createClient({
  app_key    : config.DropBox.appKey,             // required
  app_secret : config.DropBox.appSecret,
  root       : "sandbox"            // optional (defaults to sandbox)
});

var tokens = {};

module.exports = {

	getTokenUrl: function(socket) {
		client.request_token(function(status, reply){
  			console.log(reply);
			tokens[reply.oauth_token] = reply.oauth_token_secret;

			socket.set("dropboxAuth", reply, function() {});
			socket.emit("dropboxAuth", {"status": status, "token": reply.oauth_token});
		});
	},

	getAccessToken: function(oauth_token, socket) {

		var options = {
  			"oauth_token": oauth_token,  // required
  			"oauth_token_secret" : tokens[oauth_token],  // required
		};

		client.access_token(options, function(status, reply){
			tokens[reply.oauth_token] = reply.oauth_token_secret;
			socket.set("dropboxAccess", reply, function() {});

			socket.emit("dropboxAccess", {"status": status, "token": reply});
		});		
	}
};

