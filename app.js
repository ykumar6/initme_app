var express = require("express");
var config = require("./config");
var Project = require("./projects/Project");
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var GitHubStrategy = require('passport-github').Strategy;
var GoogleStrategy = require('./passport-google-oauth/lib/passport-google-oauth').Strategy;
var https = require("https");
var MongoStore = require("connect-mongo");
var Twilio = require("./twilio");

require("./User");

var Path = require("path");
var global = require("./global");
var mongoose = require('mongoose');
var async = require("async");
var Editor = require("./editor");
var fs = require('fs');
var AppChecker = require("./checkapps");
var User = mongoose.model("User");
var MailChimpAPI = require('mailchimp').MailChimpAPI;

try {
    var api = new MailChimpAPI(config.mailchimp.key, { version : '1.3', secure : false });
} catch (error) {
    console.log('Error: ' + error);
}


var visitCount = Math.floor(Math.random()*2);

mongoose.connect(config.mongoURI);

var _redirect = function(req, res, url) {
	res.end('<script type="text/javascript">window.location="http://' + config.appDomain + '/' + url + '"</script>');
};


var app = express.createServer();

var handlePings = function(req, res, next) {
	if(req.headers.host.indexOf(config.appDomain) < 0) {
		res.send(200);
	} else {
		next();
	}
};

