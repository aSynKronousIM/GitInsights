(function(){
  'use strict';

  angular.module('gitInsight.home', ['ngMaterial', 'ngMessages'])
  .controller('HomeController', HomeController)
  //defines the colors
  .config( function($mdThemingProvider){
    $mdThemingProvider.theme('docs-dark', 'default')
    .primaryPalette('light-blue')
  });

  HomeController.$inject = ['$scope', 'GitApi', 'Auth', 'Chart'];

  function HomeController($scope, GitApi, Auth, Chart){
    $scope.github = {};
    $scope.currentUser = {};
    $scope.loaded = false;
    $scope.loaded3 = true;
    $scope.numUsers = 0;
    //this numFollowers is just to test in Home, will move to own controller
    $scope.numFollowers = 0;
    $scope.currentUserFollowers = {};

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
          var weeklyData = GitApi.reduceAllWeeklyData(data)
          Chart.lineGraph(weeklyData, username);
          $scope.loaded = true;
          $scope.currentUser = {};
          return data;
        })
        .then(function (data) {
          return GitApi.gatherLanguageData(data);
          // this returns an array of tuples with the form 
          // [user contirbutions to this repo, repo language stats, total repo activity] when it resolves
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
        });
    };

    $scope.getUserFollowers = function() {
      
      GitApi.getUserFollowers('johnnygames')
        .then(function (data) {
          console.log(data, ' unaltered');
          console.log(testData, 'before declaration')
          var testData = {
            root: 'random',
            children: []
          }
          console.log(testData, 'JUST CREATED');
          for (var i = 0; i < data.length; i++) {
            testData.children.push(data[i]);
          }
          console.log(testData);
          return testData;
        })
        .then(function (data) {
          console.log(data, 'first');
          for (var i = 0; i < data.children.length; i++) {
            var newUser = {
              name: data.children[i].login,
              children: ['need to put some shit in here']
            }
            data.children[i] = newUser;
          }
          console.log(newUser, 'newUser');
          console.log(data, 'final');
          return data;
          // GitApi.getUserFollowers(data.children[0])
          //   .then(function (data) {
          //     newUser.followers.push(data);
          //     return newUser;
          //   })
          // data.followers.push(newUser);
          // console.log(data, 'this is the final then');
        })
        .then(function (data) {
          GitApi.getUserFollowers(data.children[0].name)
            .then(function (newData) {
              for (var i = 0; i < newData.length; i++) {
                data.children[0].children.push(newData[i]);
              }
              console.log(newData, 'new data nested then');
              console.log(data, 'data nested then');
              return newData;
            })
          console.log(data);
        })
      Graph.makegraph(data)
    }
  }
})();

      // var radius = 960 / 2;

      // var cluster = d3.layout.cluster()
      //     .size([360, radius - 120]);

      // var diagonal = d3.svg.diagonal.radial()
      //     .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });

      // var svg = d3.select("body").append("svg")
      //     .attr("width", radius * 2)
      //     .attr("height", radius * 2)
      //   .append("g")
      //     .attr("transform", "translate(" + radius + "," + radius + ")");
      //     //data = JSON.parse(data);

      //     console.log(tempData);
      //     console.log(data, 'this is data');
      //     var nodes = cluster.nodes(data);
      //     //console.log(nodes, 'these are nodes');
      //     var links = cluster.links(nodes);
      //     //console.log(links, 'these are links');


      //     var link = svg.selectAll(".link")
      //         .data(links)
      //       .enter().append("path")
      //         .attr("class", "link")
      //         .attr("d", diagonal);

      //     var node = svg.selectAll(".node")
      //         .data(nodes)
      //       .enter().append("g")
      //         .attr("class", "node")
      //         .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })

      //     node.append("circle")
      //         .attr("r", 4.5);

      //     node.append("text")
      //         .attr("dx", function(d) { return d.children ? -8 : 8; })
      //         .attr("dy", 3)
      //         .style("text-anchor", function(d) { return d.children ? "end" : "start"; })
      //         .text(function(d) { return d.name; });
      //   });   
      // d3.select(self.frameElement).style("height", radius * 2 + "px");     
