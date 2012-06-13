var fs = require("fs");
var async = require("async");
var config = require("./config");

var frameworkFiles = {
	"php" : ["main.php", "css.php", "javascript.php"]
}

var badgeMeta = {
	"newbie": {
		"title": "Newbie Programmer",
		"description": "Running and editing code is easy!",
		"image": "images/badges/newUser.png"
	},
	"facebook": {
		"title": "Facebook Developer",
		"description": "Running and editing facebook code is easy!",
		"image": "images/badges/fb.png"
	},
	"jquery": {
		"title": "JQuery Developer",
		"description": "Running and editing jquery code is easy!",
		"image": "images/badges/jquery.png"
	}
}

module.exports = {
	
	serveBadge: function(badgeName, req, res) {
		fs.readFile(__dirname + "/view/badge.html", "utf8", function(err, index) {
			index = index.replace(/{googleAnalyticsId}/mig, config.googleAnalyticsId);
			index = index.replace(/{facebookId}/mig, config.facebookId);
			index = index.replace(/{mixpanelToken}/mig, config.mixpanelToken);
			index = index.replace(/{optimizelyId}/mig, config.optimizelyId);
			index = index.replace(/{optimizelyId}/mig, config.optimizelyId);
			index = index.replace(/{userBucket}/mig, req.session.bucket);
			
			index = index.replace(/{projDomain}/mig, config.projDomain);
			index = index.replace(/{namespace}/mig, config.facebook.namespace);
			
			index = index.replace(/{badgeTitle}/mig, (badgeMeta[badgeName] || {}).title);
			index = index.replace(/{badgeDescription}/mig, (badgeMeta[badgeName] || {} ).description);
			index = index.replace(/{badgeUrl}/mig, "http://" + config.projDomain + "/badge/" + badgeName + "?betaCode=beta_1912");
			index = index.replace(/{badgeImage}/mig, "http://" + config.projDomain + "/" + (badgeMeta[badgeName] || {}).image + "?betaCode=beta_1912");
			
			res.end(index);
		});
	},

	servePage : function(pageName, req, res) {
		fs.readFile(__dirname + "/view/" + pageName, "utf8", function(err, index) {
			index = index.replace(/{googleAnalyticsId}/mig, config.googleAnalyticsId);
			index = index.replace(/{facebookId}/mig, config.facebookId);
			index = index.replace(/{mixpanelToken}/mig, config.mixpanelToken);
			index = index.replace(/{optimizelyId}/mig, config.optimizelyId);
			index = index.replace(/{optimizelyId}/mig, config.optimizelyId);
			index = index.replace(/{userBucket}/mig, req.session.bucket);
			
			res.end(index);
		});
	},

	getIndex : function(proj, isOwner, req, callback) {

		var file = "editor.html";
		if(req.url.indexOf("embed") >= 0) {
			file = "embed.html";
		}
		if (req.session && req.session.isBetaUser) {
			file = "editor_enabled.html";
		}

		fs.readFile(__dirname + "/view/" + file, "utf8", function(err, index) {

			if(err) {
				callback(err);
				return;
			}

			index = index.toString();
			index = index.replace(/{googleAnalyticsId}/mig, config.googleAnalyticsId);
			index = index.replace(/{mixpanelToken}/mig, config.mixpanelToken);
			index = index.replace(/{optimizelyId}/mig, config.optimizelyId);
			index = index.replace(/{userBucket}/mig, req.session.bucket);

			index = index.replace(/{projectUrl}/mig, "http://" + config.projDomain + "/" + proj.getProjectUrl() + "?betaCode=beta_1912");
			index = index.replace(/{projDomain}/mig, config.projDomain);
			index = index.replace(/{namespace}/mig, config.facebook.namespace);


			index = index.replace(/{projId}/mig, proj.getId());
			index = index.replace(/{appUrl}/mig, proj.getUrl());
			index = index.replace(/{static}/mig, "http://" + config.appDomain);
			index = index.replace(/{isOwner}/mig, isOwner ? "true" : "false");
			index = index.replace(/{title}/mig, proj.getTitle());
			index = index.replace(/{subTitle}/mig, proj.model.subTitle || "");
			index = index.replace(/{authorName}/mig, proj.getAuthorName());
				
			var badges = [];
			console.log(req.session);
			try {
				badges = JSON.parse(req.session.badges);
			}
			catch (e) {
				req.session.badges = JSON.stringify([]);
			}
			index = index.replace(/{badges}/mig, (badges || []).join(","));
			
			index = index.replace(/{tags}/mig, (proj.model.tags || []).join(","));
			index = index.replace(/{login}/mig, req.session.user ? "LOGOUT" : "LOGIN");
			index = index.replace(/{facebookId}/mig, config.facebookId);

			var files = ["main.php", "css.php", "javascript.php"];
			console.log(proj.model.tags);
			if(proj.model.tags.indexOf("twilio") >= 0) {
				files.push("additional.php");
				index = index.replace(/{additionalMode}/mig, "php");
				index = index.replace(/{additionalName}/mig, "TwiML");
				index = index.replace(/{challengeClass}/mig, "twilio");
				index = index.replace(/{twilioSid}/mig, proj.twilioSid);

			} else {
				index = index.replace(/{additionalMode}/mig, "javascript");
				index = index.replace(/{additionalName}/mig, "JavaScript");
				index = index.replace(/{additionalStyle}/mig, "display:none;");
			}
			if(proj.model.tags.indexOf("twiml") >= 0) {
				index = index.replace(/{jsStyle}/mig, "display:none;");
				index = index.replace(/{cssStyle}/mig, "display:none;");

			}

			if(proj.model.tags.indexOf("facebook") >= 0) {
				index = index.replace(/{challengeClass}/mig, "facebook_oauth");
			} else if(proj.model.tags.indexOf("dropbox") >= 0) {
				index = index.replace(/{challengeClass}/mig, "dropbox");
			}

			var getFile = function(fileName, callback) {
				fs.readFile(proj.getPath() + "/" + fileName, function(err, fileData) {
					if(!err) {
						index = index.replace(new RegExp("{" + fileName + "}", "mig"), fileData.toString());
					}
					callback(err, fileData);
				});
			};

			async.forEach(files, getFile, function(err) {
				callback(err, index);
			})
		});
	},

	getFile : function(proj, isOwner, user, fileName, callback) {
		fs.readFile(__dirname + "/view/file.html", "utf8", function(err, index) {

			if(err) {
				callback(err);
				return;
			}

			index = index.toString();
			index = index.replace(/{projId}/mig, proj.getId());
			index = index.replace(/{appUrl}/mig, proj.getUrl());
			index = index.replace(/{static}/mig, "http://" + config.appDomain);
			index = index.replace(/{isOwner}/mig, isOwner ? "true" : "false");
			index = index.replace(/{title}/mig, proj.getTitle());
			index = index.replace(/{subTitle}/mig, proj.model.subTitle || "");
			index = index.replace(/{authorName}/mig, proj.getAuthorName());
			index = index.replace(/{tags}/mig, (proj.model.tags || []).join(","));
			index = index.replace(/{login}/mig, user ? "LOGOUT" : "LOGIN");
			index = index.replace(/{facebookId}/mig, config.facebookId);
			index = index.replace(/{fileName}/mig, fileName);

			if(fileName === "main" || fileName === "additional") {
				index = index.replace(/{mode}/mig, "application/x-httpd-php");
			} else {
				index = index.replace(/{mode}/mig, fileName);
			}

			fs.readFile(proj.getPath() + "/" + fileName + ".php", function(err, fileData) {
				if(!err) {
					index = index.replace(new RegExp("{fileData}", "mig"), fileData.toString());
				}
				callback(err, index);
			});
		});
	}
}
