var fs = require("fs");
var async = require("async");


var frameworkFiles = {
    "php": ["index.php", "css.php", "javascript.php"]
}


module.exports = {
    
    getIndex: function(path, framework, projId, callback) {        
        fs.readFile(__dirname + "/view/editor.html", "utf8", function(err, index) {
            
            if (err) {
                callback(err);
                return;
            }
            
            index = index.toString();
            index = index.replace(/{projId}/mig, projId);
            
            var getFile = function(fileName, callback) {
                  fs.readFile(path + "/" + fileName, function(err, fileData) {
                        if (!err) {
                            index = index.replace(new RegExp("{" + fileName + "}", "mig"), fileData.toString());   
                        }                        
                        callback(err, fileData); 
                  });
            };
            
            async.forEach(frameworkFiles[framework], getFile, function(err) {
                callback(err, index);
            })
            
        });
    }
}
