<?php

  //handle file uploads here
  $method = $_SERVER['REQUEST_METHOD'];
  if ($method == "POST") 
  { 
    if ($_FILES["file"]["error"] > 0) 
    {
      echo "Error upload file<br/>";
    }
    else {      
      move_uploaded_file($_FILES["file"]["tmp_name"], "./" . $_FILES["file"]["name"]);
      $put = $dropbox->putFile("./" . $_FILES["file"]["name"], $_FILES["file"]["name"]);
	  unlink("./" . $_FILES["file"]["name"]);
    }
  }
?>

<img class="logo" src="http://dropbox.com/static/images/logo210.png"/>
<div class="fileBrowser">
  <?php  
     $metaData = $dropbox->metaData('');
     $contents = $metaData["body"]->contents;

     echo '<h2>Your app folder has '. count($contents) . ' files/folders</h3>';
     echo '<ul>';
     foreach ($contents as &$value) {
          echo '<li>'.$value->path . "</li>";
     }
     echo '</ul>';
  ?>
</div>

<div class="uploadForm">
  <h3>Select a file to upload</h3>

  <form action="<?php echo $_SERVER['REQUEST_URI']; ?>" method="post"
          enctype="multipart/form-data">
          <input type="file" name="file" id="file" /> 
            <input class="action" type="submit" name="submit" value="Upload" />
  </form>
</div>
