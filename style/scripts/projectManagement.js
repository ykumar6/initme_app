document.ProjectManagement = function() {
    this.socketVM = null;
    this.socketMain = null;
    this.isVMActive = false;
    this.isActive = false;
    this.events = [];
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
            $("body").removeClass("oauth");
            $("body").addClass("oauth");
            $("body").removeClass("inactive");

        }
        else if (state === "active") {
            self.isActive = true;
            $("body").removeClass("oauth");
	     if (this.isVMActive) {
		   $("#appFrame").attr("src", "http://" + document.appUrl + "/?token=" + window.accessToken || "");
	     }
        }
    };

    this.disconnectProject = function() {
	 var self = this;

        if(self.socketVM) {
            self.socketVM.disconnect();
        }
        if(self.socketMain) {
                self.socketMain.emit("detach", {
                    "projectId" : document.projectId
                });
        }
   };

    this.addEvent = function(evtName, evtCallBack) {
	  this.events.push({"evtName": evtName, "callback": evtCallBack});
	  if (this.socketMain) {
		this.socketMain.on(evtName, evtCallBack);
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
                setTimeout(tryVMConnect, 5000);
            });
            self.socketVM.on("connect", function(err) {
                if(cb)
                    cb();
            });
	     console.log(self.socketVM);
            document.logHandler.addSocket(self.socketVM);
        };
        var tryMainConnect = function() {
	     console.log("trying main connect");
            self.socketMain = io.connect("/", {
                "force new connection" : true,
            });
	     for (var i=0; i<self.events.length; i++) {
		  self.socketMain.on(self.events[i].evtName, self.events[i].callback);
	     }
            self.socketMain.on('connect', function() {
                self.socketMain.emit("attach", {
                    "projectId" : document.projectId
                });
            });
            self.socketMain.on("error", function(err) {
                setTimeout(tryMainConnect, 1000);
            });
        };
	 if (self.socketMain && self.socketMain.socket.connected) {
                self.socketMain.emit("attach", {
                    "projectId" : document.projectId
                });
	 }
	 else {
        	tryMainConnect();
        } 
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
