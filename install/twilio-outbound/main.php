<?php   

  // put your Twilio API credentials here
  $accountSid = 'initme_twilio_accountSid';
  $authToken  = 'initme_twilio_authToken';
  
  // put your Twilio Application Sid here
  $appSid     = 'initme_twilio_appSid';
   
  $capability = new Services_Twilio_Capability($accountSid, $authToken);
  $capability->allowClientOutgoing($appSid);
  $token = $capability->generateToken();
?>

<button class="call" onclick="call();">
      Call
</button>

<button class="hangup" onclick="hangup();">
  Hangup
</button>


<input type="text" id="number" name="number"
  placeholder="Enter a phone number to call"/>

<div id="log">Loading pigeons...</div>
