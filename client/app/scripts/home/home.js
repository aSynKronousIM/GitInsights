(function(){
  'use strict';

  angular.module('gitInsight.home', ['ngMaterial', 'ngMessages'])
  .controller('HomeController', HomeController)
  //defines the colors
  .config( function($mdThemingProvider){
    $mdThemingProvider.theme('docs-dark', 'default')
    .primaryPalette('light-blue')
  });

  HomeController.$inject = ['$scope', 'GitApi', 'Auth', 'Chart', 'Dendrogram', '$q', '$timeout', '$http', '$resource', 'dateFormat', 'barChart'];

  function HomeController($scope, GitApi, Auth, Chart, Dendrogram, $q, $timeout, $http, $resource, dateFormat, barChart){
    $scope.github = {};
    $scope.currentUser = {};
    $scope.loaded = false;
    $scope.loaded3 = true;
    $scope.numUsers = 0;
    $scope.gitName = $scope.gitName;
    $scope.totalEvents = [];
    $scope.userData = [];
    $scope.tableFuncCalled = false;
    $scope.contribChartCalled = false;

    $scope.login = function(){
      Auth.login()
        .then(function (github) {
          $scope.github = github;
      });
    }

    $scope.getAllWeeklyData = function(username){
      // first we make a set of queries to get data from all the repo's the user has contributed to.
      // the process also tags some metadata to help with chaining
      GitApi.getAllWeeklyData(username)
        .then(function (data){ 
          // here we can immediately process the data to draw a line graph of the user's activity
          var weeklyData = GitApi.reduceAllWeeklyData(data);
          Chart.lineGraph(weeklyData, username);
          console.log('weeklydata is ', weeklyData);
          $scope.loaded = true;
          $scope.currentUser = {};
          return data;
        })
        .then(function (data) {
          return GitApi.gatherLanguageData(data);
          // this returns an array of tuples with the form 
          // [user contributions to this repo, repo language stats, total repo activity] when it resolves
        })
        .then(function (data) {
          // this time the data is processed to create a pie chart that estimates
          // the % of the each language the user codes in by taking the repo language stats * (user activity / total repo activity)
          var languages = GitApi.getUserLanguages(data);
          $scope.numUsers++;
          $scope.loaded3 = !($scope.loaded3);

          var config = {};
          config.chart = "#chart2"
          if($scope.numUsers % 2 === 0){
            config.chart = "#chart3"
          }

          Chart.pieChart(languages, config);
        })
        .then(function (data) {
          var allRepoFanSData = GitApi.getRepoFanS(username);
          Chart.multiBarChart(allRepoFanSData, username);
        });

    };

    // 
    // 
    // David's quick access play area to test different functions
    // 
    // 

    $scope.makeBarChart = function(){
      var data = $scope.totalEvents;
      barChart.makeBarChart(data);
      $scope.contribChartCalled = true;
    };


    $scope.getUserContributionData = function(username){
      var username = $scope.gitName;
      if($scope.gitName === undefined){ return; }


      function getEventsData (username) {
        var allEventData = [];
        // Github API endpoint for a user's events
        var Events = $resource('https://api.github.com/users/:username/events?page=:number')
        // Start on page 1
        var num = 1;
        // recursive subroutine for traversing the paginated results
        var pageTraverse = function(num){
          return Events.query({username: username, number: num, access_token: Auth.getToken()}, function(data){
            // base case
            // since pages can be up to 30 items in length, if the page has fewer than 30, it's the last page
            if(data.length < 30){
              data.forEach(function(singleEvent){
                allEventData.push(singleEvent);
              });
              $scope.gitName = "";
              $scope.totalEvents.push(dateFormat.processContributionData(allEventData, username));
              // if contribChart has already been rendered, re-render it with new data
              if($scope.contribChartCalled){ 
                $scope.makeBarChart(); 
              }
              return;
            }
            // increase num to move to the next page
            num ++;
            data.forEach(function(singleEvent){
              allEventData.push(singleEvent);
            })
            // recurse
            pageTraverse(num);
          })
        };
        pageTraverse(num);
      };
      getEventsData(username);

      function getUserData (username) {
        var Events = $resource('https://api.github.com/users/:username')
        Events.get({username: username, access_token: Auth.getToken()}, function(data){
          var length = $scope.totalEvents.length - 1;
          $scope.totalEvents[length].email = data.email;
          $scope.totalEvents[length].link = data.html_url;
          $scope.tableFuncCalled = true;
          $scope.totalEvents[length].loaded = true;

        })
      }
      setTimeout(function(){ getUserData(username); }, 1300);
    };

    // As mentioned in the html, this should be able to add a user to a list of favorites, but not sure how to do that yet.
    $scope.addToFavorites = function(username){
    }

    $scope.basicReset = function(){
      // currently clears out both pie charts, if I clear out the lineGraph, then it won't come back up again.
      Chart.empty()

    };

    // End of David's Play Area

    $scope.getUserFollowers = function() {
      
      GitApi.getUserFollowers('johnnygames')
        .then(function (data) {
          return GitApi.initialFollowerChain(data);
        })
        .then(function (data) {
          return GitApi.followerCreation(data);
        })
        .then(function (data) { 
          data.children.forEach(function (entry) {
            GitApi.getUserFollowers2(entry.name)
              .then(function (newData) {
                for (var j = 0; j < newData.length; j++) {
                  entry.children.push(
                    {
                      name: newData[j].login,
                      children: []
                    });
                }
                return data;
              })
          })
          return data; 
        })
        .then(function (data) {
          $timeout(function () {
            Dendrogram.dendrogram(data)
          }
          , 1000)
        })
    }
  }
})();
          
