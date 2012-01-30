var fs = require("fs");
var async = require("async");
var config = require("./config");

var frameworkFiles = {
    "php": ["main.php", "css.php", "javascript.php"]
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
             index = index.replace(/{oauth}/mig, proj.model.oauth || ""); 
   	     index = index.replace(/{login}/mig, user ? "LOGOUT": "LOGIN");            
   	     index = index.replace(/{facebookId}/mig, config.facebookId);            


            var getFile = function(fileName, callback) {
                  fs.readFile(proj.getPath() + "/" + fileName, function(err, fileData) {
                        if (!err) {
                            index = index.replace(new RegExp("{" + fileName + "}", "mig"), fileData.toString());   
                        }                        
                        callback(err, fileData); 
                  });
            };
            
            async.forEach(frameworkFiles[proj.getFramework()], getFile, function(err) {
                callback(err, index);
            })
            
        });
    }
}
