var express = require("express");
var config = require("./config");
var Project = require("./projects/Project");
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var GitHubStrategy = require('passport-github').Strategy;
var GoogleStrategy = require('passport-google').Strategy;
var https = require("https");

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

// configure Express
app.configure(function() {
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.session({
        secret : 'keyboard cat'
    }));
    // Initialize Passport!  Also use passport.session() middleware, to support
    // persistent login sessions (recommended).
    app.use(passport.initialize());
    app.use(passport.session());
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
    console.log(user);
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
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
    returnURL: 'http://' + config.appDomain + '/auth/google/return',
    realm: 'http://' + config.appDomain  + '/'
  },
  function(identifier, done) {
    console.log(identifier);

  }
));

app.get('/', function(req, res, next) {
    //render user portal or ide

    fs.readFile(__dirname + "/view/index.html", "utf8", function(err, index) {
        res.end(index);
    });
});

app.get('/auth/google',
  passport.authenticate('google'),
  function(req, res){
    // The request will be redirected to Google for authentication, so
    // this function will not be called.
  });

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/?loginResult=fail' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/?loginResult=success');
  });

app.get('/auth/github',
  passport.authenticate('github', { scope: ['user'] }),
  function(req, res){
    // The request will be redirected to GitHub for authentication, so this
    // function will not be called.
});

app.get('/auth/facebook/callback', passport.authenticate('facebook', {
    failureRedirect : '/?loginResult=fail'
}), function(req, res) {
    res.redirect('/?loginResult=success');
});

app.get('/auth/facebook', 
    passport.authenticate('facebook', { scope: ['email'] }), 
    function(req, res) {
    // The request will be redirected to Facebook for authentication, so this
    // function will not be called.
});

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

app.get('/user/:email', function(req, res, next) {

    var usr = new User({
        "email" : req.params.email
    });
    usr.save(function(err, doc) {
        if(err) {
            res.writeHead(500);
            res.end();
        } else {
            res.writeHead(200);
            res.end();
        }
    });
});

app.get('/:id', function(req, res, next) {
    //render user portal or ide

    console.log(req.headers);
    var projList = req.headers["x-vcap_projects"] ? req.headers["x-vcap_projects"].split(",") : [];
    var isOwner = (projList.indexOf(req.params.id) >= 0);

    AppChecker.activateApp(req.params.id, function(proj) {
        if(proj) {
            Editor.getIndex(proj, isOwner, function(err, index) {
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

app.get('/fork/:projectId', function(req, res, next) {
    //fork new root app
    var framework = "php";
    console.log(req.headers);
    var proj = new Project({
        "framework" : framework,
        clone : req.params.projectId,
        ready : function(err) {
            if(err) {
                console.log(err);
                res.writeHead(500);
            } else {
                var projList = req.headers["x-vcap_projects"] ? req.headers["x-vcap_projects"].split(",") : [];
                projList.push(proj.getId());
                AppChecker.addActiveApp(proj);

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

app.get('/php/:projectTitle', function(req, res, next) {
    //render user portal or ide

    var projList = req.headers["x-vcap_projects"] ? req.headers["x-vcap_projects"].split(",") : [];
    var isOwner = (projList.indexOf(req.params.id) >= 0);

    AppChecker.activateApp(req.params.projectTitle, function(proj) {
        if(proj) {
            Editor.getIndex(proj, isOwner, function(err, index) {
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
