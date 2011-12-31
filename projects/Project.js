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
    var self = this;
    
    if (args.projectId) {
        async.waterfall(
            [
                self._projectTasks.projectMustExist.bind(self, args.projectId, null, null)
            ], 
        function(err) {
            args.ready(err);
        });
    } else {
        async.waterfall(
            [
                self._projectTasks.createUniqueProject.bind(self, args.namespace || "", args.framework, args.clone || args.framework),
                self._projectTasks.cloneProjectFiles.bind(self),
                self._projectTasks.pushProject.bind(self)
            ], 
        function(err) {
            args.ready(err);
        });
    }

};

(function() {

    this.errorHandler = function(userId, command, msg) {
    };
    this.successHandler = function(userId, command, payload) {
    };
    
    this.addClientConnection = function(client) {
        this.clients.push(client);
        if (this.clients.length === 1) {
            //start app
            this._projectTasks.startProject.call(this);
        }
        
        if (this.killTimer) {
            clearTimeout(this.killTimer);
            this.killTimer = null;
        }
    };
    
    this.removeClientConnection = function(client) {
        var self = this;
        var idx = this.clients.indexOf(client);
        if (idx >= 0) {
            this.clients.splice(idx, 1);
        }
        if (this.clients.length === 0) {
            
            if (this.killTimer) {
                clearTimeout(this.killTimer);
            }
            self.killTimer = setTimeout(function() {
                self._projectTasks.stopProject.call(self);
                if (self.killProject) self.killProject(self); //removes reference from checkapps
            }, 10000);            
        }
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
                if (err || !doc) {
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
        
        stopProject : function(callback) {
            var self = this;
            global.cloudFoundry.stopApp(self.getId(), callback);
        },
        
        startProject : function(callback) {
            var self = this;
            global.cloudFoundry.startApp(self.getId(), callback);
        },

        pushProject : function(callback) {
            var self = this;
            global.cloudFoundry.pushNewApp({
                "appName" : self.getId(),
                "appUrl" : self.getUrl(),
                "appDir" : self.getPath(),
                "framework" : self.getFramework()
            }, callback);
        }
    }
}).call(Project.prototype);

module.exports = Project;
