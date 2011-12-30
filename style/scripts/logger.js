
var Logger = function() {
    
    this.logBar = $(".logBar");
    this.logIcon = $(".logBar .icon");
    this.logText = $(".logBar .logText");
    this.logTime = $(".logBar .logTime");
    
};

(function() {
    
    var logTimer = null;
    
    this.addSocket = function(socket) {
        var self = this;
        socket.on("logMsg", function(data) {
            self.handleMsg.call(self, data);
        });  
        
    };
    
    this.handleMsg = function(data) {

	 logBar.show();
        logIcon.removeClass("check").removeClass("warn").removeClass("info");
        logIcon.addClass(data.type);
        
        logText.text(data.text);
        logTime.attr("title", date.time);
        logTime.prettyDate();
        
        if (!logTimer) {
            logTimer = setInterval(function() {
                logTime.prettyDate();
            }, 5000);
        }
    };
    
}).call(Logger.prototype);

function prettyDate(time) {
    var date = new Date((time || "").replace(/-/g, "/").replace(/[TZ]/g, " ")), diff = (((new Date()).getTime() - date.getTime()) / 1000), day_diff = Math.floor(diff / 86400);

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

