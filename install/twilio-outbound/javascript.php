  Twilio.Device.setup("<?php echo $token; ?>");
  
  Twilio.Device.ready(function (device) {
    $("#log").text("Ready");
  });
  
  Twilio.Device.error(function (error) {
    $("#log").text("Error: " + error.message);
  });ff
  
  Twilio.Device.connect(function (conn) {
    $("#log").text("Successfully established call");
  });
  
  Twilio.Device.disconnect(function (conn) {
    $("#log").text("Call ended");
  });
  
  function call() {
    // get the phone number to connect the call to
    params = {"PhoneNumber": $("#number").val(),
		"CallerId": "<?= $UserVerifiedPhone ?>"		
	};
    Twilio.Device.connect(params);
  }
  
  function hangup() {
    Twilio.Device.disconnectAll();
  }
