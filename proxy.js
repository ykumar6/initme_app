var Connect = require("connect");
var config = require("./config");
var Project = require("./projects/Project");
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
    res.end('<script type="text/javascript">window.location="http://init.me/' + url + '"</script>');
};
var server = Connect.createServer();
var io = require("socket.io").listen(server);
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
	    if (!projId) {
                return;
            }
        
            AppChecker.activateApp(projId, function(proj) {
                
                client.on('disconnect', function () {
                    proj.removeClientConnection(client);
                });
                
                proj.addClientConnection(client);
            });
    });
    
});

server.use(Connect.static(__dirname + "/style"));
server.use(Connect.router(function(app) {

    app.get('/', function(req, res, next) {
        //render user portal or ide

    	fs.readFile(__dirname + "/view/index.html", "utf8", function(err, index) {
    		res.end(index);
    	});

    });
    
    app.get('/user/:email', function(req, res, next) {
        
        var usr = new User({"email": req.params.email});
        usr.save(function(err, doc) {
           if (err) {
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
            if (proj) {
                Editor.getIndex(proj, isOwner, function(err, index) {   
                   if (err) {
                        console.log(err);
                        next(500);
                   }  else {
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
                    res.end(JSON.stringify({projectId: proj.getId(), appUrl: proj.getUrl()}));          
                }
            }
        });

    });

    app.get('/php/:projectTitle', function(req, res, next) {
        //render user portal or ide

        
        var projList = req.headers["x-vcap_projects"] ? req.headers["x-vcap_projects"].split(",") : [];
        var isOwner = (projList.indexOf(req.params.id) >= 0);
       
        
        AppChecker.activateApp(req.params.projectTitle, function(proj) {
            if (proj) {
                Editor.getIndex(proj, isOwner,  function(err, index) {   
                   if (err) {
                        console.log(err);
                        next(500);
                   }  else {
                        res.end(index);                       
                   }
                });    
            } else {
                next(500);
            }
        });

    });
}));

server.listen(80);

