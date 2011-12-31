var ajax = require("./ajax");
var Zip = require("./zip");
var async = require("async");
var config = require("./config");
var Multipart = require('./multipart');
var loggly = require('loggly');
var logger = loggly.createClient({
    subdomain : "stackexpress"
});
var fs = require("fs");

//CloudFoundry constructor
var CloudFoundry = function() {

};

(function() {

    var _adminToken;

    this.getAppStatus = function(appName, callback) {
        var _self = this;
        async.waterfall([_tasks.adminTokenMustBeValid.bind(_self), _tasks.appStatus.bind(_self, appName)//pass parameters to next method
        ], function(err, doc) {
            if(err) {
                logger.log(config.logger.errors, JSON.stringify({
                    action : "getAppStatus",
                    error : err
                }));
                callback({
                    "status" : "unknown",
                    err : err
                });
            } else {
                if(doc["0"] && doc["0"].state === "RUNNING" && doc["0"]["stats"]) {
                    var appState = doc["0"]["stats"];
                    var stateObj = {};

                    stateObj["status"] = "RUNNING";
                    if(appState.uris && appState.uris[0]) {
                        stateObj["url"] = appState.uris[0];
                    }
                    if(appState.uptime) {
                        stateObj["uptime"] = appState.uptime;
                    }
                    if(appState.requests) {
                        stateObj["requests"] = appState.requests;
                    }
                    if(appState.usage && typeof (appState.usage.cpu) === "number" && typeof (appState.usage.mem) === "number" && typeof (appState.usage.disk) === "number") {
                        stateObj["mem"] = appState.usage.mem;
                        stateObj["cpu"] = appState.usage.cpu;
                        stateObj["disk"] = appState.usage.disk;
                    }
                    callback(stateObj);
                } else if(doc.code === 301) {
                    callback({
                        "status" : "notfound"
                    });
                    //app doesn't exist
                } else {
                    callback({
                        "status" : "inactive"
                    });
                    //app is sleeping
                }
            }
        });
    };

    this.getRunningApps = function(callback) {

        var _self = this;
        var processApps = function(data, callback) {
            var apps = [];
            for(var i = 0; i < data.length; i++) {
                if(data[i]["state"] === "STARTED") {
                    apps.push(data[i]["name"]);
                }
            }
            callback(null, apps);
        };

        async.waterfall([_tasks.adminTokenMustBeValid.bind(_self), _tasks.getAllApps.bind(_self), processApps], callback);
    };

    this.createWorkspace = function(userName, callback) {

    };

    this.deleteWorkspace = function() {

    };

    this.pushNewApp = function(args, callback) {        
        var _self = this;
        callback = callback || function() {};
        async.waterfall([_tasks.adminTokenMustBeValid.bind(_self), _tasks.createApp.bind(_self, args.appName, args.appUrl, args.framework)], callback);

    };


    this.pushExistingApp = function(appName, appDir, callback) {
        var _self = this;
        async.waterfall([_tasks.uploadApp.bind(_self, appName, appDir)], callback);

    };

    this.startApp = function(appName, callback) {
        var self = this;
        callback = callback || function() {};
        
        async.waterfall([
            _tasks.adminTokenMustBeValid.bind(self),
            _tasks.getAppManifest.bind(self, appName),
            function(manifest, callback) {
                if (manifest["state"] === "STOPPED") {
                    manifest["state"] = "STARTED";
                    //yes, this is how you start an app?!?
                    _tasks.setAppManifest(appName, manifest, function(err) {
                        if(err) {
                            callback(err);
                        } else {
                            callback(null);
                        }
                    });
                }
            },
        ], callback)
        
    };

    this.stopApp = function(appName, callback) {

        var self = this;
        callback = callback || function() {};
        
        async.waterfall([
            _tasks.adminTokenMustBeValid.bind(self),
            _tasks.getAppManifest.bind(self, appName),
            function(manifest, callback) {
                manifest["state"] = "STOPPED";
                _tasks.setAppManifest(appName, manifest, function(err) {
                    if(err) {
                        callback(err);
                    } else {
                        callback(null);
                    }
                });
            },
        ], callback);
                
    };

    this.addServicesToWorkspace = function() {

    };
    //this command is called by Auth module
    this.registerUser = function(userName, password, callback) {

    };
    var _tasks = {

        //checks admin token validity, and logs in if not valid
        adminTokenMustBeValid : function(callback) {
            if(!_adminToken || !_adminToken.token || (new Date()).getDate() - _adminToken.birthday.getDate() > 7) {
                //admin login to CloudFoundry
                var path = "/users/" + config.cfadmin + "/tokens";
                var data = {
                    password : config.cfpass
                };
                ajax.jsonPost({
                    "path" : path,
                    "data" : data,
                    "onResponse" : function(err, res) {
                        if(err) {
                            logger.log(config.logger.CRITICAL_ERROR, JSON.stringify({
                                action : "getCFAdminToken",
                                error : err
                            }));
                            callback("Error while talking to our cloud servers");

                        } else {
                            _adminToken = {
                                "token" : res.data.token,
                                "birthday" : new Date()
                            };
                            callback(null);
                        }
                    }
                });
            } else {
                callback(null);
            }
        },
        userMustExist : function(userName, callback) {
            var path = "/info";

            ajax.jsonPost({
                "path" : path,
                "data" : null,
                "cmd" : "GET",
                "token" : _adminToken.token,
                "proxy" : userName,
                "onResponse" : function(err, res) {
                    if(err) {
                        callback(err);
                    } else {
                        callback(null, res);
                    }
                }
            });
        },
        getAppManifest : function(appName, callback) {
            var path = "/apps/" + appName;

            ajax.jsonPost({
                "path" : path,
                "data" : null,
                "cmd" : "GET",
                "token" : _adminToken.token,
                "onResponse" : function(err, res) {
                    if(err) {
                        logger.log(config.logger.errors, JSON.stringify({
                            action : "getAppManifest",
                            error : err
                        }));
                        callback(err);
                    } else if(res && res.data && res.status === 200) {
                        callback(null, res.data);
                        //success
                    } else {
                        logger.log(config.logger.errors, JSON.stringify({
                            action : "getAppManifest",
                            error : "HTTPStatus: " + res.status
                        }));
                        callback(res.status);
                    }
                }
            });
        },
        getAllApps : function(callback) {
            var path = "/apps";

            ajax.jsonPost({
                "path" : path,
                "data" : null,
                "cmd" : "GET",
                "token" : _adminToken.token,
                "onResponse" : function(err, res) {
                    if(err) {
                        logger.log(config.logger.errors, JSON.stringify({
                            action : "getAllApps",
                            error : err
                        }));
                        callback(err);
                    } else if(res && res.data && res.status === 200) {
                        callback(null, res.data);
                        //success
                    } else {
                        logger.log(config.logger.errors, JSON.stringify({
                            action : "getAllApps",
                            error : "HTTPStatus: " + res.status
                        }));
                        callback(res.status);
                    }
                }
            });
        },


        setAppManifest : function(appName, appManifest, callback) {
            var path = "/apps/" + appName;

            ajax.jsonPost({
                "path" : path,
                "data" : appManifest,
                "cmd" : "PUT",
                "token" : _adminToken.token,
                "onResponse" : function(err, res) {
                    if(err) {
                        logger.log(config.logger.errors, JSON.stringify({
                            action : "setAppManifest",
                            error : err
                        }));
                        callback(err);
                    } else if(res && res.data && res.status === 200) {
                        callback(null);
                        //success
                    } else {
                        logger.log(config.logger.errors, JSON.stringify({
                            action : "setAppManifest",
                            error : "HTTPStatus: " + res.status
                        }));
                        callback(res.status);
                    }
                }
            });
        },
        getLogs : function(appName, callback) {

        },
        startApp : function(appName, callback) {

        },
        appStatus : function(appName, callback) {
            var path = "/apps/" + appName + "/stats";

            ajax.jsonPost({
                "path" : path,
                "data" : null,
                "cmd" : "GET",
                "token" : _adminToken.token,
                "onResponse" : function(err, res) {
                    callback(err, res ? res.data : null);
                }
            });
        },
        createApp : function(appName, appUrl, framework, callback) {
            var path = '/apps';
            var data = {
                "instances" : 1,
                "staging" : {
                    "runtime" : null,
                    "framework" : framework
                },
                "uris" : [appUrl, "init.me/" + appName + "-portal"],
                "name" : appName,
                "resources" : {
                    "memory" : 256
                }
            };

            ajax.jsonPost({
                "path" : path,
                "data" : data,
                "cmd" : "POST",
                "token" : _adminToken.token,
                "onResponse" : function(err, res) {
                    if(err) {
                        callback(err);
                        logger.log(config.logger.errors, JSON.stringify({
                            action : "createApp",
                            error : err
                        }));
                    } else {
                        if(res.status === 302) {
                            callback(null)
                        } else {
                            logger.log(config.logger.errors, JSON.stringify({
                                action : "createApp",
                                error : res
                            }));
                            callback(res.status);
                        }
                    }
                }
            });
        },
        uploadApp : function(appName, appDir, callback) {
            var path = "/apps/" + appName + "/application";

            var multiEncode = new Multipart();
            var bufferList = [];
            bufferList.push(new Buffer(multiEncode.EncodeFilePart("application/zip", "application", appName + ".zip"), "ascii"));
            var zip = new Zip(appDir, bufferList);

            zip.on("complete", function() {
                bufferList.push(new Buffer("\r\n", "ascii"));
                bufferList.push(new Buffer(multiEncode.EncodeFieldPart('resources', '[]'), 'ascii'));
                bufferList.push(new Buffer(multiEncode.EncodeFieldPart('_method', 'put'), 'ascii'));
                bufferList.push(new Buffer("--" + multiEncode.boundary + "--", 'ascii'));

                ajax.uploadBuffer({
                    "path" : path,
                    "token" : _adminToken.token,
                    "bufferList" : bufferList,
                    "boundary" : multiEncode.boundary,
                    "onResponse" : function(err, res) {
                        if(err) {
                            logger.log(config.logger.errors, JSON.stringify({
                                action : "uploadApp",
                                error : err
                            }));
                            callback(err);
                        } else if(res && res === 200) {
                            callback(null);
                            //success
                        } else {
                            logger.log(config.logger.errors, JSON.stringify({
                                action : "uploadApp",
                                error : "HTTPStatus: " + res
                            }));
                            console.log(res);
                            callback(res);
                        }
                    }
                });
            });
            zip.on("error", function(err) {
                logger.log(config.logger.errors, JSON.stringify({
                    action : "zipApp",
                    error : err
                }));
                callback(err);
            });
        },
        registerUser : function(userName, password, callback) {
            //admin login to CloudFoundry
            var path = "/users"
            var data = {
                "password" : password,
                "email" : userName
            };

            ajax.jsonPost({
                "path" : path,
                "data" : data,
                "onResponse" : function(err, res) {
                    if(err || res.status !== 204) {
                        logger.log(config.logger.CRITICAL_ERROR, JSON.stringify({
                            action : "registerUserCF",
                            error : err
                        }));
                        callback("Error while registering user");
                    } else {
                        //success
                        callback(null);
                    }
                }
            });
        }
    }

}).call(CloudFoundry.prototype);

module.exports = CloudFoundry;
