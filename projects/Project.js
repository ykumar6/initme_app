require("./Model");

var Twilio = require('../twilio');
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
    
    if (args.projectId || args.projectUrl) {
        async.waterfall(
            [
                self._projectTasks.projectMustExist.bind(self, args.projectId, args.projectUrl),
				self._projectTasks.setupAPIs.bind(self)
            ], 
        function(err) {
            args.ready(err);
        });
    } else {
        async.waterfall(
            [
                self._projectTasks.createUniqueProject.bind(self, args),
                self._projectTasks.setupAPIs.bind(self),
                self._projectTasks.cloneProjectFiles.bind(self, args.copyFrom || null),
                self._projectTasks.pushProject.bind(self)
            ], 
        function(err) {
            args.ready(err);
        });
    }

};

(function() {

    var verifyPhone = function(account, phone, client) {
		Twilio.verifyPhone(account, phone, function(code) {
			if (code) {
				client.emit("outgoingVerifyCode", code);
			} else {
				client.emit("outgoingVerifyError", code);
			}
		});
    };

    this.errorHandler = function(userId, command, msg) {
    };
    this.successHandler = function(userId, command, payload) {
    };

    this.getTwilioAccount = function(accoundId, cb) {
	 async.forEach(this.clients, 
	 function(client, callback) {
		client.get("twilioAccount", function(err, account) {
			console.log(account);
			if (account && account.sid == accoundId) {
				cb(account);
				callback(true);
			}
		});
		callback(null);
	 },
	 function(isFound) {
		if (!isFound) {
			cb(null);
		}
	 });
    };	
   

    this.addClientConnection = function(client) {
	var self = this;
    	var twilioVerify = function(phone) {
		client.get("twilioAccount", function(err, account) {
			if (account) {
				verifyPhone(twilioAccount, phone, client);
			} else {
				Twilio.addAccount(function(account) {
					client.emit("twilioAccount", account.sid);
					client.set("twilioAccount", account, function() {});
					verifyPhone(account, phone, client);
				});	
			}
		});
    	}; 
   
	 client.on("twilioVerify", twilioVerify);

        this.clients.push(client);
        if (this.clients.length === 1) {
            //start app
	     console.log("starting project");
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
        if (this.clients.length === 0 && !this.isKeepAlive()) {
            console.log("killing project"); 
            if (this.killTimer) {
                clearTimeout(this.killTimer);
            }
            self.killTimer = setTimeout(function() {
                self._projectTasks.stopProject.call(self);
		  console.log("killing project for real");
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
        return this.model.projectTitle;
    };

    this.getSubTitle = function() {
        return this.model.subTitle;
    };

    this.getProjectUrl = function() {
        return this.model.projectUrl;
    };

    this.getAuthorName = function() {
        return this.model.authorName;
    };
    
    this.isKeepAlive = function() {
        return this.model.keepAlive;
    }

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
        return this.model.projectId + "." + config.appDomain;
    };
    //workspace tasks to be used by async waterfall
    this._projectTasks = {

      createUniqueProject : function(args, callback) {
            console.log("Creating project");
            var _self = this;
            var proj = new model({
                "projectId" : args.proposedId || null,
                "projectTitle" : args.proposedTitle || null,
                "subTitle" : args.subTitle || null,
		  "authorName": args.authorName,
		  "tags": args.tags || [],
                "root" : args.clone || args.framework,
                "framework" : args.framework,
		  "keepAlive": args.keepAlive || false
            });
            proj.save(function(err, doc) {
                console.log(err);
                if(err) {
		    		console.log(err)
                    callback("Couldn't create unique project", args);
                } else {
                    _self.model = doc;
                    callback(null);
                }
            })
        },

		setupAPIs: function(callback) {
			var self = this;
			if (this.model.tags.indexOf("twilio")) {
				Twilio.createApp(this.getId(), this.getUrl(), function(data) {
					if (data && data.appId) {
						console.log("twilio app created " + JSON.stringify(data));
						self.twilioSid = data.appId;
						callback(null);
					} 
					else {
						console.log("error");
						console.log(data);
						callback("Couldn't setup twilio api");
					}
				});
			} else {
				callback(null);
			}
		},
        
        projectMustExist : function(projectId, projectUrl, callback) {
            var _self = this;
            var searchParams = {};
            if(projectId) {
                searchParams = {
                    "projectId" : projectId
                };
            } else {
                searchParams = {
                    "projectUrl" : projectUrl
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
        cloneProjectFiles : function(cloneFrom, callback) {
	     console.log(cloneFrom);
            var clone = new Clone(cloneFrom || (config.workspaceDir + this.getRoot() + ""), this.getPath());
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
	     console.log("starting project");
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
