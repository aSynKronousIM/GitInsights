(function () {
'use strict';

angular.module('gitInsight.dendrogram', [])
  .factory('Dendrogram', Dendrogram);


Dendrogram.$inject = [];
function Dendrogram () {

  return {
    dendrogram: dendrogram
  };

  

}
})();
