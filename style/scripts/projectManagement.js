document.ProjectManagement = function() {
    this.socketVM = null;
    this.socketMain = null;
    this.isVMActive = false;
    this.isActive = false;
};


(function() {    
    
    
    this.setState = function(state) {
	 var self = this;
        if (state === "vmInactive") {
            this.isVMActive = false;
	
	     if (this.isActive) {
            	$("body").removeClass("inactive");
            	$("body").removeClass("oauth");
            	$("body").addClass("inactive");
	     }
        } 
        else if (state === "vmActive") {
    	     this.isVMActive = true;
            $("body").removeClass("inactive");
        } 
        else if (state === "oauth") {
            $("body").removeClass("inactive");
            $("body").removeClass("oauth");
            $("body").addClass("oauth");
        }
        else if (state === "active") {
            self.isActive = true;
            $("body").removeClass("oauth");
        }
    };

    this.disconnectProject = function() {
	 var self = this;

        if(self.socketVM) {
            self.socketVM.disconnect();
        }
        if(self.socketMain) {
            self.socketMain.disconnect();
        }
   };

    this.loadProject = function(cb) {
	 var self = this;

        var tryVMConnect = function() {
            self.socketVM = io.connect("/", {
                resource : "" + document.projectId + "-portal/socket.io",
                "force new connection" : true
            });

            self.socketVM.on("error", function(err) {
                setTimeout(tryVMConnect, 1000);
            });
            self.socketVM.on("connect", function(err) {
                if(cb)
                    cb();
            });
            document.logHandler.addSocket(self.socketVM);
        };
        var tryMainConnect = function() {
            socketMain = io.connect("/", {
                "force new connection" : true,
            });
            socketMain.on('connect', function() {
                socketMain.emit("attach", {
                    "projectId" : document.projectId
                });
            });
            socketMain.on("error", function(err) {
                setTimeout(tryMainConnect, 1000);
            });
        };
        tryMainConnect();
        tryVMConnect();
    };

    this.createProject = function(cb) {
	 var self = this;

        this.disconnectProject();
        $.ajax({
            type : "GET",
            url : "http://" + document.domain + "/fork/" + document.projectId + "?ts=" + (new Date()).getTime(),
            dataType : "json",
            success : function(data) {
                document.isOwner = true
                document.projectId = data.projectId;
                document.appUrl = data.appUrl;
                console.log("loading project");
                self.loadProject(cb);
                //reload project connections
            },
            error : function() {
                document.logHandler.handleMsg({
                    type : "warn",
                    text : "Unable to run your code. Please try again",
                    time : new Date()
                });
            }
        });
    }

}).call(document.ProjectManagement.prototype);
