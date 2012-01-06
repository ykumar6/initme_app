
var Logger = function(uiPane) {
    
    var self = this;
    this.uiPane = uiPane;
    this.logBar = $(".logBar");
    this.logIcon = $(".logBar .icon");
    this.logText = $(".logBar .logText");
    this.logTime = $(".logBar .logTime");

    this._isConnecting();
    
};

(function() {
    
    var logTimer = null;

    this._isConnecting = function() {
    	this.handleMsg({
		type: "info",
		text: "Trying to connect with virtual machine",
		time: new Date(),
		isNow: true
    	});

	if (!$("body").hasClass("inactive"))
		$("body").addClass("inactive");
    };

    this.clear = function() {
	 this.uiPane.hide("south");
    };
    
    this.addSocket = function(socket) {
        var self = this;

	 console.log(socket);

	 socket.on("connect", function() {
		console.log("connected");
		$("body").removeClass("inactive");
		$("#appFrame").attr("src", "http://" + document.appUrl);
    		self.handleMsg({
			type: "check",
			text: "Successfully activated your virtual machine",
			time: new Date()
    		});
	 });
	 socket.on("reconnecting", function() {
		self._isConnecting();
	 });
	 socket.on("error", function() {
		self._isConnecting();

	 });
	 socket.on("disconnect", function() {
		self._isConnecting();
	 });
        socket.on("logMsg", function(data) {
	     console.log(data);
            self.handleMsg.call(self, data);
        });  
    };
    
    this.handleMsg = function(data) {

	 var self = this;
	 
   	 if (this.msgTimer) {
		clearTimeout(this.msgTimer);
	 }
	 if (data.type !== "error" && !data.isNow) {
	 	this.msgTimer = setTimeout(function() {
			self.uiPane.hide("south");
	 	}, 3000);
	 }	
	 this.uiPane.show("south");
        this.logIcon.removeClass("check").removeClass("warn").removeClass("info");
        this.logIcon.addClass(data.type);
        
        this.logText.text(data.text);
        this.logTime.attr("title", data.time || (new Date()));

	 if (data.isNow) {
		if (this.logTimer) {
			clearInterval(this.logTimer);
			this.logTimer = null;
		}
		this.logTime.text("right now");
	 }
	 else {
        	this.logTime.prettyDate();
        	if (!this.logTimer) {
            		this.logTimer = setInterval(function() {
               		self.logTime.prettyDate();
            		}, 5000);
        	}
	 }
        

    };
    
}).call(Logger.prototype);

function prettyDate(time) {
    var date = new Date(time || ""), diff = (((new Date()).getTime() - date.getTime()) / 1000), day_diff = Math.floor(diff / 86400);
	
    if(isNaN(day_diff) || day_diff < 0 || day_diff >= 31)
        return;

    return day_diff == 0 && (diff < 60 && "just now" || diff < 120 && "1 minute ago" || diff < 3600 && Math.floor(diff / 60) + " minutes ago" || diff < 7200 && "1 hour ago" || diff < 86400 && Math.floor(diff / 3600) + " hours ago") || day_diff == 1 && "Yesterday" || day_diff < 7 && day_diff + " days ago" || day_diff < 31 && Math.ceil(day_diff / 7) + " weeks ago";
}

// If jQuery is included in the page, adds a jQuery plugin to handle it as well
if( typeof jQuery != "undefined")
    jQuery.fn.prettyDate = function() {
        return this.each(function() {
            var date = prettyDate(this.title);
            if(date)
                jQuery(this).text(date);
        });
    };