var betaAccessHandler = function(req, res, next) {
	var betaCode = req.param("betaCode");

	if (betaCode && betaCode === "beta_1912" && req.session) {
		req.session.isBetaUser = true;
	}
	
	if (typeof(req.session.bucket) !== "number" && req.session.isBetaUser) {
		req.session.bucket = visitCount++ % 3;
		console.log("setting bucket at " + req.session.bucket);
	}
	next();

}
// configure Express
app.configure(function() {
	app.use(express.cookieParser());
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(handlePings);
	app.use(express.session({
		key : "initsess",
		secret : 'kiwi',
		store : new MongoStore(config.db)
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
io.set('transports', ['xhr-polling']);

io.set('authorization', function(data, accept) {
	var projList = data.headers["x-vcap_projects"] ? data.headers["x-vcap_projects"].split(",") : [];
	data.projList = projList;
	accept(null, true);

});
io.sockets.on("connection", function(client) {

	client.on("detach", function(data) {
		var projId = data.projectId;

		if(!projId) {
			return;
		}
		console.log("detaching " + projId);
		var proj = AppChecker.currentApps[projId];
		if(proj) {
			proj.removeClientConnection(client);
		}
	});

	client.on("attach", function(data) {

		var projId = data.projectId;
		console.log("attaching " + projId);
		if(!projId) {
			return;
		}

		AppChecker.activateApp(projId, function(proj) {

			client.on('disconnect', function() {
				console.log("disconnecting");
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
	User.findById(id, function(err, user) {
		done(err, user || {});
	});
});

var handleLogin = function(accessToken, refreshToken, profile, done) {

	function processUser(email) {
		var createUser = function() {
			var usr = new User({
				"email" : email,
				"provider" : profile.provider,
				"providerId" : profile.id,
				"displayName" : profile.displayName || ""
			});

			usr.save(function(err, doc) {
				if(!err && doc) {
					done(null, doc);
				} else {
					done(true, "Could not create user");
				}
			});
		};

		User.findOne({
			"email" : email
		}, function(err, doc) {
			if(err || !doc) {
				createUser();
			} else {
				done(null, doc);
			}
		});
	}

	if(profile.provider == "github") {
		//get user profile

		https.get({
			host : 'api.github.com',
			path : '/user/emails?access_token=' + accessToken
		}, function(res) {
			res.on('data', function(chunk) {
				var emails = JSON.parse(chunk.toString());
				if(emails && emails.length && emails[0]) {
					processUser(emails[0]);
				} else {
					done(true, "Could not get email address");
				}
			});

		}).on('error', function(e) {
			done(true, "Could not get email address");
		});

	} else {
		if(profile.emails && profile.emails.length && profile.emails[0].value) {
			processUser(profile.emails[0].value);
		} else {
			done(true, "Could not get email address");
		}
	}

}

passport.use(new GitHubStrategy({
	clientID : config.github.appId,
	clientSecret : config.github.appSecret,
	callbackURL : "http://" + config.appDomain + "/auth/github/callback"
}, handleLogin));

passport.use(new FacebookStrategy({
	clientID : config.facebook.appId,
	clientSecret : config.facebook.appSecret,
	callbackURL : "http://" + config.appDomain + "/auth/facebook/callback"
}, handleLogin));

passport.use(new GoogleStrategy({
	clientID : config.google.appId,
	clientSecret : config.google.appSecret,
	callbackURL : "http://" + config.appDomain + "/auth/google/callback"
}, handleLogin));

app.all("/*", function(req, res, next) {
		
	var domainParts = req.headers.host.split(".");

	if(isNaN(domainParts[0])) {
		next();
		return;
	}

	AppChecker.findProject(domainParts[0], function(proj) {
		if(proj) {
			var projDomain = config.projDomain;
			if(proj.namespace) {
				projDomain = proj.namespace + "." + config.projDomain;
			}
			fs.readFile(__dirname + "/view/app404.html", "utf8", function(err, index) {
				index = index.replace("{projectUrl}", "http://" + projDomain + "/" + domainParts[0]);
				res.end(index);
			});
		} else {
			next();
		}
	});
});

app.all('/', function(req, res, next) {
	//render user portal or ide

	console.log(req.user);
	var state = req.param("state");
	var redirect = req.param("redirect");

	if(state === "loginEditor" && typeof (redirect) === "string") {
		//save redirect
		req.session.redirect = redirect;
	}

	if(req.session && req.session.isBetaUser) {
		console.log("access granted");
		Editor.servePage('index_enabled.html', req, res);
	} else {
		Editor.servePage('index.html', req, res);
	}
});

app.get('/choose', function(req, res, next) {
	//render user portal or ide

	if(req.session && req.session.isBetaUser) {
		Editor.servePage('choose.html', req, res);
	} else {
		Editor.servePage('index.html', req, res);
	}
});

app.get('/badge/:badgeName', function(req, res, next) {
	//render user portal or ide

	if(req.session && req.session.isBetaUser) {
		Editor.serveBadge(req.params.badgeName, req, res);
	} else {
		Editor.servePage('index.html', req, res);
	}
});

app.post('/badge/:badgeName', function(req, res, next) {
	//render user portal or ide

	if(req.session && req.session.isBetaUser) {
		console.log("adding a new badge!!!!");
		
		var badges = [];
		if (req.session.badges) {
			badges = JSON.parse(req.session.badges);
		}
		badges.push(req.params.badgeName);
		
		req.session.badges = JSON.stringify(badges);
			
		res.send(200);
	} else {
		res.send(500);
	}
});


app.get('/permissions', function(req, res, next) {
	//render user portal or ide

	if(req.session && req.session.isBetaUser) {
		Editor.servePage('permissions.html', req, res);

	} else {
		Editor.servePage('index.html', req, res);
	}
});


//app.all('/?proxy=*', require("./proxy"));

app.get('/logout', function(req, res) {
	var redirect = req.param("redirect", null);
	req.logout();

	if( typeof (redirect) === "string") {
		res.redirect(redirect);
	} else {
		res.redirect('/');
	}
});

app.get("/loading", function(req, res) {
	res.send("Loading ...");
});

app.all("/twilio/getToken", function(req, res, next) {
	req.project = AppChecker.currentApps[req.param("appId")];
	Twilio.handleRequest(req, res, next);
});

app.all("/twilio/verifyPhone", function(req, res, next) {
	Twilio.verifyPhone(req, res, next);
});

var handleLoginReturn = function(req, res) {

	var recoverProjId = (req.session || {}).recoverProjId;
	if(recoverProjId && req.user) {
		//recover project
		AppChecker.activateApp(req.session.recoverProjId, function(proj) {
			req.session.recoverProjId = null;
			if(proj) {
				proj.model.authorName = req.user.displayName;
				proj.model.save(function(err, doc) {
					if(err) {
						res.send(500);
					} else {
						res.redirect("/" + proj.getId());
					}
				});
			} else {
				res.send(500);
			}
		});
	} else {
		if(req.session && req.session.redirect) {
			console.log(req.session.redirect);
			res.redirect(req.session.redirect);
			req.session.redirect = null;
		} else {
			res.redirect("/?loginResult=success");
		}
	}
};

app.get('/auth/google', passport.authenticate('google-oauth', {
	scope : ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']
}), function(req, res) {
	// The request will be redirected to Google for authentication, so
	// this function will not be called.
});

app.get('/auth/google/callback', passport.authenticate('google-oauth', {
	failureRedirect : '/?loginResult=fail'
}), handleLoginReturn);

app.get('/auth/github/callback', passport.authenticate('github', {
	failureRedirect : '/?loginResult=fail'
}), handleLoginReturn);

app.get('/auth/github', passport.authenticate('github', {
	scope : ['user']
}), function(req, res) {
	// The request will be redirected to Facebook for authentication, so this
	//     // function will not be called.
});

app.get('/auth/facebook/callback', passport.authenticate('facebook', {
	failureRedirect : '/?loginResult=fail'
}), handleLoginReturn);

app.get('/auth/facebook', passport.authenticate('facebook', {
	scope : ['email']
}), function(req, res) {
	// The request will be redirected to Facebook for authentication, so this
	// function will not be called.
});

app.get('/twilio/route', Twilio.handleRequest);
app.get('/twilio/verifyPhone', Twilio.verifyPhone);

app.get('/user/:email', function(req, res, next) {

	var usr = new User({
		"email" : req.params.email
	});
	usr.save(function(err, doc) {
		
		var profile = (req.query || {}).profile;	
		var merges = {};
		if (profile && profile.first_name) {
			merges["FNAME"] = profile.first_name;
		}
		if (profile && profile.last_name) {
			merges["LNAME"] = profile.last_name;
		}
	
		api.listSubscribe({id: config.mailchimp.listId, email_address: req.params.email, merge_vars: merges, send_welcome: true, update_existing: false,  double_optin: false}, function(data) {
			if(err) {
				res.send(500);
			} else {
				res.send(200);
			}
		});	
	});
});

app.post("/title/:projectId", function(req, res, next) {
	var projList = req.headers["x-vcap_projects"] ? req.headers["x-vcap_projects"].split(",") : [];
	var isOwner = (projList.indexOf(req.params.projectId) >= 0);

	if(!isOwner) {
		res.send(401);
	} else {

		if(req.body && typeof (req.body.value) === "string") {
			AppChecker.activateApp(req.params.projectId, function(proj) {
				if(proj) {
					proj.model.projectTitle = req.body.value;
					proj.model.save(function(err, doc) {
						if(err) {
							res.send(500);
						} else {
							res.send(200);
						}
					});
				} else {
					res.send(500);
				}
			});
		} else {
			res.send(500);
		}

	}

});

app.post("/subTitle/:projectId", function(req, res, next) {
	var projList = req.headers["x-vcap_projects"] ? req.headers["x-vcap_projects"].split(",") : [];
	var isOwner = (projList.indexOf(req.params.projectId) >= 0);

	if(!isOwner) {
		res.send(401);
	} else {

		if(req.body && typeof (req.body.value) === "string") {
			AppChecker.activateApp(req.params.projectId, function(proj) {
				if(proj) {
					proj.model.subTitle = req.body.value;
					proj.model.save(function(err, doc) {
						if(err) {
							res.send(500);
						} else {
							res.send(200);
						}
					});
				} else {
					res.send(500);
				}
			});
		} else {
			res.send(500);
		}

	}

});

app.get("/save/:projectId", function(req, res, next) {
	//  if (!req.user) {
	//	req.session.recoverProjId = req.params.projectId;
	//      res.send(401); //unauthorized, user must login
	//  } else {
	AppChecker.activateApp(req.params.projectId, function(proj) {
		if(proj) {
			proj.model.authorName = "";
			proj.model.save(function(err, doc) {
				if(err) {
					res.send(500);
				} else {
					res.contentType('json');
					res.send({
						authorName : proj.getAuthorName(),
						projectTitle : proj.getTitle(),
						subTitle : proj.getSubTitle()
					});
				}
			});
		} else {
			res.send(500);
		}
	});
	//}
});

app.get('/fork/:projectId', function(req, res, next) {

	//fork new root app

	var framework = "php";

	var createFork = function(tags, namespace) {
		console.log("Received fork request........!!!");
		var proj = new Project({
			"framework" : framework,
			"authorName" : "Unknown",
			"proposedTitle" : "Untitled",
			"namespace" : namespace || null,
			"tags" : tags,
			"subTitle" : "Please add a description",
			clone : req.params.projectId,
			ready : function(err) {
				if(err) {
					console.log(err);
					res.send(500);
				} else {
					var list = req.headers["x-vcap_projects"] ? req.headers["x-vcap_projects"].split(",") : [];
					var projList = [];
					for(var i = 0; i < list.length; i++) {
						if(!isNaN(list[i])) {
							projList.push(list[i]);
						}
					}
					projList.push(proj.getId());
					AppChecker.addActiveApp(proj);
					console.log(projList);
					res.setHeader("Set-Cookie", "INITME=," + projList.join(","));
					res.writeHead(200);

					res.end(JSON.stringify({
						projectId : proj.getId(),
						appUrl : proj.getUrl()
					}));

					console.log("ending");
				}
			}
		});
	};

	var exitingProj = AppChecker.activateApp(req.params.projectId, function(proj) {
		var tags = proj.model.tags;
		var namespace = proj.model.namespace;
		createFork(tags, namespace);
	});

});

app.get('/:projectTitle', function(req, res, next) {
	//render user portal or ide

	var domainParts = req.headers.host.split(".");
	if(domainParts.length !== 3 || req.params.projectTitle == "favicon.ico") {
		next();
		return;
	}
	if(!isNaN(req.params.projectTitle)) {
		next();
		return;
	}

	var projList = req.headers["x-vcap_projects"] ? req.headers["x-vcap_projects"].split(",") : [];
	var isOwner = (projList.indexOf(req.params.id) >= 0);

	AppChecker.activateApp(req.params.projectTitle, function(proj) {
		if(proj && proj.getAuthorName() !== "Unknown") {
			Editor.getIndex(proj, isOwner, req, function(err, index) {
				if(err) {
					console.log(err);
					res.send(500);
				} else {
					res.end(index);
				}
			});
		} else {
			fs.readFile(__dirname + "/view/404.html", "utf8", function(err, index) {
				res.end(index);
			});
		}
	}, domainParts[0]);
});

app.get('/:id/*', function(req, res, next) {
	//render user portal or ide

	var projList = req.headers["x-vcap_projects"] ? req.headers["x-vcap_projects"].split(",") : [];
	var isOwner = (projList.indexOf(req.params.id) >= 0);

	AppChecker.activateApp(req.params.id, function(proj) {
		if(proj) {
			if(req.url.indexOf(proj.getProjectUrl()) < 0) {
				res.redirect("/" + proj.getProjectUrl());
			} else {
				Editor.getIndex(proj, isOwner, req, function(err, index) {
					if(err) {
						console.log(err);
						res.send(500);
					} else {
						res.end(index);
					}
				});
			}
		} else {
			fs.readFile(__dirname + "/view/404.html", "utf8", function(err, index) {
				res.end(index);
			});
		}
	});
});

app.get('/:id/*', function(req, res, next) {
	//render user portal or ide

	var projList = req.headers["x-vcap_projects"] ? req.headers["x-vcap_projects"].split(",") : [];
	var isOwner = (projList.indexOf(req.params.id) >= 0);

	AppChecker.activateApp(req.params.id, function(proj) {
		if(proj) {
			if(req.url.indexOf(proj.getProjectUrl()) < 0) {
				res.redirect("/" + proj.getProjectUrl());
			} else {
				Editor.getIndex(proj, isOwner, req, function(err, index) {
					if(err) {
						console.log(err);
						res.send(500);
					} else {
						res.end(index);
					}
				});
			}
		} else {
			fs.readFile(__dirname + "/view/404.html", "utf8", function(err, index) {
				res.end(index);
			});
		}

	});
});

app.get('/:id', function(req, res, next) {
	//render user portal or ide

	var projList = req.headers["x-vcap_projects"] ? req.headers["x-vcap_projects"].split(",") : [];
	var isOwner = (projList.indexOf(req.params.id) >= 0);

	AppChecker.activateApp(req.params.id, function(proj) {
		if(proj) {
			if(req.url.indexOf(proj.getProjectUrl()) < 0) {
				res.redirect("/" + proj.getProjectUrl());
			} else {
				Editor.getIndex(proj, isOwner, req, function(err, index) {
					if(err) {
						console.log(err);
						res.send(500);
					} else {
						res.end(index);
					}
				});
			}
		} else {
			fs.readFile(__dirname + "/view/404.html", "utf8", function(err, index) {
				res.end(index);
			});
		}
	});
});

app.listen(config.port, config.ip);
