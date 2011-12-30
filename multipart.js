

var Multipart = function() {
	this.boundary =  Math.floor(Math.random()*1000000);
};

(function() {

	this.EncodeFieldPart = function(name,value) {
    		var return_part = "--" + this.boundary + "\r\n";
    		return_part += "Content-Disposition: form-data; name=\"" + name + "\"\r\n\r\n";
    		return_part += value + "\r\n";
    		return return_part;
	};

	this.EncodeFilePart = function(type, name, filename) {
    		var return_part = "--" + this.boundary + "\r\n";
    		return_part += "Content-Disposition: form-data; name=\"" + name + "\"; filename=\"" + filename + "\"\r\n";
    		return_part += "Content-Type: " + type + "\r\n\r\n";
    		return return_part;
	};



}).call(Multipart.prototype);


module.exports = Multipart;
