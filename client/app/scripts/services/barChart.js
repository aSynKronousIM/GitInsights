(function () {
'use strict';

angular.module('gitInsight.barChart', [])
  .factory('barChart', barChart);


barChart.$inject = [];
function barChart () {

  var usersData = [];
  var usersFanSData = [];

  return {
    makeBarChart: makeBarChart
  };

  

  function makeBarChart (data) {
    /* data comes in the form of [{
        {
          email: email,
          link: link,
          overallAverage: overallAverage,
          pastMonthAverage: pastMonthAverage,
          total: total,
          username: username
        }
    }]
    */
    
    var usersContribData = [{"key": "Daily Average, Lifetime", "values": []}, {"key": "Daily Average, Past Month", "values": []}];

    for (var i = data.length-1; i >= 0; i--)  {
      console.log('data in barChart - ', data[i])
      usersContribData[0].values.push({"label": data[i].username, "value": data[i].overallAverage});
      usersContribData[1].values.push({"label": data[i].username, "value": data[i].pastMonthAverage});
    }

    // usersFanSData.push(usersContribData);
    console.log('usersContribData: ', usersContribData);

    nv.addGraph(function() {
      var chart = nv.models.multiBarChart()
      .x(function(d) {return d.label;})
      .y(function(d) {return d.value;})
      .reduceXTicks(false)   //If 'false', every single x-axis tick label will be rendered.
      .showControls(true)   //Allow user to switch between 'Grouped' and 'Stacked' mode.
      .groupSpacing(0.1)    //Distance between each group of bars.
      ;

      // chart.xAxis
      // .tickFormat(d3.format(',f'));

      chart.yAxis
      .tickFormat(d3.format(',f'));

      d3.select('#contribsChart svg')
      .datum(usersContribData)
      .transition()
      .duration(350)
      .call(chart);

      nv.utils.windowResize(chart.update);

      return chart;
    });
  };

}
})();



