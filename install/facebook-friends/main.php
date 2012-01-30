<div class="profile">
  <?php
  
    $facebook = new Facebook(array(
      'appId'  => $initMe["appId"],
      'secret' => $initMe["appSecret"],
    ));

    $facebook->setAccessToken($initMe["accessToken"]);
    $user = $facebook->getUser();
  
  
    if ($user) {
        $user_profile = $facebook->api('/me');
        $friends = $facebook->api('/me/friends');
      
        echo '<ul>';
        foreach ($friends["data"] as $value) {
            echo '<li>';
            echo '<div class="pic">';
            echo '<img src="https://graph.facebook.com/' . $value["id"] . '/picture"/>';
            echo '</div>';
            echo '<div class="picName">'.$value["name"].'</div>'; 
            echo '</li>';
        }
        echo '</ul>';
    }
  ?>
</div>





