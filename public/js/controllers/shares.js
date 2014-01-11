angular.module('groovly.shares').controller('SharesController', ['$scope', '$routeParams', '$location', '$http', 'Global', 'Shares', function ($scope, $routeParams, $location, $http, Global, Shares) {
    $scope.global = Global;
    $scope.isCollapsed = false;
    //console.log('this is the angular current share scope: '+Object.keysangular.element(currentShare).scope());
    if(Global.authenticated)
    {
      //$scope.allShares = angular.element(currentShare).scope();
      //$scope.allShares.history = [];
      //window.setInterval(console.log("this is the interval method!"),500);
  
      $scope.findOne = function() {
          Shares.get({
              shareId: $routeParams.shareId
          }, function(share) {
              $scope.share = share;
          });
      };
    
      $scope.find = function (query) {
        console.log('INSIDE SHARE find method!');
        Shares.query(query, function (shares) {
          console.log('this is the query used in the SHARE FIND method: '+ query);
          $scope.shares = shares;
          console.log('this is what i got: '+ shares);
        });
      };
    
      $scope.getUserShares = function (query) {
        console.log('INSIDE SHARE find method!');
        Shares.query(query, function (shares) {
          console.log('this is the query used in the SHARE FIND method: '+ query);
          $scope.shares = shares;
          //console.log('this is what i got: '+ shares);
        });
      };
      
      $scope.updateListen = function(currentID,currentCount) {
          //alert("GOING TO UPDATE THE Listen count for: "+ currentID);
          
          $http({method: 'PUT', url: '/lc/' + currentID + '/yt/' + currentCount}).
            success(function(data, status) {
              if(status == 200)
                console.log('this is the successful data: '+ data);
              else
                console.log('this is the non-200 data: ' + data);
            }).
            error(function(data, status) {
              //console.log('ERROR!!!!!! this is the status: ' + status + ' and this is the data: ' + data);
          });
      };
      
      //method to update the auto error count for a video
      $scope.updateAEC = function(currentID,currentCount) {
          //alert("GOING TO UPDATE THE AUTO ERROR count for: "+ currentID);
          
          $http({method: 'PUT', url: '/aec/' + currentID + '/yt/' + currentCount}).
            success(function(data, status) {
              if(status == 200)
                console.log('this is the successful data: '+ data);
              else
                console.log('this is the non-200 data: ' + data);
            }).
            error(function(data, status) {
              //console.log('ERROR!!!!!! this is the status: ' + status + ' and this is the data: ' + data);
          });
      };
    
      $scope.getFB = function() {
        //console.log('this is what the share is: '+ $scope.global.share);
        console.log('this is what the user is: '+ $scope.Global.user.facebook.name);
        /*var Share = $resource('/shares/getFB/'+user.authToken);
        var share = Share.get();
        console.log('this is the result of the resource get: '+ Object.keys(share));*/
        $http({method: 'GET', url: '/shares/getFB/'+user.authToken}).
          success(function(data, status) {
            if(status == 200)
              console.log('this is the successful data: '+ data);
            else
              console.log('this is the non-200 data: ' + data);
          }).
          error(function(data, status) {
            console.log('ERROR!!!!!! this is the status: ' + status + ' and this is the data: ' + data);
        });
      };
    }
  
  
  /* OLD method
    $scope.findOne = function() {
      Shares.get({ shareId: $routeParams.shareId }, function (share) {
        $scope.share = share;
      });
    };*/
}]);