var config = require("../config");
var async = require("async");

var mongoose = require('mongoose');
mongoose.connect(config.mongoURI);
var Project = require("../projects/Project");

var projects = [
	{
		root: "parent",
		framework: "php",
		proposedTitle: "hello-world",
		copyFrom: __dirname + "/php-hello-world",
		keepAlive: true
	}
];

async.forEach(projects,
		function(item, callback) {
		 	item.ready = callback;
            		var proj = new Project(item);
            		console.log("creating project");
			
		},
		function(err) {
			console.log(err);
			//process.exit(0);
		}
	);
