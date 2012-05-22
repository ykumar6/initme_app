FB.api('/me/friends', {fields: 'name,id,birthday'}, function(response) {
  
  	var friends = response.data;
    var htmlString = '';
  
  	var one_day=1000*60*60*24; //number of seconds in a day
        	
  	for (var i=0; i<friends.length; i++) {
      		var friendData = friends[i];

			var birthday = new Date(friendData.birthday);
			var currentdate = new Date();
     
      		//update birthday year to this year
			birthday.setYear(currentdate.getFullYear());

			var daysToBirthday = (birthday.getTime() - currentdate.getTime()) / one_day;
      		
      		//birthdays in next 30 days
      		if (daysToBirthday > 0 && daysToBirthday < 7) {
  				htmlString += '<li>';
            	htmlString += '<div class="pic">';
            	htmlString += '<img src="https://graph.facebook.com/' + friendData.id  + '/picture"/>';
            	htmlString += '</div>';
            	htmlString += '<div class="picName">' + friendData.name + ' - ' + Math.round(daysToBirthday) +' days</div>'; 
           	 	htmlString += '</li>'
      		}
  	}
  
  	$("#birthdayList").append(htmlString);
});


