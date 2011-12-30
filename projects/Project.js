require("./Model");

var mongoose = require('mongoose');
var fs = require("fs");
var async = require("async");
var FILEMODE = 0700;
var config = require("../config");
var workingDir = config.workspaceDir;
var model = mongoose.model("Project");
var Clone = require("../clone");
var loggly = require("loggly");
var global = require("../global");
var logger = loggly.createClient({
    subdomain : "stackexpress"
});

var Project = function(args) {

    this.clients = [];
    
    if(args.projectId) {
        _ExistingProject.apply(this, arguments);
    } else {
        _NewProject.apply(this, arguments);
    }

};
//existing project constructor
var _ExistingProject = function(args) {
    var self = this;
    async.waterfall([self._projectTasks.projectMustExist.bind(self, args.projectId, null, null)], function(err) {
        args.ready(err);
    })
};
//new project constructor
var _NewProject = function(args) {

    var self = this;
    async.waterfall([self._projectTasks.createUniqueProject.bind(self, args.namespace || "", args.framework, args.clone || args.framework), self._projectTasks.cloneProjectFiles.bind(self), self._projectTasks.pushProject.bind(self)], function(err) {
        args.ready(err);
    })
};

(function() {

    this.errorHandler = function(userId, command, msg) {
    };
    this.successHandler = function(userId, command, payload) {
    };
    
    this.addClientConnection = function(client) {
        this.clients.push(client);
    };
    
    this.removeClientConnection = function(client) {
        
    };

    this.getId = function() {
        return this.model.projectId;
    };

    this.getFullName = function() {
        return this.model.fullName;
    };

    this.getTitle = function() {
        return this.model.projectTitle || "Untitled-Project";
    };

    this.getFramework = function() {
        return this.model.framework;
    };

    this.getPath = function() {
        return this.model.path;
    };

    this.getRoot = function() {
        return this.model.root;
    };

    this.getUrl = function() {
        return this.model.url;
    };
    //workspace tasks to be used by async waterfall
    this._projectTasks = {

        createUniqueProject : function(namespace, framework, root, callback) {
            console.log("Creating project");
            var _self = this;
            var proj = new model({
                "namespace" : namespace,
                "root" : root,
                "framework" : framework
            });
            proj.save(function(err, doc) {
                console.log(err);
                if(err) {
                    callback("Couldn't create unique project", namespace);
                } else {
                    _self.model = doc;
                    callback(null);
                }
            })
        },
        projectMustExist : function(projectId, namespace, projectTitle, callback) {
            var _self = this;
            var searchParams = {};
            if(projectId) {
                searchParams = {
                    "projectId" : projectId
                };
            } else {
                searchParams = {
                    "namespace" : namespace,
                    "projectTitle" : projectTitle
                };
            }

            model.findOne(searchParams, function(err, doc) {
                if(err || !doc) {
                    callback("Project doesn't exist", searchParams);
                } else {
                    _self.model = doc;
                    callback(null);
                }
            });
        },
        addWorkspaceFS : function(callback) {
            var self = this;
            fs.mkdir(self.getPath(), FILEMODE, function(err) {
                var res = err ? "I/O error while creating workspace " + self.getId() : null;
                callback(res);
            });
        },
        cloneProjectFiles : function(callback) {
            var clone = new Clone(config.workspaceDir + this.getRoot() + "", this.getPath());
            console.log("cloning to: " + this.getPath());
            var self = this;
            clone.on("complete", function() {
                callback(null);
            })
            clone.on("error", function(err) {
                logger.log(config.logger.errors, JSON.stringify({
                    action : "cloneProject",
                    error : err
                }));
                callback(err);
            });
        },
        startProject : function(callback) {
            var self = this;
            var pingAttempts = 0;
            function waitForStart(err) {
                if(err) {
                    callback(err);
                    logger.log(config.logger.errors, JSON.stringify({
                        action : "startApp",
                        "appUrl" : self.model.url,
                        error : err
                    }));
                } else {
                    setTimeout(appPing, 500);
                    //ping app
                }
            };

            function appPing() {
                global.cloudFoundry.getAppStatus(self.getId(), function(obj) {
                    if(obj.status === "RUNNING") {
                        callback(null);
                        //success
                    } else {
                        if(pingAttempts > 5) {
                            callback("Could not start app");
                        } else {
                            pingAttempts++;
                            setTimeout(appPing, 500);
                        }
                    }
                });
            };


            global.cloudFoundry.startApp(self.getId(), waitForStart);
        },
        pushProject : function(callback) {
            var self = this;
            var pingAttempts = 0;
            function waitForStart(err) {
                console.log("project started");
                console.log(err);
                if(err) {
                    callback(err);
                    logger.log(config.logger.errors, JSON.stringify({
                        action : "startApp",
                        "appUrl" : self.model.url,
                        error : err
                    }));
                } else {
                    callback(null);
                    setTimeout(appPing, 500);
                }
            };

            function appPing() {
                global.cloudFoundry.getAppStatus(self.getId(), function(obj) {
                    if(obj.status === "RUNNING") {
                        self.isRunning = true;
                        //success
                    } else {
                        if(pingAttempts > 5) {
                            self.isRunning = false;
                        } else {
                            pingAttempts++;
                            setTimeout(appPing, 500);
                        }
                    }
                });
            };


            console.log("pushing app");
            global.cloudFoundry.pushNewApp({
                "appName" : self.getId(),
                "appUrl" : self.getUrl(),
                "appDir" : self.getPath(),
                "framework" : self.getFramework()
            }, waitForStart);
        }
    }
}).call(Project.prototype);

module.exports = Project;
