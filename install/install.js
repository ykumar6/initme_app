var config = require("../config");
var async = require("async");

var mongoose = require('mongoose');
mongoose.connect(config.mongoURI);
var Project = require("../projects/Project");

var projects = [
	{
		root: "parent",
		framework: "php",
		proposedId: 100001,
		tags: ["php"],
		proposedTitle: "Hello World",
		subTitle: "Hello World, echoed in PHP",		
		authorName: "Yash Kumar",
		copyFrom: __dirname + "/php-hello-world",
		keepAlive: true
	},
        {
                root: "parent",
                framework: "php",
		  proposedId: 100002,
                proposedTitle: "Facebook get friends",
		  subTitle: "Select and search for facebook friends using the Facebook PHP SDK",
		  tags: ["php", "facebook"],
                authorName: "Yash Kumar",
				namespace: "facebook",
				namespaceUrl: "get-friends",
                copyFrom: __dirname + "/facebook-friends",
                keepAlive: true
        },
        {
                root: "parent",
                framework: "php",
          proposedId: 100011,
				namespace: "twilio",
				namespaceUrl: "outbound-call-with-client",
                proposedTitle: "Outbound call with Twilio Client",
          subTitle: "Using PHP and Twilio's Javascript client",
          tags: ["php", "twilio"],
                authorName: "Yash Kumar",
                copyFrom: __dirname + "/twilio-outbound",
                keepAlive: true
        },
     	{
                root: "parent",
                framework: "php",
          		proposedId: 100021,
                namespace: "dropbox",
                namespaceUrl: "upload-file-php",
                proposedTitle: "Dropbox File Uploader",
          		subTitle: "Uploads files to your Dropbox account using the PHP SDK",
          		tags: ["php", "dropbox"],
                authorName: "Yash Kumar",
                copyFrom: __dirname + "/dropbox-upload-php",
                keepAlive: true
        },
        {
                root: "parent",
                framework: "php",
                proposedId: 100012,
                namespace: "twiml",
                namespaceUrl: "php",
                proposedTitle: "Simple TwiML Server",
                subTitle: "Your TwiML Playground",
                tags: ["php", "twiml"],
                authorName: "Yash Kumar",
                copyFrom: __dirname + "/twiml-php",
                keepAlive: true
        },

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
