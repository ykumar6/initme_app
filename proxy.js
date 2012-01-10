var express = require("express");
var config = require("./config");
var Project = require("./projects/Project");
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var GitHubStrategy = require('passport-github').Strategy;
var GoogleStrategy = require('./passport-google-oauth/lib/passport-google-oauth').Strategy;
var https = require("https");
var MongoStore = require("connect-mongo");

require("./User");

var Path = require("path");
var global = require("./global");
var mongoose = require('mongoose');
var async = require("async");
var Editor = require("./editor");
var fs = require('fs');
var AppChecker = require("./checkapps");
var User = mongoose.model("User");

mongoose.connect(config.mongoURI);

var _redirect = function(req, res, url) {
    res.end('<script type="text/javascript">window.location="http://' + config.appDomain + '/' + url + '"</script>');
};
var app = express.createServer();

var handlePings = function(req,res,next) {
	if (req.headers.host.indexOf(config.appDomain) < 0) {
		res.send(200);
	}	
	else {
		next();
	}
};

var betaAccessHandler = function(req, res, next) {
	var betaCode = req.param("betaCode");

	function grantAccess() {
		req.user.accessGranted = true;
		req.user.save(function(err, doc) {
			next();
		});
	};

	if (req.user && betaCode && betaCode === "instant_access_1912" && !req.user.accessGranted) {
		grantAccess();
	}
	else if (req.session & req.session.accessGranted && req.user && !req.user.accessGranted) {
		grantAccess();
	} else {
		req.session.accessGranted = true;
		next();
	}
}

// configure Express
app.configure(function() {
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(handlePings);
    app.use(express.session({
	key: "initsess",
       secret : 'kiwi',
   	store: new MongoStore(config.db)
    }));
    // Initialize Passport!  Also use passport.session() middleware, to support
    // persistent login sessions (recommended).
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(betaAccessHandler);
    app.use(express.static(__dirname + "/style"));
    app.use(app.router);
});
var io = require("socket.io").listen(app);
io.set('transports', ['xhr-polling']);

io.set('authorization', function(data, accept) {
    var projList = data.headers["x-vcap_projects"] ? data.headers["x-vcap_projects"].split(",") : [];
    data.projList = projList;
    accept(null, true);

});
io.sockets.on("connection", function(client) {
    client.on("attach", function(data) {

        var projId = data.projectId;
        console.log("attaching " + projId);
        if(!projId) {
            return;
        }

        AppChecker.activateApp(projId, function(proj) {

            client.on('disconnect', function() {
                proj.removeClientConnection(client);
            });

            proj.addClientConnection(client);
        });
    });
});

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

var handleLogin =  function(accessToken, refreshToken, profile, done) {
        
        
    function processUser(email) {
        var createUser = function() {
            var usr = new User({
                "email" : email,
                "provider": profile.provider,
                "providerId": profile.id,
                "displayName": profile.displayName || ""
            });
            
            usr.save(function(err, doc) {
                if (!err && doc) {
                    done(null, doc);
                } else {
                    done(true, "Could not create user");
                }
            });
        };
        
        User.findOne({"email": email}, function(err, doc) {
            if (err || !doc) {
                createUser();
            } else {
                done(null, doc);
            }
        });
    }
    
    if (profile.provider == "github") {
        //get user profile
        
        https.get({ host: 'api.github.com', path: '/user/emails?access_token=' + accessToken }, function(res) {
            res.on('data', function(chunk) {
                var emails = JSON.parse(chunk.toString());
                if (emails && emails.length && emails[0]) {
                    processUser(emails[0]);
                } else {
                    done(true, "Could not get email address");
                }
          });
          
        }).on('error', function(e) {
            done(true, "Could not get email address");
        });
        

    } else {
        if (profile.emails && profile.emails.length && profile.emails[0].value) {
            processUser( profile.emails[0].value);
        }
        else {
            done(true, "Could not get email address");
        }
    }   
    
}


passport.use(new GitHubStrategy({
    clientID: config.github.appId,
    clientSecret: config.github.appSecret,
    callbackURL: "http://" + config.appDomain + "/auth/github/callback"
  }, handleLogin));

passport.use(new FacebookStrategy({
    clientID : config.facebook.appId,
    clientSecret : config.facebook.appSecret,
    callbackURL : "http://" + config.appDomain + "/auth/facebook/callback"
}, handleLogin));

passport.use(new GoogleStrategy({ 
    clientID : "338218178481.apps.googleusercontent.com",
    clientSecret : "30r5WDxGc7mKgQxUb1vmlAp6",
    callbackURL : "http://cloudcosmos.com/auth/google/callback"
}, handleLogin
));


app.get('/', function(req, res, next) {
    //render user portal or ide

    console.log(req.headers);
    var state = req.param("state");
    var redirect = req.param("redirect");

     
    if (state === "loginEditor" && typeof(redirect) === "string") {
	//save redirect
	req.session.redirect = redirect;
    } 

    if (req.user && req.user.accessGranted) {
	 res.redirect("/php/hello-world");
    } else {
   	fs.readFile(__dirname + "/view/index.html", "utf8", function(err, index) {
       	res.end(index);
   	});
    }
});

app.get('/logout', function(req, res) {
    var redirect = req.param("redirect", null);
    req.logout();

    if (typeof(redirect) === "string") {
	res.redirect(redirect);
    }
    else {
	res.redirect('/');
    }
});

