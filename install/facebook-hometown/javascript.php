FB.api('/me/friends?fields=name,hometown', function(response) {

  	var hometowns = {};
  
  	//loop through all friends, and bucket them by hometown
  	for (var i=0; i<response.data.length; i++) {	
		var friend = response.data[i];
      	
      	if (friend.hometown) {
          	if (hometowns[friend.hometown.name]) {
             	hometowns[friend.hometown.name].push(friend);
            } else {
            	hometowns[friend.hometown.name] = [friend];
           	}
        }
    }
  
  	//sort hometowns based on count
    var sortable = [];
  	for (var home in hometowns) {
		sortable.push([home, hometowns[home].length])
    }
    
  	sortable.sort(function(a, b) {return b[1] - a[1]})
  
    console.log(sortable);
  
    //print friends from top 3 hometowns
    for (var i=0; i<3; i++) {
      	var hometown = sortable[i][0];
    	$("h3.top"+i).html(hometown + " - " + hometowns[hometown].length + " friends");
      	for (var j=0; j<hometowns[hometown].length; j++) {
        	$("ul.top"+i).append(createFriendItem(hometowns[hometown][j]));
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
