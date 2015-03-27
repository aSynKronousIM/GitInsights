(function(){
"use strict";

angular.module('gitInsight.gitapi', [])
  .factory('GitApi', GitApi);

GitApi.$inject = ['$q', '$http', '$resource', 'Auth'];
function GitApi ($q, $http, $resource, Auth) {

  var gitApi = 'https://api.github.com/';
  var usersRepos = {};
  var repoFanS = [];
  var repoForks = [];
  var repoStars = [];

  return {
    reduceAllWeeklyData: reduceAllWeeklyData,
    getAllWeeklyData: getAllWeeklyData,
    getRepoWeeklyData: getRepoWeeklyData,
    getUserRepos: getUserRepos,
    getRepoFanS: getRepoFanS,
    getUserContact: getUserContact,
    gatherLanguageData: gatherLanguageData,
    getUserLanguages: getUserLanguages,
    getEventsData: getEventsData,
    getUserFollowers: getUserFollowers,
    getUserFollowers2: getUserFollowers2,
    followerObj: followerObj,
    initialFollowerChain: initialFollowerChain,
    followerCreation: followerCreation
  };

  //a week is an array of objects
  //each object is in the form of {additions: #, deletions #, week:#(UNIX time)}
  //we extract the additions and deletions from each data object for each week, from each repo
  //we return an array of reduced week objects to graph the total additions/deletions
  function reduceAllWeeklyData (array, username) {
    var reduced = {};
    console.log('Arraylength - ', array.length)
    array.forEach(function (result) {
      if(result !== undefined){
        console.log('Result - ', result);
        result.weeks.forEach(function (data) {
            var week = data.w;
            for (var key in data) {
              reduced[week] = reduced[week] || {};
              reduced[week][key] = (reduced[week][key] || 0) + data[key];
            delete reduced[week].w;
          }
        });
      }
    });
    return reduced;
  }

  //returns data from each api call
  //after all successfully resolves
  function getAllWeeklyData (username) {
    return getUserRepos(username)
      .then(function (repos) {
        var promises = repos.map(function (repo) {
          return getRepoWeeklyData(repo, username);
        });
        return $q.all(promises);
      });
  }

  function get (url, params) {
    //Auth.getToken() retrieves the gitToken when a user authenticates with
    //firebase's Github Provider

    //perhaps extend params with given input
    params = params || {access_token: Auth.getToken()};
    return $http({
      method: 'GET',
      url: url,
      params: params
    });
  }


// David Testing Area!!!
// Please beware

  function getEventsData (username) {
    var Events = $resource('https://api.github.com/users/:username/events?page=:number')
    var num = 1;
    var allEventData = [];

    var pageTraverse = function(num){
      return Events.query({username: username, number: num}, function(data){
        if(data.length < 30){
          // data.forEach(function(singleEvent){
            // allEventData.push(singleEvent);
          // });
          // console.log('last page of results - ', allEventData);

          return;
        }
        num ++;
        console.log('num - ', num);
        // console.log('In query - ', data);
        // data.forEach(function(singleEvent){
          // allEventData.push(singleEvent);
        // })
        pageTraverse(num);
      }).$promise.then(function(someData){
        someData.forEach(function(hubEvent){
          allEventData.push(hubEvent);
        });
        console.log('Some Data - ', allEventData);
      })
    };

    return pageTraverse(num);

    // console.log('what about me - ', allEventData)
    // return allEventData


  }

// End of David Testing Area
// Proceed normally


  //returns an array of additions/deletions and commits
  //made by a user for a given repo
  function getRepoWeeklyData (repo, username) {
    var contributors = repo.url + '/stats/contributors';

    return get(contributors).then(function (res) {
      var numContributors = res.data.length;
      //if there are multiple contributors for this repo,
      //we need to find the one that matches the queried user
      for(var i = 0; i < numContributors; i++){
        if(res.data[i].author.login === username) {
          var data = res.data[i];
        //we attach some metadata that will help us with chaining these queries
          data.url = repo.url;
          data.numContributors = numContributors;
          return data;
        }
      }
    });
  }

  function getUserRepos (username) {
    //if cached, return repo list as promise
    if (usersRepos[username]) {
      return $q(function (resolve, reject) {
        return resolve(usersRepos[username]);
      });
    }

    //else, fetch via api
    //currently only fetches repos owned by user
    //TODO: Fetch all repos user has contributed to
    var userRepos = gitApi + 'users/' + username + '/repos';
    return get(userRepos).then(function (res){
      var repos = res.data;
      var username = res.data[0].owner.login;
      usersRepos[username] = repos;
      return usersRepos[username];
    });
  }

  function getForks (username) {
    var allRepos = usersRepos[username];
    for (var i = allRepos.length-1; i >= 0; i--) {
      repoForks.push(allRepos[i].forks_count);
    }
    console.log('repoForks: ', repoForks);
    return repoForks;
  }

  function getStars (username) {
    var allRepos = usersRepos[username];
    for (var i = allRepos.length-1; i >= 0; i--) {
      repoStars.push(allRepos[i].stargazers_count);
    }
    console.log('stars: ', repoStars);
    return repoStars;
  }

  // gather repo name, stars and forks to send to chart
  function getRepoFanS (username) {
    var allRepos = usersRepos[username];
    getForks(username);
    getStars(username);
    for (var i = allRepos.length-1; i >= 0; i--) {
      repoFanS.push([repoForks[i], repoStars[i], allRepos[i].name]);
    }
    return repoFanS;
  }

  function getUserContact (username) {
    var userContact = gitApi + "users/" + username;
    return get(userContact).then(function (res) {
      return res.data;
    });
  }

  // In order to get an idea of the user's language use,
  // we first supply information about all repos the user has contributed to.

  // For each repo, we make at most two requests,
  // getLanguageStats gathers the language statstic for that repo, 
    // if the user is the sole contributor for the repo, 
      // we can add the language stat directly to the final result
    // else, getCodeFrequency gets the repo's data for weekly additions/deletions
      // the ratio between the user's and the repo's net additions is used to estimate
      // the portion the user has contributed to the repo in each language.

  // This approximation strives to reduce the number of api calls to Github
  // while giving a reasonable estimate of the user's language use.

  // Please let us know if there is a better way.

  function gatherLanguageData (data) {
    var promises = data.map(function (repo) {
      if (repo) {
        var requests = [repo];
        requests[1] = getLanguageStats(repo);

        //only get code frequency if the repo has multiple contibutors
        //otherwise we can just add the languageStat directly.
        if(repo.numContributors > 1) {
          requests[2] = getCodeFrequency(repo);
        }

        return $q.all(requests);
      } else {
        return [];
      }
    });
    //$q is angular's light version of the q promise library
    //each api call executes asynchronously,
    //we return only when all of them have resolved
    return $q.all(promises);
  }

  // Once all the requests have been resolved, we can sum the values 
  // across all repos and get an estimate of the user's language use
  // based on the total number of bytes per language.

  function getUserLanguages (repos) {
    var squashed = {};
    repos.forEach(function (repo) {
      var result = estimateUserContribution(repo);
      if (result) {
        for (var language in result) {
          if (squashed[language]) {
            squashed[language] += result[language];
          } else {
            squashed[language] = result[language];
          }
        }
      }
    });
    return squashed;
  }

  //returns an object representing the number of bytes
  //each language used in this repo uses.
  function getLanguageStats (repo) {
    var repoLanguages = repo.url + '/languages'
    return get(repoLanguages).then(function (res) {
      return res.data;
    });
  }

  //returns an array of arrays
  //each subarray contains information about the total number of additions/deletions
  //for a given week made in this repo
  function getCodeFrequency (repo) {
    var repoCodeFreq = repo.url + '/stats/code_frequency';
    return get(repoCodeFreq).then(function (res) {
      return res.data;
    });
  }

  function estimateUserContribution (repo) {
    var result = {};

    // no data on repo
    if (repo.length === 0){
      return null;
    }

    // no request for contributor data,
    // user is sole contributor
    // return entire languageStat
    if (!repo[2]) {
      return repo[1];
    }

    var weeklyData = repo[0].weeks;
    var languageStats = repo[1];
    var codeFreq = repo[2];

    var userNetAdditions = 0;
    var repoNetAdditions = 0;

    //weeklyData is an array of week objects
    //with the format {additions:#, deletions:#, week:#(UNIX Timestamp)}
    weeklyData.forEach(function (week) {
      userNetAdditions += (week.a - week.d);
    });

    //codeFreq is is an array of arrays
    //with the format [timestamp, additions, deletions]
    codeFreq.forEach(function (week) {
      repoNetAdditions += (week[1] - week[2]);
    });

    var ratio = (userNetAdditions/repoNetAdditions);

    for (var key in languageStats) {
      result[key] = languageStats[key] * ratio;
    }

    return result;
  }

  function getUserFollowers (username) {
    var followers = gitApi + 'users/' + username + '/followers';
     return get(followers).then(function (res) {
      return res.data;
     });
  }

  function getUserFollowers2 (username) {
    var followers = gitApi + 'users/' + username + '/followers';
     return get(followers).then(function (res) {
      return res.data;
     });
  }

  function followerObj (username) {
    var followers = gitApi + 'users/' + username + '/followers';
    var username = username;
    var tempData = {
      root: username,
      children: []
    };

    return getUserFollowers(username)
      .then(function (data) {
        var holder = [];
        //var temp = [];        
        for (var i = 0; i < data.length; i++) {
          getUserFollowers(data[i]['login'])
            .then(function (data) {
              //console.log(data, 'this is data')
              var temp = holder.concat(data);
              //console.log(tempData, 'this is tempData');
              tempData.children.push({
                name: data[i]['login'],
                children: temp
              });
            });
        }
        return tempData;
      });
  }

  function initialFollowerChain (array) {
    var testData = {
      name: 'johnnygames',
      children: []
    }
    for (var i = 0; i < array.length; i++) {
      testData.children.push(array[i]);
    }
    return testData;
  }

  function followerCreation (obj) {
    for (var i = 0; i < obj.children.length; i++) {
      var newUser = {
        name: obj.children[i].login,
        children: []
      }
      obj.children[i] = newUser;
    }
    return obj;
  }
}
})();
