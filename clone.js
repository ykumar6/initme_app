var spawn = require('child_process').spawn;
var sys = require("util");
var EventEmitter = require("events").EventEmitter;

var clone = function(src, dest) {
    EventEmitter.call(this);

    var _self = this;
    var cpProcess = spawn('cp', ['-r', src, dest]);
    
    cpProcess.stderr.on('data', function (data) {
	 console.log(data.toString());
        _self.emit("error", data);
    });

    // End the response on zip exit
    cpProcess.on('exit', function (code) {
        _self.emit("complete", code);
    });
}

sys.inherits(clone, EventEmitter);

module.exports = clone;
