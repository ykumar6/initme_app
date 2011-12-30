var spawn = require('child_process').spawn;
var sys = require("sys");
var EventEmitter = require("events").EventEmitter;

var zip = function(dir, bufferList, timestamp) {
    EventEmitter.call(this);

    var _self = this;
    var zipProcess = spawn('zip', ['-rj', '-', dir]);
    
    var file_contents = '';
    zipProcess.stdout.setEncoding('binary')
    zipProcess.stdout.on('data', function (data) {
	file_contents += data;
    });

    zipProcess.stderr.on('data', function (data) {
        //_self.emit("error", data);
    });

    // End the response on zip exit
    zipProcess.on('exit', function (code) {
	 bufferList.push(new Buffer(file_contents, "binary"));
        _self.emit("complete");
    });
}

sys.inherits(zip, EventEmitter);

module.exports = zip;
