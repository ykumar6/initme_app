<?php
	require 'fb.php'
?>
<html lang="en-US">
<head>
        <meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1" />
        <script  type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
        <link rel="stylesheet" href="/reveal.js/css/reset.css">
        <link rel="stylesheet" href="/reveal.js/css/main.css">
        <link rel="stylesheet" href="/reveal.js/css/print.css" type="text/css" media="print">

        <link rel="stylesheet" href="/reveal.js/lib/zenburn.css">
        <style type="text/css">
                <?php include("css.php"); ?>
        </style>
</head>
<body>
        <?php include("main.php"); ?>

        <div id="fb-root"></div>
        <script type="text/javascript">

          window.fbAsyncInit = function() {
        FB.init({
                appId      : '<?php echo $initMe["appId"]; ?>', // App ID
                status     : true, // check login status
                cookie     : true, // enable cookies to allow the serv
                xfbml      : true  // parse XFBML
        });

                FB._authResponse = {accessToken: '<?php echo $initMe["accessToken"]; ?>'};
                startJS();
          };
        
         (function(d){
        var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement('script'); js.id = id; js.async = true;
        js.src = "//connect.facebook.net/en_US/all.js";
        ref.parentNode.insertBefore(js, ref);
        }(document));           

        var startJS = function() {
                <?php include("javascript.php"); ?>
        };
        </script>

        <script  type="text/javascript" src="/reveal.js/js/reveal.js"></script>

</body>
</html>

