var http = require('http');
var httpProxy = require('http-proxy');
var config = require("./config");
var URI = require("url");
require("./app");

var bufferRequest = function (obj, cb) {
  var events = [],
      onData, 
      onEnd;

  obj.on('data', onData = function (data, encoding) {
    cb(data, encoding, function(processedData) {
	    events.push(['data', processedData, encoding]);
	});
  });

  obj.on('end', onEnd = function (data, encoding) {
    events.push(['end', data, encoding]);
  });

  return {
    end: function () {
      obj.removeListener('data', onData);
      obj.removeListener('end', onEnd);
    },
    destroy: function () {
      this.end();
     	this.resume = function () {
     	  console.error("Cannot resume buffer after destroying it.");
     	};
     	
     	onData = onEnd = events = obj = null;
    },
    resume: function () {
      this.end();
      for (var i = 0, len = events.length; i < len; ++i) {
        obj.emit.apply(obj, events[i]);
      }
    }
  };
};

var appProxy = new httpProxy.HttpProxy({target: {
	host: config.ip,
	port: config.port - 10,
}});

var accessToken = "AAADnV3jJYoIBAJnqo8eJBCBMMB8GduPsbQ4JZADmvnCZCafIXDj0ubNZCgDM2Pw3wVgYbr8tBlZCNZCVSlKQk6vRM0wi0LuhyZChsbn3dYDwZDZD";

var handleRequest = module.exports = function (req, res) {
		if (req.url.indexOf("?proxy=") < 0) {
			appProxy.proxyRequest(req, res);
			return;
		}    	
	
		var url = (req.url || "").replace("/?proxy=", "");
		var requestURI = URI.parse(url);

		req.url = requestURI.pathname;
		req.headers.host = requestURI.host;	
		console.log(req.url);


		var buffer = bufferRequest(req, function(data, encoding, cb) {
			console.log("here");
			var dataStr = data.toString(encoding);

			if (dataStr.indexOf("token_fb_access") >= 0) {
				dataStr = dataStr.replace("token_fb_access", accessToken);
			}			

			var modifiedBuffer = new Buffer(dataStr, encoding);			
			console.log(modifiedBuffer.toString(encoding));
			cb(modifiedBuffer);
		});

		req.once("end", function() {
		console.log("ended");
		var target = {
                host: requestURI.host,
                port: requestURI.protocol === "https:" ? 443 : 80,
                https: requestURI.protocol === "https:",
		}

		console.log(target);
		var proxy = new httpProxy.HttpProxy({
        	"target": target});
		
		proxy.proxyRequest(req, res, buffer);	
		req.on("end", function() {
			console.log("real end");
		});

		});
};

http.createServer(function (req, res) {
  handleRequest(req, res);
}).listen(config.port, config.ip);
