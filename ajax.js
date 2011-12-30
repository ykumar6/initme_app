var http = require('http');
var config = require("./config");
var client = http.createClient(80, config.cfhost);

module.exports = {
	
	jsonPost: function(args) {
		
		var dataBody = args.data ? JSON.stringify(args.data) : "";
		var headers = {
		    'host': config.cfhost,
		    'Content-Type': 'application/json',
		    'Accept': "application/json",
		    'Content-Length': dataBody.length
		};
            
		if (args.token) {
			headers["AUTHORIZATION"] = args.token;
		}
		if (args.proxy) {
			headers["PROXY-USER"] = args.proxy;
		}
		
		var request = client.request(args.cmd || 'POST', args.path, headers);
		
		request.on('response', function(response) {
			var jsonData = "";
		  	response.on('data', function(chunk) {
		   		jsonData += chunk.toString();
		  	});
		  	response.on('error', function(err) {
		  		args.onResponse(err);
		  	});
			response.on('end', function() {
			    var msgHash;
                try {
                    msgHash = JSON.parse(jsonData);
                }
                catch (err) {
                    msgHash = jsonData;
                }
				args.onResponse(null, {"data": msgHash, "status": response.statusCode});
			});
		});
		
		if (dataBody) {
		    request.write(dataBody);
		}
		request.end();
	},
	
    uploadBuffer: function(args) {

         var contentLen = 0;
            for (var i=0; i<args.bufferList.length; i++) {
        	contentLen += args.bufferList[i].length;
         }

        var headers = {
            'host': config.cfhost,
	        'Content-Type': 'multipart/form-data; boundary=' + args.boundary,
            'Content-Length': contentLen        
	    };

        if (args.token) {
            headers["AUTHORIZATION"] = args.token;
        }
        if (args.proxy) {
            headers["PROXY-USER"] = args.proxy;
        }
        
        var request = client.request('post', args.path, headers);
        request.on('response', function(response) {
            var jsonData;
            response.on('error', function(err) {
                args.onResponse(err);
            });
            response.on('end', function() {
		  console.log(response.statusCode);
                args.onResponse(null, response.statusCode);
            });
        });
        for (i=0; i<args.bufferList.length; i++) {
		      request.write(args.bufferList[i]);
	    }
      	request.end();
    }
}
