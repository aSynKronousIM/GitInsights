/**
 * Created by kate on 3/26/15.
 */

db.factory('Auth', ['$firebaseAuth',
  function($firebaseAuth) {
    var ref = new Firebase('https://gitinsights.firebaseio.com');
    return $firebaseAuth(ref);
  }
]);

db.controller('AuthController', ['$scope', 'Auth',
  function($scope, Auth) {
    $scope.createUser = function() {
      $scope.message = null;
      $scope.error = null;

      Auth.$createUser({
        email: $scope.email,
        password: $scope.password
      }).then(function(userData) {
        $scope.message = 'User created with uid:' + userData.uid;
      }).catch(function(error) {
        $scope.error = error;
      });
    };

    $scope.removeUser = function() {
      $scope.message = null;
      $scope.error = null;

      Auth.$removeUser({
        email: $scope.email,
        password: $scope.password
      }).then(function() {
        $scope.message = 'User removed.';
      }).catch(function(error) {
        $scope.error = error;
      });
    }
  }
]);

//db.controller('AuthController', ['$scope', '$firebaseAuth',
//  function($scope, $firebaseAuth) {
//    var ref = new Firebase('https://gitinsights.firebaseio.com');
//
//    var auth = $firebaseAuth(ref);
//
//    $scope.login = function() {
//      $scope.authData = null;
//      $scope.error = null;
//
//      auth.$authAnonymously().then(function(authData) {
//        $scope.authData = authData;
//      }).catch(function(error) {
//        $scope.error = error;
//      });
//    };
//
//    auth.$authWithOAuthPopup('github', function(error, authData) {
//      if (error) {
//        console.log('Login failed:', error);
//      } else {
//        console.log('Authenticated successfully with payload:', authData);
//      }
//    },
//    { // session expires on browser shutdown
//      remember: 'sessionOnly',
//      scope: 'user,gist'
//    });
//  }
//]);