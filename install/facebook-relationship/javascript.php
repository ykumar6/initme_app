FB.api('/me/friends?fields=name,relationship_status', function(response) {

  var relationship_types = {};
  
  //loop through all friends
  for (var i=0; i<response.data.length; i++) {	
	
    	var friend = response.data[i];
    
    	//is this friend single? They should mingle!
    	if (friend.relationship_status && friend.relationship_status === "Single") {
      		$("#single").append(createFriendItem(friend));
    	}
    
    	//is this friend in love?
    	if (friend.relationship_status && friend.relationship_status === "In a relationship") {
      		$("#relationship").append(createFriendItem(friend));
    	}
        
    	//is this friend married? Silly them
    	if (friend.relationship_status && friend.relationship_status === "Married") {
      		$("#married").append(createFriendItem(friend));
    	}
  }
});

//create HTML String
function createFriendItem(friend) {
  
  	var htmlString = "";
  
    htmlString += '<li class="item">';
    htmlString += '<div class="pic">';
    htmlString += '<img src="https://graph.facebook.com/' + friend.id  + '/picture"/>';
    htmlString += '</div>';
    htmlString += '<div class="picName">' + friend.name + '</div>'; 
  	htmlString += '</li>';
  
  	return htmlString
} 


