var global = require("./global");
var Project = require("./projects/Project");
var mongoose = require("mongoose");
require("./projects/Model");
var ProjectModel = mongoose.model("Project");

var Twilio = require("./twilio");

var activeApps = {};
console.log("checkapp init");

function checkInitialState() {

    global.cloudFoundry.getRunningApps(function(err, apps) {
        if(err) {
            console.log("Error initializing state " + err);
            process.exit(1);
            return;
        }
    
        for (var i=0; i<apps.length; i++) {
            if (!activeApps[apps[i]]) {
                console.log("kicking app " + apps[i])
                global.cloudFoundry.stopApp(apps[i], function(){});
            }
        }
    });

	Twilio.allApps(function(apps) {
		
		for (var i=0; i<apps.length; i++) {
			var isBeingUsed = false;

			for (var projId in activeApps) {
                if (apps[i].sid === activeApps[projId].twilioSid) {
                    isBeingUsed = true;
                    break;
                }
			}

			if (!isBeingUsed) {
				console.log(apps[i].sid);
				Twilio.deleteApp(apps[i].sid);
			}
		}		

	});
}

setTimeout(checkInitialState, 10000);

module.exports = {
    

    addActiveApp: function(proj, twilio) {
        proj.killProject = this.removeApp;
        activeApps[proj.getId()] = proj;
    },

    findProject: function(appId, cb) {
	 ProjectModel.findOne({"projectId": appId}, function(err, doc) {
		console.log(err);
		console.log(doc);
		if (doc) {
			cb(doc);
		}
		else {
			cb(null);
		}
	 });
    },

    activateApp: function(appName, cb, namespace) {
        var self = this;

       var getApp = function(appId) {
        if (activeApps[appId]) {
            cb(activeApps[appId]);
        }
        else {
           var params = {};
	    params.projectId = appId;
	
           params.ready = function(err, model) {
                if(err) {
                    cb(null);
                }
                else {
                    self.addActiveApp(proj);
                    cb(proj);  
                }
            };
            var proj = new Project(params);
        }
      };

      if (appName && namespace) {
		console.log(appName);
		console.log(namespace);

		ProjectModel.findOne({"namespaceUrl": appName.toLowerCase(), "namespace": namespace.toLowerCase()}, function(err, doc) {
			console.log(err);
			console.log(doc);
			if (doc) {
				getApp(doc.projectId);
			}
			else {
				cb(null);
			}
		});
      }
      else {
		getApp(appName);
      }
	
    },
    
    removeApp: function(proj) {
        if (activeApps[proj.getId()]) {
		delete activeApps[proj.getId()];
	 }
    },

	currentApps: activeApps
    
};

/*
var checkApps = function(apps) {

    var nextSetOfActiveApps = [];
    console.log("starting check apps");
    async.forEach(apps, function(item, callback) {
        global.cloudFoundry.getAppStatus(item, function(state) {
            //check the number of requests for app in the last minute
            console.log(state);
            if(state.requests && state.requests.length > 6) {
                var reqLen = state.requests.length;
                var kickApp = true;
                for(var i = 0; i < 6; i++) {
                    if(state.requests[reqLen - i - 1] !== 0) {
                        kickApp = false;
                    }
                }
                if(kickApp) {
                    console.log("kicking app " + item);
                    global.cloudFoundry.stopApp(item, function(err) {
                        if(err) {
                            //try stopping app during next loop
                            nextSetOfActiveApps.push(item);
                        }
                        callback(null);
                    });
                    return;
                }
            }
            nextSetOfActiveApps.push(item);
            callback(null);
        });
    });
}
*/
//initialize state


