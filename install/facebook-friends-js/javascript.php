FB.api('/me/friends', function(response) {
  
  	var friends = response.data;
    var htmlString = '';
        	
  	for (var i=0; i<friends.length; i++) {
      		var friendData = friends[i];
      
  			htmlString += '<li>';
            htmlString += '<div class="pic">';
            htmlString += '<img src="https://graph.facebook.com/' + friendData.id  + '/picture"/>';
            htmlString += '</div>';
            htmlString += '<div class="picName">' + friendData.name + '</div>'; 
            htmlString += '</li>';
  	}
  
  	$("#friendsList").append(htmlString);
});
