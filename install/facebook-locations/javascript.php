FB.api('/me/friends?fields=name,location', function(response) {

  	var locations = {};
  
  	//loop through all friends, and bucket them by location
  	for (var i=0; i<response.data.length; i++) {	
		var friend = response.data[i];
      	
      	if (friend.location) {
          	if (locations[friend.location.name]) {
             	locations[friend.location.name].push(friend);
            } else {
            	locations[friend.location.name] = [friend];
           	}
        }
    }
  
  	//sort locations based on count
    var sortable = [];
  	for (var location in locations) {
		sortable.push([location, locations[location].length])
    }
    
  	sortable.sort(function(a, b) {return b[1] - a[1]})
    
    //print friends from top 3 locations
    for (var i=0; i<3; i++) {
      	var location = sortable[i][0];
    	$("h3.top"+i).html(location + " - " + locations[location].length + " friends");
      	for (var j=0; j<locations[location].length; j++) {
        	$("ul.top"+i).append(createFriendItem(locations[location][j]));
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




