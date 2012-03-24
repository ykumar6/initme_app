<?php
  header('Content-type: text/xml');
  $callerId =  "+1".$_REQUEST['CallerId'];
  $number = "+1".$_REQUEST['PhoneNumber']; 
?>
 
<Response>
	<Say>Dialing phone number</Say>
    <Dial callerId="<?php echo $callerId ?>">
         <?php echo $number ?>
	</Dial>
</Response>