<?php   
    
  // This twilio example using init.me's Twilio Sandbox. 
  // To use your own account, replace the vars below
  
  // Twilio API credentials here
  $accountSid = 'initme_twilio_accountSid';
  $authToken  = 'initme_twilio_authToken';
   
  // Twilio APP sid
  $appSid     = 'initme_twilio_appSid';
   
  $capability = new Services_Twilio_Capability($accountSid, $authToken);
  $capability->allowClientOutgoing($appSid);
  $token = $capability->generateToken();
?>

<script type="text/javascript">
  Twilio.Device.setup("<?php echo $token; ?>");
  
  Twilio.Device.ready(function (device) {
    $("#log").text("Ready");
  });
  
  Twilio.Device.error(function (error) {
    $("#log").text("Error: " + error.message);
  });
  
  Twilio.Device.connect(function (conn) {
    $("#log").text("Successfully established call");
  });
  
  Twilio.Device.disconnect(function (conn) {
    $("#log").text("Call ended");
  });
  
  function call() {
    // These parameters are passed to TwiML to establish the call
    // You can only make outgoing calls from your verified phone number
    
    params = {"PhoneNumber": $("#number").val(),
		"CallerId": "<?= $UserVerifiedPhone ?>"		
	};
    Twilio.Device.connect(params);
  }
  
  function hangup() {
    Twilio.Device.disconnectAll();
  }
</script>
 
<button class="call" onclick="call();">
      Call
</button>

<button class="hangup" onclick="hangup();">
  Hangup
</button>


<input type="text" id="number" name="number"
  placeholder="Enter a phone number to call"/>

<div id="log">Loading pigeons...</div>




