<?php
  header('Content-type: text/xml');
  $callerId =  $_REQUEST['CallerId'];
  $number = $_REQUEST['PhoneNumber']; 
?>
 
<Response>
	<Say>Dialing phone number, this is so awesome</Say>
    <Dial callerId="<?php echo $callerId ?>">
         <?php echo $number ?>
	</Dial>
</Response>

