var global = require("./global");
var Project = require("./projects/Project");


var activeApps = [];


function checkInitialState() {
    global.cloudFoundry.getRunningApps(function(err, apps) {
        if(err) {
            console.log("Error initializing state " + err);
            process.exit(1);
            return;
        }
    
        for (var i=0; i<apps.length; i++) {
            if (global.find(apps[i], activeApps) < 0) {
                console.log("kicking app " + apps[i])
                global.cloudFoundry.stopApp(apps[i], function(){});
            }
        }
    });
}

setTimeout(checkInitialState, 600000);

module.exports = {
    

    addActiveApp: function(proj) {
        proj.killProject = this.removeApp;
        activeApps.push(proj);
    },

    activateApp: function(appName, cb) {
        var self = this;
        var projIdx = global.find(appName, activeApps);
        if (projIdx >= 0) {
            cb(activeApps[projIdx]);
        }
        else {
            var proj = new Project({
                projectId : appName,
                ready : function(err, model) {
                    if(err) {
                        cb(null);
                    }
                    else {
                        self.addActiveApp(proj);
                        cb(proj);  
                    }
                }
            });
        }
    },
    
    removeApp: function(proj) {
        var idx;
        if ((idx = activeApps.indexOf(proj)) >= 0) {
            activeApps.splice(idx, 1);
        }
    }
    
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


