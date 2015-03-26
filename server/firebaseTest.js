/**
 * Created by kate on 3/25/15.
 */
//var Firebase = require('firebase');
//
//var ref = new Firebase('https://gitinsights.firebaseio.com');
//
//var list = ref.child("list");
//
//list.set({
//  candidate1: {
//    github: 'barbbella',
//    name: 'Kate Jefferson'
//  },
//  candidate2: {
//    github: 'johnnygames',
//    name: 'John Games'
//  }
//});

/**
 * Firebase module
 * @type {module|*}
 */
var db = angular.module('Firebase', ['firebase']);
// makes $firebaseObject, $firebaseArray, and $firebaseAuth available

/**
 * Firebase controller for favorite list
 */
db.controller('ListController', function($scope, $firebaseArray) {
  var ref = new Firebase('https://gitinsights.firebaseio.com/favorites');

  // creates synchronized array
  // do not use array methods
  // use $add() $save() and $remove()
  $scope.favorites = $firebaseArray(ref);

  $scope.addFavorite = function () {
    $scope.favorites.$add({
      username: $scope.username
    });
  };
});

