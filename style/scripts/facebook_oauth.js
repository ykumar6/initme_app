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
	 this.activated = false;

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
  

		FB.getLoginStatus (function(response) {
			if (response.status === "connected") {	
            	FB.api('/me', function(profile) {
					var xhr = $.get("/user/" + profile.email, {"profile": profile});
					xhr.success(function() {
						_gaq.push(["_trackEvent", "NewUsers", "UserRegistered", "User Registered"]);
					});

            		setTimeout(function() {
	  					window.fbName = profile.name;  		
	  					$("h2.welcome").html("Welcome " + profile.name);					
	  					if (geoip_country_code() !== "US") {
	  						mixpanel.track("Code Snippet - Invite Dialog Shown");
	  						window.InviteModule();
	        				window.createInviteDialog();
	        			}			
            		}, 1000);
				});
			}
		});

    };


};

(function() {

	
	this.activate = function() {
		var self = this;
		
		FB.Event.subscribe('auth.statusChange', function() {
			self.fbLoginStatus.apply(self, arguments);
	 	});
	 	
	 	var permissions = ["email", "publish_actions"];
	 	
	 	if (window.codeEditors.javascript.getValue().search(/'.*fields=.*relationship_status.*'/mig) >= 0) {
	 		permissions.push("friends_relationships");	
	 	}
	 	if (window.codeEditors.javascript.getValue().search(/'.*fields=.*hometown.*'/mig) >= 0) {
	 		permissions.push("friends_hometown");	
	 	}
	 	if (window.codeEditors.javascript.getValue().search(/'.*fields=.*location.*'/mig) >= 0) {
	 		permissions.push("friends_location");	
	 	}
        if (window.codeEditors.javascript.getValue().search(/'.*albums.*'/mig) >= 0) {
                permissions.push("user_photos");
        }


	 	
	 	console.log(permissions);
	 	
		FB.login(function(response) {
			if (response.status !== "connected") {	
					mixpanel.track("Code Snippet - Facebook Login - Denied", {}, function() {
					window.location = "/permissions"							
				});
			} else {
				
				var action = "run";
				if (document.projectId == "114802") {
					action = "decode";
				}
				if (document.projectId == "198106") {
					action = "hack";
				}
				
				FB.api('/me/'+document.namespace+':' + action, 'post', { "code_sample" : document.projectUrl}, function(res) {
					console.log(res);
				});
				
				mixpanel.track("Code Snippet - Facebook Login - Success");
				self.fbLoginStatus.apply(self, arguments);
			}
		}, {scope: permissions.join(",")});
	}

    this.fbLoginStatus = function(response) {
	     var self = this;

            if(response.status === "connected") {				
				self.handleLoginState(true, response.authResponse.accessToken);
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