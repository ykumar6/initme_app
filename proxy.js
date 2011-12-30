var Connect = require("connect");
var config = require("./config");
var Project = require("./projects/Project");

var Path = require("path");
var global = require("./global");
var mongoose = require('mongoose');
var async = require("async");
var Editor = require("./editor");
var fs = require('fs');
var AppChecker = require("./checkapps");

mongoose.connect(config.mongoURI);

var _redirect = function(req, res, url) {
    res.end('<script type="text/javascript">window.location="http://init.me/' + url + '"</script>');
};
var server = Connect.createServer();
var io = require("socket.io").listen(server);
io.enable('browser client minification');
// send minified client
io.enable('browser client etag');
// apply etag caching logic based on version number
io.enable('browser client gzip');
io.set('transports', ['xhr-polling']);

io.set('authorization', function(data, accept) {
    var projList = data.headers["x-vcap_projects"] ? data.headers["x-vcap_projects"].split(",") : [];
    data.projList = projList;
    accept(null, true);

});
io.sockets.on("connection", function(client) {
    client.on("attach", function(data) {
        
        var projId = data.projectId;
        console.log("attach command");
        if  (client.handshake.projList.indexOf(projId) >= 0) {
            //this client owns this project
        
            AppChecker.activateApp(projId, function(proj) {
                
                client.on('disconnect', function () {
                    console.log("client removed");
                    proj.removeClientConnection(client);
                });
                
                console.log("client connection added");
                proj.addClientConnection(client);
            });
        }
    });
    
});

server.use(Connect.static(__dirname + "/style"));
server.use(Connect.router(function(app) {

    app.get('/:framework', function(req, res, next) {
        var framework = req.params.framework;
        console.log(framework);
        if(framework !== "node" && framework !== "php") {
            next();
            return;
        }

        var proj = new Project({
            "framework" : framework,
            ready : function(err) {
                if(err) {
                    console.log(err);
                    next(500);
                    return;
                }
                
                var projList = req.headers["x-vcap_projects"] ? req.headers["x-vcap_projects"].split(",") : [];
                projList.push(proj.getId());
                AppChecker.addActiveApp(proj);
                
                res.setHeader("Set-Cookie", "INITME=," + projList.join(","));
                _redirect(req, res, proj.getId());

            }
        });
    });

    app.get('/fork/:projectId', function(req, res, next) {
        //fork new root app
        var subDomains = (req.headers.host || "").split(".");
        if(subDomains.length !== 3) {
            next(404);
            return;
        }

        var framework = subDomains[0];

        var proj = new Project({
            "framework" : framework,
            clone : req.params.projectId,
            nameReady : function(proj, callback) {
                fs.readFile(__dirname + "/view/fork.html", "utf8", function(err, index) {
                    index = index.replace("</html>", "");
                    //dont close document
                    index = index.replace("</body>", "");
                    //dont close document

                    var projList = req.headers["x-vcap_projects"] ? req.headers["x-vcap_projects"].split(",") : [];
                    projList.push(proj.getId());
                    res.setHeader("Set-Cookie", "INITME=," + projList.join(","));

                    res.write(index);
                    callback(null);
                });
            },
            ready : function(err, model) {
                console.log(err);
                if(err) {
                    console.log(err);
                    next(500);
                    return;
                }
                activeApps.push(proj.getId());
                console.log("redirecting");
                _redirect(req, res, proj.getId());
            }
        });
    });

    app.get('/:id', function(req, res, next) {
        //render user portal or ide

        console.log("loading " + req.params.id);
        var projList = req.headers["x-vcap_projects"] ? req.headers["x-vcap_projects"].split(",") : [];
        if(projList.indexOf(req.params.id) < 0) {
            next(500);
            return;
        }
        
        AppChecker.activateApp(req.params.id, function(proj) {
            if (proj) {
                Editor.getIndex(proj.getPath(), proj.getFramework(), proj.getId(), function(err, index) {   
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

