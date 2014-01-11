var groovly = angular.module('groovly.directives', [] );

//main method that loads the current song based on player controls or direct selection of the song
function setShare($scope, currentShare) {
  $scope.$parent.$parent.currentChosenShare = currentShare;
  if($scope.$parent.history == [] || $scope.$parent.history == null || $scope.$parent.history == undefined || $scope.$parent.history == "")// not played anything yet in random mode
  {
    mixpanel.track("started play history");
    $scope.$parent.history = [];
    $scope.$parent.history.push(currentShare);
    $scope.$parent.currentHistoryIndex = $scope.$parent.history.length - 1;
    $scope.$parent.currentID = currentShare._id.substring(currentShare._id.indexOf("v=")+2)
    console.log('BLANK: this is the current history length: ' + $scope.$parent.history.length);
    console.log('BLANK: this is the current history index: '+ $scope.$parent.currentHistoryIndex);
    //alert('this is what is inside the current chosen share scope now: ' + $scope.$parent.allShares.$parent.currentChosenShare.link);
  }
  else
  { 
    $scope.$parent.currentHistoryIndex = $scope.$parent.history.indexOf(currentShare);
    if($scope.$parent.history.indexOf(currentShare) == -1)
    {
      $scope.$parent.history.push(currentShare);
      $scope.$parent.currentHistoryIndex = $scope.$parent.history.indexOf(currentShare);
    }
    console.log('NOT BLANK: this is the current history length: ' + $scope.$parent.history.length);
    console.log('NOT BLANK: this is the current history index: '+ $scope.$parent.currentHistoryIndex);
    $scope.$parent.currentID = currentShare._id.substring(currentShare._id.indexOf("v=")+2);
  }
  loadVideoById($scope.$parent.currentID);
};

//Change the class of the selected song in the list with the highlighted CSS and remove the non-selected song's CSS
function selectShareInList(el) 
{
  angular.element(document.querySelector('.selected')).removeClass("selected");
  el.addClass("selected");
  console.log(Object.keys(el)[0]);
}

function startPlayer() 
{
  console.log('inside start player method!');
  var nextBtn = angular.element(document.querySelector('.glyphicon-step-forward'));
  nextBtn.click();
}

groovly.directive( 'shareSelected', function () {
  return {
    require: 'shareSelected',
    controller: function($scope) {
          this.selectShare = function(element) {
            selectShareInList(element);
          };          
        },
    restrict : 'C',
    link: function(scope, element, attrs, selector) {
      element.bind("click" , function(e){
        selector.selectShare(element);
        //console.log('this is the CLICKITYCLICKED SHARE: '+ Object.keys(scope.share));
      });     
    }
  };
});

groovly.directive('shareobject', function() {
	return {
		require: 'shareobject',
		restrict: "E",
		replace: true,
		template: "<a ng-click='setCurrentShare();' class='thumbnail shareBrowserItem {{shareSelected}}'>" + 
				  "<img data-src='holder.js/120x150' src={{'http://img.youtube.com/vi/'+share._id.substring(share._id.indexOf(\'v=\')+2)+'/2.jpg'}} alt='' />" +
          "<center><p>{{share.sa}} - {{share.st}}</p></center>" +
				  "<p align='right' class='shareSource'>via {{share.using}}</p></a>",
		controller: function($scope) {
        //var panes = $scope.panes = [];
         this.setCurrentShare = function(currentShare) {
           setShare($scope, currentShare);
           $scope.$parent.$parent.currentChosenShare.listenCount += 1;
           angular.element($('#personalVidList')).scope().updateListen($scope.$parent.currentID,$scope.$parent.$parent.currentChosenShare.listenCount);
        };
		  },
		  link: function(scope, element, attrs, controller) {
        element.bind("click" , function(e){
          controller.setCurrentShare(scope.share);          
          //console.log('this is the CLICKITYCLICKED SHARE: '+ Object.keys(scope.share));
        });  
		  }
	};
});

