<?php 
	$parts = explode(".", $_SERVER['HTTP_HOST']);
	$domainName = $parts[1] . "." . $parts[2];
	
	$referrer = $_SERVER['HTTP_REFERER'];
	$iframe = $_GET['iframe'];
	
	if (!isset($iframe))
	{
		header('Content-Type: text/xml');
		include("main.php");
	}
	else {
?>
<html lang="en-US">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1" />
    <link rel="stylesheet" href="http://<?php echo $domainName?>/scripts/codemirror/lib/codemirror.css">
    <script src="http://<?php echo $domainName?>/scripts/codemirror/lib/codemirror.js"></script>
    <script src="http://<?php echo $domainName?>/scripts/codemirror/mode/xml/xml.js"></script>
    <script src="http://<?php echo $domainName?>/scripts/codemirror/lib/util/runmode.js"></script>
	<style type="text/css">	
	</style>
</head>

<body id="body">
<pre id="output" class="cm-s-default"></pre>
<textarea id="code" name="code" style="display:none">
	<?php include("main.php"); ?>
</textarea>
    <script>
 CodeMirror.runMode(document.getElementById("code").value, "xml",
                     document.getElementById("output"));
    </script>
</body>
</html>
<?php
	}
?>
