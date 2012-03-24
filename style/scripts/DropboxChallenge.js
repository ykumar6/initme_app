document.DropboxChallenge = function(project) {

	function getParameterByName(name)
	{
  		name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  		var regexS = "[\\?&]" + name + "=([^&#]*)";
  		var regex = new RegExp(regexS);
  		var results = regex.exec(window.location.search);
  		if(results == null)
    			return "";
 		else
    			return decodeURIComponent(results[1].replace(/\+/g, " "));
	}

	var token = getParameterByName("oauth_token");
	var uid = getParameterByName("uid");
	console.log(token);
	console.log(uid);

	var self = this;
	self.authToken = null;

	$("body").trigger("challengeStart");
	$(".dropboxVerify button").click(function(e) {
		window.location = "https://www.dropbox.com/1/oauth/authorize?oauth_token=" + self.authToken + "&oauth_callback="+ encodeURI(window.location);
	});

	project.addEvent("attached", function() {
		if (token && uid) {
			project.socketMain.emit("DropboxAccess", {"token": token});
		}
		else if (!self.authToken) {
			project.socketMain.emit("DropboxToken", {});
		}
	});

	project.addEvent("dropboxAuth", function(data) {
		if (data.status === 200) {
			self.authToken = data.token;
		}
		else {
			console.log("Error getting Dropbox Auth token");
		}
	});

	project.addEvent("dropboxAccess", function(data) {
		if (data.status === 200) {
			console.log(data.token);
			window.accessToken = data.token.oauth_token + "&s=" + data.token.oauth_token_secret;
			$("body").trigger("challengeComplete");
		}
		else {
			if (!self.authToken) {
				project.socketMain.emit("DropboxToken", {});
			}
			console.log("Error getting Dropbox Access token");	
		}
	});
};

(function() {



}).call(document.DropboxChallenge.prototype);
