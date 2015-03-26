/**
 * Firebase module
 * @type {module|*}
 */
var db = angular.module('Firebase', ['firebase']);
// makes $firebaseObject, $firebaseArray, and $firebaseAuth available

/** Favorite Factory
 * returns the user's list of favorites
 */
db.factory('favoritesList', ['$firebaseObject',
  function($firebaseObject) {
    return function(username) {
      // need reference to user's data ?
      var ref = new Firebase('https://gitinsights.firebaseio.com/');
      var profileRef = ref.child(username);
      // return synchronized object
      return $firebaseObject(profileRef);
    };
  }
]);

/**
 * Firebase controller for favorite list
 */
db.controller('favoriteController', ['$scipe', 'favoritesList',
  function($scope, favoritesList) {
    // make list available to DOM
    // need username from auth
    $scope.user = 'Guest' + Math.round(Math.random() * 100);
    $scope.list = favoritesList($scope.user);

    // 3-way binding, may eliminate need for save function
    favoritesList($scope.user).$bindTo($scope, 'favoritesList');

    //// syncs object back to Firebase
    //$scope.saveFavorites = function () {
    //  $scope.list.$save().then(function() {
    //    console.log('List saved to Firebase!');
    //  }).catch(function(error) {
    //    console.log('Sync failed:' + error);
    //  });
    //};

    //// method to add favorite called by ng-submit
    //$scope.addFavorite = function() {
    //  $scope.favorites.$add({
    //    username: $scope.username
    //  });
    //  // resets username field
    //  $scope.username = '';
    //};
  }
]);