var handleLoginReturn = function(req, res) {

	var recoverProjId = (req.session || {}).recoverProjId;
	if (recoverProjId  && req.user) {
	//recover project
	   AppChecker.activateApp(req.session.recoverProjId, function(proj) {
	       req.session.recoverProjId = null;
		if (proj) {
			proj.model.authorName = req.user.displayName;
			proj.model.save(function(err, doc){
				if (err) {
					res.send(500);
				} else {
					res.redirect("/" + proj.getId());
				}
			});
		}
		else {
			res.send(500);
		}
	   });
	} 
	else {
		if (req.session && req.session.redirect) {
			console.log(req.session.redirect);
			res.redirect(req.session.redirect);
			req.session.redirect = null;
		}
		else {
			res.redirect("/?loginResult=success");
		}
	}
};

app.get('/auth/google',
  passport.authenticate('google-oauth', { scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']}),
  function(req, res){
    // The request will be redirected to Google for authentication, so
    // this function will not be called.
  });

app.get('/auth/google/callback', 
  passport.authenticate('google-oauth', { failureRedirect: '/?loginResult=fail' }),
  handleLoginReturn
);

app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/?loginResult=fail' }),
  handleLoginReturn
);

app.get('/auth/github',
  passport.authenticate('github', { scope: ['user'] }),

    function(req, res) {
    // The request will be redirected to Facebook for authentication, so this
    //     // function will not be called.
});

app.get('/auth/facebook/callback', passport.authenticate('facebook', {
    failureRedirect : '/?loginResult=fail'
}), handleLoginReturn);

app.get('/auth/facebook', 
    passport.authenticate('facebook', { scope: ['email'] }), 
    function(req, res) {
    // The request will be redirected to Facebook for authentication, so this
    // function will not be called.
});



app.get('/user/:email', function(req, res, next) {

    var usr = new User({
        "email" : req.params.email
    });
    usr.save(function(err, doc) {
        if(err) {
            res.send(500);
        } else {
            res.send(200);
        }
    });
});

app.get('/:id', function(req, res, next) {
    //render user portal or ide

    var projList = req.headers["x-vcap_projects"] ? req.headers["x-vcap_projects"].split(",") : [];
    var isOwner = (projList.indexOf(req.params.id) >= 0);

    AppChecker.activateApp(req.params.id, function(proj) {
        if(proj && proj.getAuthorName() !== "Unknown") {
	
            Editor.getIndex(proj, isOwner, req.user, function(err, index) {
                if(err) {
                    console.log(err);
                    res.send(500);
                } else {
                    res.end(index);
                }
            });
        } else {
            res.send(500);
        }
    });
});

app.post("/title/:projectId", function(req, res, next) {	
    var projList = req.headers["x-vcap_projects"] ? req.headers["x-vcap_projects"].split(",") : [];
    var isOwner = (projList.indexOf(req.params.projectId) >= 0);

    if (!isOwner) {
	res.send(401);
    } 
    else {

	if (req.body && typeof(req.body.value) === "string") {
	   AppChecker.activateApp(req.params.projectId, function(proj) {
		if (proj) {
			proj.model.projectTitle = req.body.value;
			proj.model.save(function(err, doc){
				if (err) {
					res.send(500);
				} else {
					res.send(200);
				}
			});
		}
		else {
			res.send(500);
		}
	   });
	}
	else {
		res.send(500);
	}
	

    }

});


app.get("/save/:projectId", function(req, res, next) {	
    if (!req.user) {
	req.session.recoverProjId = req.params.projectId;
        res.send(401); //unauthorized, user must login
    } else {
	AppChecker.activateApp(req.params.projectId, function(proj) {
		if (proj) {
			proj.model.authorName = req.user.displayName;
			proj.model.save(function(err, doc){
				if (err) {
					res.send(500);
				} else {
					res.contentType('json');
					res.send({authorName: proj.getAuthorName(), projectTitle: proj.getTitle()});
				}
			});
		}
		else {
			res.send(500);
		}
	});
    }
});

app.get('/fork/:projectId', function(req, res, next) {
    //fork new root app
    var framework = "php";

	 console.log("Received fork request........!!!");
        var proj = new Project({
           "framework" : framework,
           "authorName":  "Unknown",
	    "proposedTitle": "Untitled",
            clone : req.params.projectId,
            ready : function(err) {
                if(err) {
                    console.log(err);
                    res.send(500);
                } else {
                    var projList = req.headers["x-vcap_projects"] ? req.headers["x-vcap_projects"].split(",") : [];
                    projList.push(proj.getId());
                    AppChecker.addActiveApp(proj);
    		
		      console.log("new project id");
		      console.log(proj.getId());
                    res.setHeader("Set-Cookie", "INITME=," + projList.join(","));
                    res.writeHead(200);
                    res.end(JSON.stringify({
                        projectId : proj.getId(),
                        appUrl : proj.getUrl()
                    }));
                }
            }
        });

});

app.get('/php/:projectUrl', function(req, res, next) {
    //render user portal or ide

    var projList = req.headers["x-vcap_projects"] ? req.headers["x-vcap_projects"].split(",") : [];
    var isOwner = (projList.indexOf(req.params.id) >= 0);

    AppChecker.activateApp(req.params.projectUrl, function(proj) {
        if(proj) {
            Editor.getIndex(proj, isOwner, req.user, function(err, index) {
                if(err) {
                    console.log(err);
                    next(500);
                } else {
                    res.end(index);
                }
            });
        } else {
            next(500);
        }
    });
});

app.listen(80);
