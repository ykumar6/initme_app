
var fs = require("fs");
var async = require("async");
var config = require("../config");
var workingDir = config.workspaceDir;
var sys = require("sys");
var Project = require("./Project");

var RubyProject = function(args) {    
    var _self = this;
    Project.call(this);
    if (!args.projectName) {
        //create project
        async.waterfall(
            [
                _self._projectTasks.createUniqueProject.bind(_self, args.namespace, "ruby"),
                _self._projectTasks.cloneProjectFiles.bind(_self),
                function(cb) {
                    var options = {
                        "ext" : args.ext,
                        "server": args.server,
                        "friendlyProjName": "RubyProject"
                    }
                    _self._projectTasks.createIdeInstance.call(_self, options, cb);
                }
            ], 
            function(err) {
                args.ready(err);
            }
        )
    }
    else {
        console.log(args.projectName);
        this._projectTasks.projectMustExist.call(_self, args.namespace, args.projectName, function(err) {
            if (!err) {
                var options = {
                    "ext" : args.ext,
                    "server": args.server,
                    "friendlyProjName": "RubyProject"
                }
                _self._projectTasks.createIdeInstance.call(_self, options);
            }
            args.ready(err);            
        });
    }
};

sys.inherits(RubyProject, Project);

(function() {
    
    this.cloneProject = function(cb) {
        //if project model cached, return it
        
    };
    
}).call(RubyProject.prototype);

module.exports = RubyProject;



