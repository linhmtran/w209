// needs global selectedCounty
var pcfStats;
var selectedCounty = 'CA_STATE';

// risk bar chart w/ref lines svg
//Set dimensions
var r = { top: 50, right: 50, bottom: 120, left: 70 }, h = 550 - r.top - r.bottom, w = 500 - r.left - r.right, barWidth = 10;

//Draw svg
var bar_svg = d3.select('#bar_chart_ref').append('svg')
        .attr('width', w + r.left + r.right)
        .attr('height', h + r.top + r.bottom)
        .append('g')
        .attr('transform', 'translate(' + r.left + ',' + r.top + ')');

//Axes and scales
var xScale = d3.scaleBand()
.domain(['Fatal', 'Injury'])
.range([0, w])
.round(.1);
//.range(['#8b0000', '#cccc00', '#e69500']);
// domain and range can be fixed

var yScale = d3.scaleLinear()
.range([h, 0]);

var xAxis = d3.axisBottom()
          .scale(xScale);

var yAxis = d3.axisLeft()
          .scale(yScale);

//Draw axes
bar_svg.append('g')
.attr('class', 'x axis')
.attr('transform', 'translate(0,' + h + ')')
.call(xAxis);

bar_svg.append('g')
.attr('class', 'y axis')
.call(yAxis);


// get collision counts/types for the global selectedCounty
var getCountyCollisions = function (data) {
  var c_search = 'Total';
  if (selectedCounty != '') {
    c_search = selectedCounty;
  }

  var cData;
  data.forEach(function (d) {
    if (d.County == c_search) {
      cData = d.CollisionFactor;
    }

    var sumInjuryForCounty = function (county, data) {
      var injury = 0;
      var fatal = 0;
      var property = 0;
      var total = 0;
      data.forEach(function (d) {
        if (d.County == county) {
          var cfData = d.CollisionFactor;
          console.log(Object.keys(cfData));
          Object.keys(cfData).forEach(function (pcf) {
            console.log(pcf);
            injury += cfData[pcf].Injury;
            fatal += cfData[pcf].Fatal;
            property += cfData[pcf].Property;
            total += cfData[pcf].Total;
          });
        }
      });

   console.log('injured = ' + injury);
      console.log('fatal = ' + fatal);
      console.log('property = ' + property);
      console.log('total = ' + total);
    };
  });

  return cData;
};

// get the aggregate total collisions for global selectedCounty
var getCountyInjuryTotals = d3.nest()
  .key(function (d) { return d.selectedCounty; })
  .rollup(function (v) { return {
    total: d3.sum(v, function (d) { return d.amount; }),
  }; });

// get the max number of collisions of any type for the global selectedCounty
var getMaxCollisionTypeValue = function (data) {
  var vMax = 0;
  var cData = getCountyCollisions(data);
  Object.keys(cData).forEach(function (key) {
    //console.log(cData[key]);
    if (vMax < cData[key]) {
      vMax = cData[key];
    }
  });

  console.log('max = ' + vMax);
  return vMax;
};

var updateRiskBarGraph = function (data) {
  // clear title and labels
  bar_svg.selectAll('text')
   .remove();

  // county data
  // console.log(pcfStats);
  var countyData = getCountyCollisions(data);

  // update bar width for number of collision types
  barWidth = w / Object.keys(countyData).length;

  // update domain y axis
  yScale.domain([0, getMaxCollisionTypeValue(data)]);

  // update domain x axis
  xScale.domain(Object.keys(countyData).map(function (d) {
    // console.log ("x domain " + d)
    return d;
  }));

  // define the tooltip
  var div = d3.select('#bar_chart_ref').append('div')
  .attr('class', 'tooltip')
  .style('opacity', 0);

  //select all bars on the graph, take them out, and exit the previous data set.
  //then you can add/enter the new data set
  var bars = bar_svg.selectAll('.bar')
  .remove()
     .exit()
     .data(Object.keys(countyData));
  //now actually give each rectangle the corresponding data
  bars.enter()
  .append('rect')
  .attr('class', 'bar')
  .attr('x', function (d, i) {
    return xScale(d) + 2;
  })
  .attr('y', function (d, i) {
    return yScale(countyData[d]);
  })
  .attr('height', function (d, i) {
    return h - yScale(countyData[d]);
  })
  .attr('width', barWidth - 4)
  .attr('fill', 'steelblue')
     .on('mouseover', function (d) {
    div.transition()
   .duration(200)
   .style('opacity', 0.9);
    div.html('Collision Factor: ' + d + '<br/>' +
           'Number of Collisions: ' + countyData[d])
   .style('left', (d3.event.pageX) + 'px')
   .style('top', (d3.event.pageY) + 'px');
  })
  .on('mouseout', function (d) {
    div.transition()
    .duration(500)
    .style('opacity', 0);
  });

  // update axes
  bar_svg.selectAll('g')
   .remove();
  bar_svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + h + ')')
      .call(xAxis)
      .selectAll('text')
       .style('text-anchor', 'end')
       .attr('dx', '-.8em')
       .attr('dy', '.15em')
       .attr('transform', 'rotate(-45)');

  bar_svg.append('g')
      .attr('class', 'y axis')
      .call(yAxis)
      .append('text')
       .attr('transform', 'rotate(-90)')
       .attr('y', 6)
       .attr('dy', '.71em')
       .style('text-anchor', 'end');

  // title showing county selection
  bar_svg.append('text')
   // .attr("x", w/2)
   // .attr("y", 0)
   .attr('transform', 'translate(' + w / 2 + ',-' + r.top / 2 + ')')
   .style('text-anchor', 'middle')
   .style('font-size', '14px')
   .style('text-decoration', 'bold')
   .text('Number of Collisions by Causes for Selected Region: ' + selectedCounty);

  // y axis label
  bar_svg.append('text')
   .attr('transform', 'translate(-50,' + (h / 2 + r.top) + ') rotate(-90)')
   .text('Number of Collisions');
  // x axis label
  bar_svg.append('text')
   .attr('transform', 'translate(' + (w / 2 - r.left) + ',' + (h + r.bottom - 5) + ')')
   .text('Primary Collision Factor');

}; // end updateRiskBarGraphGraph

// load the dataset
d3.queue()
	.defer(d3.json, 'data/pcfInjuryFatalStats.json')
	.awaitAll(function (error, results) {
		if (error) throw error;

  pcfStats = results[0];
  //console.log(pcfStats);
  updateRiskBarGraph(pcfStats);
});
