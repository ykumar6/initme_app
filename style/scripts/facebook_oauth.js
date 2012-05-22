document.FacebookOAuth = function() {
	

	var self = this;
    FB.login(function(response){
		self.fbLoginStatus.apply(self, arguments);
    });
 	FB.Event.subscribe('auth.statusChange', function() {
		self.fbLoginStatus.apply(self, arguments);
 	});
 	

};

(function() {

    this.fbLoginStatus = function(response) {
	     var self = this;
	     	console.log(response);

            if(response.status === "connected") {
            	    FB.api('/me', function(profile) {
      					 var nameStr = profile.name;
      					 var nameParts = (nameStr || "").split(" ");
      					 
      					 document.fbName = nameParts[0];
      					 
      					 console.log(document.fbName);
      					 self.handleLoginState(true, response.authResponse.accessToken);
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
