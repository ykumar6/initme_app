
var fs = require("fs");
var async = require("async");
var config = require("../config");
var workingDir = config.workspaceDir;
var sys = require("sys");
var Project = require("./Project");

var PHPProject = function(args) {    
    var _self = this;
    Project.call(this);
        
    if (typeof args.projectId === "string") {
        //retrieve by projectId

        this._projectTasks.projectMustExist.call(_self, args.projectId, null, null, function(err) {
            if (!err) {
                var options = {
                    "ext" : args.ext,
                    "server": args.server,
                    "friendlyProjName": "PHP Project"
                }
                _self._projectTasks.createIdeInstance.call(_self, options);
            }
            args.ready(err);            
        });
    }
    else if (typeof args.namespace === "string" && typeof args.projectTitle === "string"){
        //retrieve by namespace + projectTitle
        this._projectTasks.projectMustExist.call(_self, null, args.namespace, args.projectTitle, function(err) {
            if (!err) {
                var options = {
                    "ext" : args.ext,
                    "server": args.server,
                    "friendlyProjName": "PHP Project"
                }
                _self._projectTasks.createIdeInstance.call(_self, options);
            }
            args.ready(err);            
        });
    }
    else {
        //must create new project
        async.waterfall(
            [
                _self._projectTasks.createUniqueProject.bind(_self, args.namespace || "", "php", args.clone || "php"),
                _self._projectTasks.cloneProjectFiles.bind(_self),
                function(cb) {
                    console.log("setting up ide");
                    var options = {
                        "ext" : args.ext,
                        "server": args.server,
                        "friendlyProjName": "PHP Project"
                    }
                    _self._projectTasks.createIdeInstance.call(_self, options, cb);
                }
            ], 
            function(err) {
                args.ready(err);
            }
        )
    }
};

sys.inherits(PHPProject, Project);

(function() {
    
    this.cloneProject = function(cb) {
        //if project model cached, return it
        
    };
    
}).call(PHPProject.prototype);

module.exports = PHPProject;



