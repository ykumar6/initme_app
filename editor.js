var fs = require("fs");
var async = require("async");
var config = require("./config");

var frameworkFiles = {
    "php": ["main.php", "css.php", "additional.php"]
}

module.exports = {
    
    getIndex: function(proj, isOwner, user, callback) {        
        fs.readFile(__dirname + "/view/editor.html", "utf8", function(err, index) {
            
            if (err) {
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
   	     index = index.replace(/{login}/mig, user ? "LOGOUT": "LOGIN");            
   	     index = index.replace(/{facebookId}/mig, config.facebookId);            
            if (proj.model.tags.indexOf("twilio") >= 0) {
			index = index.replace(/{additionalMode}/mig, "php");            
			index = index.replace(/{additionalName}/mig, "TwiML");   
			index = index.replace(/{challengeClass}/mig, "twilio");            
            } else {
			index = index.replace(/{additionalMode}/mig, "javascript");            
			index = index.replace(/{additionalName}/mig, "JavaScript");   
	     }

            if (proj.model.tags.indexOf("facebook") >= 0) {
			index = index.replace(/{challengeClass}/mig, "facebook_oauth");            
            }

            var getFile = function(fileName, callback) {
                  fs.readFile(proj.getPath() + "/" + fileName, function(err, fileData) {
                        if (!err) {
                            index = index.replace(new RegExp("{" + fileName + "}", "mig"), fileData.toString());   
                        }                        
                        callback(err, fileData); 
                  });
            };
            
			var files = frameworkFiles[proj.getFramework()];
			
            async.forEach(frameworkFiles[proj.getFramework()], getFile, function(err) {
                callback(err, index);
            })

            
        });
    }
}
