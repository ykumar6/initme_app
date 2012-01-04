var fs = require("fs");
var async = require("async");


var frameworkFiles = {
    "php": ["main.php", "css.php", "javascript.php"]
}


module.exports = {
    
    getIndex: function(proj, isOwner, callback) {        
        fs.readFile(__dirname + "/view/editor.html", "utf8", function(err, index) {
            
            if (err) {
                callback(err);
                return;
            }
            
            index = index.toString();
            index = index.replace(/{projId}/mig, proj.getId());
            index = index.replace(/{appUrl}/mig, proj.getUrl());
            index = index.replace(/{static}/mig, "http://init.me");
	     index = index.replace(/{isOwner}/mig, isOwner ? "true" : "false");            

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
