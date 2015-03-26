/**
 * Created by kate on 3/26/15.
 */

db.controller('AuthController', function($scope, $firebaseAuth) {
  var ref = new Firebase('https://gitinsights.firebaseio.com/favorites');

  var auth = $firebaseAuth(ref);

  auth.$authWithOAuthPopup('github').then(function(authData) {
    console.log('Logged in as:', authData.id);
  }).catch(function(error) {
    console.log('Authentication failed:', error);
  });
});