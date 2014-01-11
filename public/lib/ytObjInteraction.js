var ytplayer;
var progContainer;
var progBar;
var playerStarted = false;
/*function onYouTubeIframeAPIReady() {
  console.log('inside the jquery load event!');
      player = new YT.Player('sharePlayer',{
        events: {
            'onReady': function(e){ e.target.playVideo(); }
        }
    });
  console.log(player);
}*/

function playerLoaded()
{
  ytplayer = new YT.Player('sharePlayer');  
  ytplayer.addEventListener("onStateChange", "onPlayerStateChange");
	ytplayer.addEventListener("onReady", "onPlayerReady"); 
	ytplayer.addEventListener("onError", "onPlayerError"); 
	setInterval(updatePlayerInfo, 250);
	progContainer = document.getElementById('progContainer');
	progBar = document.getElementById('progBar');
  
	progContainer.addEventListener('click', function(e) {
	  console.log("clickedinside prog container at X"+e.offsetX);
	  console.log("clickedinside prog container at Y "+e.offsetY);
	  progBar.style.width = e.offsetX + "px";

	  var selectedPosition = (e.offsetX / progContainer.scrollWidth);

	  var selectedTime = selectedPosition * ytplayer.getDuration();

	  ytplayer.seekTo(selectedTime, true)
    mixpanel.track("seeked thru song");
    
	}, false);
  
  console.log(ytplayer);
}


/*
$("#sharePlayer").load( function (){
        console.log('inside the jquery load event!');
        player = new YT.Player('sharePlayer',{
        events: {
            'onReady': function(e){ e.target.playVideo(); }
        }
    });
    
     console.log(player);
    
});*/

function onPlayerReady() {
    console.log('inside on player ready method!!!');
    console.log('check what shares length is: ');
    //ytplayer.playVideo();

}

function onPlayerStateChange(event) {
  console.log('this is the current player state:' + event.data);
  var loader = $('img#songLoader');
  if(event.data === 0) {  //video finished playing, so move to next video      
      console.log("VID DONE!");
      var nextBtn = angular.element(document.querySelector('.glyphicon-step-forward'));
      mixpanel.track("reached end of song");
      nextBtn.click();
	}
  else if(event.data === -1 || event.data === 3) { //if buffering show loader 
    console.log(loader);
    loader.css("visibility","visible");
  }
  else if(event.data === 1) { //if playing hide loader
    loader.css("visibility","hidden");
  }
}

function onPlayerError(errorCode) {
  mixpanel.track("auto error");
	console.log('ERROR CODE IS: ');
  console.log(errorCode);  
  var scope = angular.element($('#personalVidList')).scope()
  console.log('!!!!ERRONEOUS SHARE is: '+ scope.history[scope.currentHistoryIndex]._id);
  console.log('aeCount is: '+scope.$parent.currentChosenShare.aeCount);
  scope.$parent.currentChosenShare.aeCount += 1;
  console.log('and after this error aeCount is: '+ scope.$parent.currentChosenShare.aeCount);
  angular.element($('#personalVidList')).scope().updateAEC(scope.currentID,scope.$parent.currentChosenShare.aeCount);
	if(scope.lastAction == "next") // continue in the next direction if bad video found
	{
		var nextBtn = angular.element(document.querySelector('.glyphicon-step-forward'));
		nextBtn.click();
	}
	else if(scope.lastAction == "previous") // continue in the previous direction if bad video found
	{
		var prevBtn = angular.element(document.querySelector('.glyphicon-step-backward'));
		prevBtn.click();
	}
}

function stopVideo() {
  ytplayer.stopVideo();
}

// Display information about the current state of the player
function updatePlayerInfo() {
  // Also check that at least one function exists since when IE unloads the
  // page, it will destroy the SWF before clearing the interval.
	//var progressBar = document.getElementById("progressBar");
  //console.log('updating player noww!!!');
	//var inside = document.getElementById('progInside');
	var progBar = document.getElementById('progBar');
	if(ytplayer)
	{
		try
		{
			if(ytplayer.getPlayerState() == 1)
			{
				var currentProgress = (ytplayer.getCurrentTime() / ytplayer.getDuration()) * 100;
				//progressBar.setAttribute("style","width:"+currentProgress + "%");
				//inside.style.width = currentProgress + "%";
        //console.log('this is the current progress: '+ currentProgress);
				progBar.style.width = currentProgress + "%";
				//progressBar.width == currentProgress + "%";

				//console.log("ABSOLUTE VALUE OF CURRENT PROGRESS IS: "+abs(currentProgress));
				if(currentProgress == 100)
				{
					clearInterval(this);
				}
				else if(currentProgress < 1)
				{
					var currentScrollOffset = $("#personalVidList").scrollTop();
					$("#personalVidList").animate({ scrollTop: $(".thumbnail.shareBrowserItem.selected").offset().top - 140 + currentScrollOffset}, 500);
				}
			}
		}
		catch(err)
		{
			if(err == "TypeError: Object #<HTMLObjectElement> has no method 'getPlayerState'")
			{
				//do nothing
			}
		}
	}
}

function playpauseVideo() {
  var playpauseButton = $('.glyphicon-play');
  console.log('inside playpause method!!! this is the playpausebutton result: '+ playpauseButton.length);
  //ytplayer = document.getElementById("sharePlayer");
  if(playpauseButton.length == 0 || playpauseButton == [] || playpauseButton == undefined || playpauseButton == null)
  {
    //console.log('GOING TO PAUSE now!!!');
    mixpanel.track("pause song");
    playpauseButton = $('.glyphicon-pause');
    if (ytplayer) {
      ytplayer.pauseVideo();
    }
    playpauseButton.toggleClass('glyphicon-pause glyphicon-play');
  }
  else
  { 
    //console.log('GOING TO PLAY now!!!');
    mixpanel.track("play song");
    if (ytplayer) {
      ytplayer.playVideo();
    }
    playpauseButton.toggleClass('glyphicon-play glyphicon-pause');
  }  
}

function loadVideoById(soundID) {
  var playpauseButton = $('.glyphicon-play');
  playpauseButton.toggleClass('glyphicon-play glyphicon-pause');
  console.log('inside the video loader!!!');
	if(ytplayer) {
	  ytplayer.loadVideoById(soundID,0,"large")
	}
  mixpanel.track("load new YT song");
}