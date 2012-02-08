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
