var fs = require("fs");
var async = require("async");
var config = require("./config");

var frameworkFiles = {
    "php": ["main.php", "css.php", "javascript.php"]
}

module.exports = {
    
    getIndex: function(proj, isOwner, user, callback) {        

	 var file = "editor.html";
	 if (proj.model.tags.indexOf("twilio") >= 0) {
		file = "ide.html";
	 }
	 if (proj.getId() === "100011") {
		file = "embed.html";
	 }
	 
        fs.readFile(__dirname + "/view/" + file, "utf8", function(err, index) {
            
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

	     var files = ["main.php", "css.php", "javascript.php"];
            console.log(proj.model.tags);
            if (proj.model.tags.indexOf("twilio") >= 0) {
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

            if (proj.model.tags.indexOf("facebook") >= 0) {
			index = index.replace(/{challengeClass}/mig, "facebook_oauth");            
            }
	     else if (proj.model.tags.indexOf("dropbox") >= 0) {
			index = index.replace(/{challengeClass}/mig, "dropbox");            
            }

            var getFile = function(fileName, callback) {
                  fs.readFile(proj.getPath() + "/" + fileName, function(err, fileData) {
                        if (!err) {
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

    getFile: function(proj, isOwner, user, fileName, callback) {        
        fs.readFile(__dirname + "/view/file.html", "utf8", function(err, index) {
            
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
	     index = index.replace(/{fileName}/mig, fileName);   
	
	     if (fileName === "main" || fileName === "additional") {
			index = index.replace(/{mode}/mig, "application/x-httpd-php"); 
	     } 
	     else {
			index = index.replace(/{mode}/mig, fileName); 
	     }

             fs.readFile(proj.getPath() + "/" + fileName + ".php", function(err, fileData) {
                        if (!err) {
                            index = index.replace(new RegExp("{fileData}", "mig"), fileData.toString());   
                        }                        
                        callback(err, index); 
             });            
        });
    }

}
