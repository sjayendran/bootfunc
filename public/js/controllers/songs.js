function SongCtrl($scope, $routeParams, $sce) {
  $scope.name = "SongCtrl";
  $scope.params = $routeParams;
  console.log('this is the $scope object in the song controller');
  console.log($scope);
  console.log('this is the route params:');
  console.log($routeParams);
  
  $scope.getYTURL = function(targetID){
    return $sce.trustAsResourceUrl("https://www.youtube.com/embed/"+targetID+"?version=3&controls=0&enablejsapi=1&rel=0&showinfo=0&color=white&iv_load_policy=3");
  }
}