document.DropboxChallenge = function(project) {

	var self = this;
	self.authToken = null;

	$("body").trigger("challengeStart");
	project.addEvent("attached", function() {
		if (!self.authToken) {
			project.socketMain.emit("DropboxToken", {});
		}
	});

	project.addEvent("dropboxAuth", function(data) {
		console.log(data);
		if (data.status === 200) {
			console.log(data);
		}
		else {

		}
	});
};

(function() {



}).call(document.DropboxChallenge.prototype);
