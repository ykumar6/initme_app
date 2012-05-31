window.InviteModule = (function() {

	var start=0;
	var sendToList = [];
	
	var images = new Array()
	function preload() {
		for (var i=0; i<window.fbFriends.length; i++) {
			images[i] = new Image()
			images[i].src = "https://graph.facebook.com/" + window.fbFriends[i]  + '/picture';
		}
	}

	$(".btn.invite").click(function() {
		  console.log("button clicked");
	  						
	  		mixpanel.track("Code Snippet - Invited Clicked", {"projectId": document.projectId, "projectTitle":  $(".title h1").html() });

		  var appRequestCB = function(response) {
				if (response) {
					var curValue = ((start+sendToList.length)/window.fbFriends.length)*100;
					$("#inviteModal .bar").width( curValue + "%");
					
					if (curValue === 100) {
						mixpanel.track("Code Snippet - Invite Complete", {"projectId": document.projectId, "projectTitle":  $(".title h1").html() });

						$(".inviteFooter p").html("Early Access Granted! We'll notify you soon");
					}
					else {
						mixpanel.track("Code Snippet - Invite Success at " + start, {"projectId": document.projectId, "projectTitle":  $(".title h1").html() });

						if (curValue > 5 && curValue < 40) {
							$(".inviteFooter p").html(Math.ceil(curValue) + "%");
						}
						else if (curValue > 40 && curValue < 70) {
							$(".inviteFooter p").html(Math.ceil(curValue) + "%, keep going!");
						}
						else {
							$(".inviteFooter p").html(Math.ceil(curValue) + "%, almost there!");
						}
						start+=50;	
						updateInviteList();
					}					
				}
		  		else {
		 			mixpanel.track("Code Snippet - Invite Cancelled at " + start, {"projectId": document.projectId, "projectTitle":  $(".title h1").html() });
		 	 	}
		 }
		
		  FB.ui({
		  		method: 'apprequests',
		    	message: "I want you to try my sample app",
		    	to: sendToList.join(",")
		  }, appRequestCB);
		  
	});
	
	$("body").bind("oauthLogin", function() {
			FB.api('/me/friends', function(response) {
			 
			  	//Looping through response
			  	var friendUids = [];
			  	var friends = response.data;
			  	  
			  	for (var i=0; i<friends.length; i++) {
			      		friendUids.push(friends[i].id);
			  	}
				window.fbFriends = friendUids;
				console.log("preloading");
				preload();
			});
	});

	var updateInviteList = function() {
		sendToList = [];
		$(".inviteBody").html("");
		for (var i=start; i<Math.min(start+50, window.fbFriends.length); i++) {
			
			var picDiv = $("<div class='pic'></div>");
			picDiv.append(images[i]);
			
			$(".inviteBody").append(picDiv);
            sendToList.push(window.fbFriends[i]);
		}
	};

	window.createInviteDialog = function() {
		
		$("#inviteModal").modal({backdrop: false});
		updateInviteList();
	};

});