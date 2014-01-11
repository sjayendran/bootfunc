//Articles service used for shares REST endpoint
angular.module('groovly.shares').factory("Shares", ['$resource', function($resource) {
    return $resource('shares/:shareId', {
        shareId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);