window.InviteModule = (function() {

	var start = 0;
	var sendToList = [];
	var picsReady = false;

	var images = new Array()
	function preload() {
		picsReady = true;
		for(var i = 0; i < window.fbFriends.length; i++) {
			images[i] = new Image()
			images[i].src = "https://graph.facebook.com/" + window.fbFriends[i] + '/picture';
		}
	}
	
	
	$(document).delegate(".btn.invite, div.pic", "click", function() {

		var appRequestCB = function(response) {
			if(response) {
				var curValue = ((start + sendToList.length) / window.fbFriends.length) * 100;
				$("#inviteModal .bar").width(curValue + "%");

				_gaq.push(["_trackEvent", "invites", "sendInvite", "Invite sent", sendToList.length]);

				if(curValue === 100) {
					mixpanel.track("Code Snippet - Invite Complete", {
						"projectId" : document.projectId,
						"projectTitle" : $(".title h1").html()
					});

					$(".inviteFooter p").html("Early Access Granted! We'll notify you soon");
				} else {
					mixpanel.track("Code Snippet - Invite Success at " + start, {
						"projectId" : document.projectId,
						"projectTitle" : $(".title h1").html()
					});

					if(curValue > 5 && curValue < 40) {
						$(".inviteFooter p").html(Math.ceil(curValue) + "%");
					} else if(curValue > 40 && curValue < 70) {
						$(".inviteFooter p").html(Math.ceil(curValue) + "%, keep going!");
					} else {
						$(".inviteFooter p").html(Math.ceil(curValue) + "%, almost there!");
					}
					start += 50;
					updateInviteList();
				}
			} else {
				mixpanel.track("Code Snippet - Invite Cancelled at " + start, {
					"projectId" : document.projectId,
					"projectTitle" : $(".title h1").html()
				});
			}
		}

		FB.ui({
			method : 'apprequests',
			message : "Join me on CodeNow",
			title : "Join me on CodeNow",
			to : sendToList.join(",")
		}, appRequestCB);

	});

	FB.api('/me/friends', function(response) {

		//Looping through response
		var friendUids = [];
		var friends = response.data;

		for(var i = 0; i < friends.length; i++) {
			friendUids.push(friends[i].id);
		}
		window.fbFriends = friendUids;
		console.log("preloading");
		preload();
	});

	var updateInviteList = function() {

		if(!picsReady) {
			setTimeout(updateInviteList, 500);
			return;
		}

		sendToList = [];
		$(".inviteBody").html("");
		for(var i = start; i < Math.min(start + 50, window.fbFriends.length); i++) {

			sendToList.push(window.fbFriends[i]);
		}
		for( i = start; i < Math.min(start + 20, window.fbFriends.length); i++) {

			var picDiv = $("<div class='pic'></div>");
			picDiv.append(images[i]);

			$(".inviteBody").append(picDiv);
		}
	};

	window.createInviteDialog = function() {

		$("#inviteModal").modal({
			backdrop : true,
			backdrop : "static"
		});

		updateInviteList();
	};

}); 
