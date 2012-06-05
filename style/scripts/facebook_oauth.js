document.FacebookOAuth = function() {

        var js, id = 'facebook-jssdk';
        var d = document;
        
        if(d.getElementById(id)) {
            return;
        }
        js = document.createElement('script');
        js.id = id;
        js.async = true;
        js.src = "//connect.facebook.net/en_US/all.js";
        document.getElementsByTagName('head')[0].appendChild(js);

	 var self = this;

	 $(".facebook_oauth").click(function() {
		if ($("body").hasClass("oauth")) {
			FB.login(function() {});
		}

	 });

    window.fbAsyncInit = function() {

        FB.init({
            appId : document.FacebookId, // App ID
            frictionlessRequests : true,
            status : true, // check login status
            xfbml : true  // parse XFBML
        });

        FB.getLoginStatus(function(){});
        FB.Event.subscribe('auth.statusChange', function() {
		self.fbLoginStatus.apply(self, arguments);
	 });
        // Additional initialization code here
    };


};

(function() {

    this.fbLoginStatus = function(response) {
	     var self = this;
	     console.log(response);

            if(response.status === "connected") {
				$(document).unbind("click.login");
				$("#welcomeModal").modal("hide");
				
            	FB.api('/me', function(profile) {
            		
            		$.get("/user/" + profile.email);
            		
            		console.log("here");
            		console.log(profile);
            		
  					window.fbName = profile.name;
  					console.log(window.fbName);
  					$(".inviteText h2.welcome").html("Welcome " + window.fbName + "!");
  					
  					$(".rightBar").html("<p>Welcome " + window.fbName + ". <a href='#' class='nextExample'>Unlock</a> more code</p>")
  					
  					self.handleLoginState(true, response.authResponse.accessToken);
  					
  					mixpanel.track("Code Snippet - Invite Dialog shown", {
							"projectId" : document.projectId,
							"projectTitle" : $(".title h1").html()
					});

  					$("#inviteModal .inviteTitle").html("You just received extra free space!");
  					window.createInviteDialog();

				});
            } else {
                self.handleLoginState(false);
            }
        }


    this.handleLoginState = function(isLoggedIn, accessToken) {
        if(isLoggedIn) {
            $('body').trigger('oauthLogin', [accessToken]);
        } else {
            $('body').trigger('oauthLogout');
        }
    };

}).call(document.FacebookOAuth.prototype);