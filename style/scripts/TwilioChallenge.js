document.TwilioChallenge = function(project) {

	var self = this;

	$("body").trigger("challengeStart");
	$(".phoneBox input").focus();


	$(".phoneBox .button").click(function() {
		var phoneNumber = $(".phoneBox input").val();
		phoneNumber = phoneNumber.replace(".", "");
		phoneNumber = phoneNumber.replace("-", "");
		phoneNumber = phoneNumber.replace(" ", "");
		project.socketMain.emit("twilioVerify", phoneNumber);
		self.phoneNumber = phoneNumber;
	});

	project.addEvent("twilioAccount", function(data) {
		window.accessToken = data + "&callerId=" + self.phoneNumber;
	});
	project.addEvent("outgoingVerifyCode", function(data) {
		$(".verifyCodeNumber").text(data);
		$(".twilioVerify").addClass("askCode");
	});

	$(".verifyCode .button").click(function() {
		$(".twilioVerify").removeClass("askCode");
		$("body").trigger("challengeComplete");
		$('#myModal').modal('hide')
	});
};

(function() {



}).call(document.TwilioChallenge.prototype);
