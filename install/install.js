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
        {
                root: "parent",
                framework: "php",
                proposedId: 100003,
                namespace: "facebook",
                namespaceUrl: "get-friends-js",
                proposedTitle: "Get your facebook friends",
                subTitle: "Use Facebook's Javascript API to get your friends",
                tags: ["javascript", "facebook"],
                authorName: "Yash Kumar",
                copyFrom: __dirname + "/facebook-friends-js",
                keepAlive: true
        },
        {
                root: "parent",
                framework: "php",
                proposedId: 100004,
                namespace: "facebook",
                namespaceUrl: "friends-birthdays-this-week-js",
                proposedTitle: "Facebook Friends birthdays this week",
                subTitle: "Use Facebook's Javascript API to get birthdays",
                tags: ["javascript", "facebook"],
                authorName: "Yash Kumar",
                copyFrom: __dirname + "/facebook-birthdays-js",
                keepAlive: true
        },
        {
                root: "parent",
                framework: "php",
                proposedId: 100005,
                namespace: "facebook",
                namespaceUrl: "friends-relationship-status",
                proposedTitle: "Single or Married",
                subTitle: "Use Facebook's Javascript API to know if your friends are single",
                tags: ["Facebook JavaScript SDK", "JQuery"],
                authorName: "Yash Kumar",
                copyFrom: __dirname + "/facebook-relationship",
                keepAlive: true
        },
        {
                root: "parent",
                framework: "php",
                proposedId: 100006,
                namespace: "facebook",
                namespaceUrl: "friends-locations",
                proposedTitle: "Where do your friends live",
                subTitle: "Use Facebook's Javascript API to see where your friends live",
                tags: ["Facebook JavaScript SDK", "JQuery"],
                authorName: "Yash Kumar",
                copyFrom: __dirname + "/facebook-locations",
                keepAlive: true
        },
        {
                root: "parent",
                framework: "php",
                proposedId: 100007,
                namespace: "facebook",
                namespaceUrl: "friends-hometowns",
                proposedTitle: "Where were your friends born",
                subTitle: "Use Facebook's Javascript API to see your friends hometown",
                tags: ["Facebook JavaScript SDK", "JQuery"],
                authorName: "Yash Kumar",
                copyFrom: __dirname + "/facebook-hometown",
                keepAlive: true
        },
        {
                root: "parent",
                framework: "php",
                proposedId: 100008,
                namespace: "facebook",
                namespaceUrl: "friends-albums",
                proposedTitle: "Facebook 3D Slideshow",
                subTitle: "Use Facebook's Javascript API and RevealJS to create a slideshow of pictures",
                tags: ["Facebook JavaScript SDK", "JQuery", "RevealJS"],
                authorName: "Yash Kumar",
                copyFrom: __dirname + "/facebook-albums",
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
