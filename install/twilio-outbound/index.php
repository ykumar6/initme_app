<?php
	$UserVerifiedPhone = '';
	if (isset($_GET['callerId'])) {
		$UserVerifiedPhone = $_GET['callerId'];
	}
?>

<html lang="en-US">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1" />
	<script  type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
   <script type="text/javascript"
      src="http://static.twilio.com/libs/twiliojs/1.0/twilio.min.js"></script>
	<style type="text/css">
		<?php include("css.php"); ?>
	</style>
</head>
<body>
    <?php include("twilio-php/Services/Twilio/Capability.php"); ?>
	<?php include("main.php"); ?>
</body>
</html>
	
