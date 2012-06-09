FB.api('/me/albums',  function(res) {
  var albums = res.data;
  var firstPicAdded = false;
  
  for (var i=0; i<albums.length; i++) {
    
    FB.api('/'+albums[i].id + '/photos', function(res) {
      
      	var pictures = res.data;
		for (var j=0; j<pictures.length; j++) {
        	if (pictures[j].source) {
          		$(".slides").append("<section><img src='" + pictures[j].source + "'></section>");

              	if (!firstPicAdded) {
                	firstPicAdded = true;
                	doInit();  	
              	}
            }
      	}
    });
  }
});

function doInit() {
  	$($("img")[0]).load(function() {
      	$("h1.mainText").html("Use Arrow keys to navigate album");
    	Reveal.initialize();
  	});
}


