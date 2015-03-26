/**
 * Firebase module
 * @type {module|*}
 */
var db = angular.module('Firebase', ['firebase']);
// makes $firebaseObject, $firebaseArray, and $firebaseAuth available

/** Favorite Factory
 * returns the user's list of favorites
 */
db.factory('favoritesList', ['$firebaseArray',
  function($firebaseArray) {
    // need reference to user's data
    var user = 'blah';
    var ref = new Firebase('https://gitinsights.firebaseio.com/' + user);
    return $firebaseArray(ref);
  }
]);

/**
 * Firebase controller for favorite list
 */
db.controller('FavoriteController',
  function($scope, favoritesList) {

    $scope.user = 'Guest' + Math.round(Math.random() * 100);
    // adds array to scope to be used in ng-repeat
    $scope.favorites = favoritesList;

    // method to add favorite called by ng-submit
    $scope.addFavorite = function() {
      $scope.favorites.$add({
        username: $scope.username
      });
      // resets username field
      $scope.username = '';
    };

  }
);

