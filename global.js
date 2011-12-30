var CloudFoundry = require("./cloudfoundry");
var cf = new CloudFoundry();

module.exports = {
	cloudFoundry: cf,
	find: function(appName, appArray) {
		for (var i=0; i<appArray.length; i++) {
			if (appName == appArray[i].getId()) {
				return i;
			}
		}
		return -1;
	}
}