groovly.directive('playercontrols', function() {
	return {
   require: "playercontrols",
	 restrict : 'E',
	 replace: true,
	 template : "<ul class='nav navbar-nav' data-ng-show='global.authenticated'><li id='previousButton' title='Previous' class='vidControls'><a ng-click='previousSong();'><i class='glyphicon glyphicon-step-backward'></i></a></li>" +
				"<li id='playButton' title='Play' class='vidControls'><a onClick='playpauseVideo();'><i class='glyphicon glyphicon-play'></a></i></li>" +
				"<li id='nextButton' title='Next'><a ng-click='nextSong();'><i class='glyphicon glyphicon-step-forward' class='vidControls'></a></i></li>" +
				"<li><a><div id='progContainer' class='progress'>" +
				"  <div id='progBar' class='progress-bar' aria-valuenow='60' aria-valuemin='0' aria-valuemax='100' style='width: 0%;'></div>" +
        "</div></a></li><li><img class='navbar-header' id='songLoader' style='visibility:hidden; padding: 18px 0px 0px 0px;' src='img/loaders/circle.gif' width='16px'></li></ul>",
   controller: function($scope) {     
        this.selectNewRandomSongAndPush = function(scope) {
          //var streamLength = $scope.allShares.shares.length-1;
          var randomChoice = Math.floor(Math.random()*scope.shares.length-1);
          var adjustedListPosition = randomChoice + 2;
          console.log('inside new random song and push method');
          
          while(_.contains(scope.history, scope.shares[randomChoice]) && scope.history.length <= scope.shares.length)
          {
            randomChoice = Math.floor(Math.random()*scope.shares.length-1);
          }
          
          if(!_.contains(scope.history, scope.shares[randomChoice]))
          {
            this.selectShareFromControls(scope.shares[randomChoice],scope.shares);
            //angular.element(document.querySelector('ul li.shareBrowserItem:nth-child('+adjustedListPosition+') a')).click();
            //this.setCurrentShare(scope.shares[randomChoice]);
          }          
        };
     
        this.nextSong = function() {
          var reachedEndOfStream = false;
          var scope = angular.element(personalVidList).scope();
          scope.lastAction = 'next';
        
          //console.log("this is the randomSoFar size:"+randomSoFar.length);
          //console.log("this is the randomObject size:"+randomObjects.length);
        
          if(scope.history == undefined)
          {
            reachedEndOfStream = false;
          }
          else
          {
            if(scope.history.length < scope.shares.length-1)
              reachedEndOfStream = false;
            else
              reachedEndOfStream = true;
          }
        
          //console.log("randomSoFar is: "+ randomSoFar);
          if(scope.history == [] || scope.history == null || scope.history == undefined || scope.history == "")// not played anything yet in random mode
          {
            console.log("nothing in here so pushing the first random choice i got");
            scope.history = [];
            this.selectNewRandomSongAndPush(scope);
          }
          else // if tracks have already been played in random mode then check if link exists in linklist
          {
            if(scope.currentHistoryIndex == scope.history.length-1) //it is at the end of the random linklist, then add the next choice
            {
              console.log("at the end of linklist getting new random choice");
              this.selectNewRandomSongAndPush(scope);
            }			
            else //if not at the end of the linklist then just move to the next one
            {
              mixpanel.track("next song in history");
              scope.currentHistoryIndex += 1;
              //this.setCurrentShare(scope.shares.history[scope.shares.currentHistoryIndex]);
              this.selectShareFromControls(scope.history[scope.currentHistoryIndex],scope.shares);
            }		
          }
        };
     
        this.previousSong = function() {
          var reachedEndOfStream = false;
          var scope = angular.element(personalVidList).scope();
          //console.log('this is the id of the scope: '+ scope.$id);
          //console.log('in the prev button method! this is the object keys of the scope: ');
          //console.log(scope);
          //console.log('this is the current chosen share:'+scope.$parent.currentChosenShare);
          //console.log('this is the current history index:'+scope.currentHistoryIndex);
          scope.lastAction = 'previous';
          if(scope.currentHistoryIndex > 0)
          {
            scope.currentHistoryIndex--;            
            
            if(scope.history == undefined)
            {
              reachedEndOfStream = false;
            }
            else
            {
              if(scope.history.length < scope.shares.length-1)
                reachedEndOfStream = false;
              else
                reachedEndOfStream = true;
            }
            //console.log('this is the scope now: ');
            //console.log(scope);
            //console.log('this is the shares: '+ scope.shares);
            //console.log('this is the history: '+ scope.history);
            //console.log('finished init; this is the current history index:'+scope.currentHistoryIndex);
            if(scope.currentHistoryIndex >= 0)
            {
              console.log('history hasnt reached beginning');
              this.selectShareFromControls(scope.history[scope.currentHistoryIndex],scope.shares);  
            }
          }
          
          mixpanel.track("click previous song");
        };
     
        this.selectShareFromControls = function(share, shares) {
            var chosenIndex = shares.indexOf(share) + 2;
            angular.element(document.querySelector('ul li.shareBrowserItem:nth-child('+chosenIndex+') a')).click();
        };   
        
     /*
        this.setCurrentShare = function(currentShare) {
           setShare($scope, currentShare);
        };     */
		  },
	 link: function(scope, element, attrs, player) {
	   element.bind("click" , function(e){
       //console.log('player control CLICKEDDDD!');
       //console.log('this is the class: '+e.target.className);
       if(e.target.className == 'glyphicon glyphicon-step-forward') // next button clicked
       {
         player.nextSong();
       }
       else if(e.target.className == 'glyphicon glyphicon-step-backward') // next button clicked
       {
         player.previousSong();
       }
       //alert('this is the clicked object effect: ' + Object.keys(angular.element(personalVidList).scope()));
       //console.log('this is the CLICKITYCLICKED SHARE: '+ Object.keys(scope.share));
	   });  
	 }
	};
});