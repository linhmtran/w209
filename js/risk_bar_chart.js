// global, selected pcf
var selectedPCF;
var injuryData;

// risk bar chart w/ref lines svg
//Set dimensions
var r_m = { top: 50, right: 50, bottom: 70, left: 70 }, r_h = 500 - r_m.top - r_m.bottom, r_w = 500 - r_m.left - r_m.right, r_barWidth = 10;

//Draw svg
var r_svg = d3.select('#risk_chart').append('svg')
        .attr('width', r_w + r_m.left + r_m.right)
        .attr('height', r_h + r_m.top + r_m.bottom)
        .append('g')
        .attr('transform', 'translate(' + r_m.left + ',' + r_m.top + ')');

//Axes and scales
var r_xScale = d3.scaleBand()
.domain(['Fatal', 'Injury'])
.range([0, r_w])
.round(.1);

var r_yScale = d3.scaleLinear()
.range([r_h, 0]);

var r_xAxis = d3.axisBottom()
          .scale(r_xScale);

var r_yAxis = d3.axisLeft()
          .scale(r_yScale);
// .tickFormat(formatPercent);

//Draw axes
r_svg.append('g')
.attr('class', 'x axis')
.attr('transform', 'translate(0,' + r_h + ')')
.call(r_xAxis);

r_svg.append('g')
.attr('class', 'y axis')
.call(r_yAxis);

var nicePCFCategory = function (pcf) {
  if (pcf == null || pcf == "") {
    return "All Categories";
  }
  else {
    return pcf;
  }
}

// sum up the injury/fatality across all pcf categories for a selected county
var getCountyTotalRiskCounts = function (county, data) {
  var stats = { Injury: 0,
                Fatal: 0,
                Property: 0,
                Total: 0,
              };
  data.forEach(function (d) {
    if (d.County == county) {
      var cfData = d.CollisionFactor;
      // console.log(Object.keys(cfData));
      Object.keys(cfData).forEach(function (pcf) {
        // console.log(pcf);
        stats.Injury += cfData[pcf].Injury;
        stats.Fatal += cfData[pcf].Fatal;
        stats.Property += cfData[pcf].Property;
        //stats.Total += cfData[pcf].Total;
        stats.Total += cfData[pcf].Injury + cfData[pcf].Fatal + cfData[pcf].Property;

      });
    }
  });

  // console.log(stats);
  return stats;
};

// format the Rates
var formatPercent = d3.format(',.2%');

// get the injury/fatality stats for a particular county and pcf category
var getCountyPCFRiskCounts = function (county, pcf, data) {
    var stats = { Injury: 0,
                  Fatal: 0,
                  Property: 0,
                  Total: 0,
                };
    data.forEach(function (d) {
        if (d.County == county) {
          var cfData = d.CollisionFactor;
          // console.log(Object.keys(cfData));
          stats.Injury = cfData[pcf].Injury;
          stats.Fatal = cfData[pcf].Fatal;
          stats.Property = cfData[pcf].Property;
          //stats.Total += cfData[pcf].Total;
          stats.Total = cfData[pcf].Injury + cfData[pcf].Fatal + cfData[pcf].Property;
        };
      });

    console.log(stats);
    return stats;
  };


// var getCountyPCFRiskCounts = function (county, pcf, data) {
//   var stats;
//   data.forEach(function (d) {
//     if (d.County == county) {
//       // console.log("county = " + county);
//       // console.log("d = " + d.CollisionFactor[pcf]);
//       // console.log(d.CollisionFactor);
//       stats = d.CollisionFactor[pcf].Fatal + d.CollisionFactor[pcf].Injury + d.CollisionFactor[pcf].Property;
//       console.log(stats);
//     }
//   });
//
//   return stats;
// };

// calculate and return an object which contains the "average" risk rates
// for injuries, fatalities, and property across all pcf categories for a specific county
var getCountyTotalRiskRate = function (county, data) {
  var totalStats = getCountyTotalRiskCounts(county, data);
  var rates = { Injury: totalStats.Injury / totalStats.Total,
              Fatal: totalStats.Fatal / totalStats.Total,
              Property: totalStats.Property / totalStats.Total,
            };
  // console.log(totalStats.Injury);
  // console.log(totalStats.Fatal);
  // console.log(totalStats.Property);
  // console.log(totalStats.Total);
  // console.log(rates);
  return rates;
};

// calculate and return an object which contains the risk rate
// for injury, fatalities, and property only for a specific PCF category for a county
var getCountyPCFRiskRate = function (county, pcf, data) {
  var stats = getCountyPCFRiskCounts(county, pcf, data);
  // console.log(stats);
  var rates = { Injury: stats.Injury / stats.Total,
                Fatal: stats.Fatal / stats.Total,
                Property: stats.Property / stats.Total,
              };
  return rates;
};

var updateRiskBarGraph = function (data) {
  // clear title and labels
  r_svg.selectAll('text')
    .remove();

  // console.log(getCountyTotalRiskRate('Los Angeles', data));

  // console.log(getCountyPCFRiskRate('Los Angeles', 'DUI', data));
  // console.log(getCountyPCFRiskRate('Los Angeles', 'Unsafe Speed', data));
  //
  // console.log(getCountyTotalRiskRate('Alpine', data));
  // console.log(getCountyPCFRiskRate('Alpine', 'DUI', data));
  console.log(selectedPCF);
  if (selectedPCF == null) {
    var totalRiskRates = getCountyTotalRiskRate(selectedCounty, data);
  } else {
    var totalRiskRates = getCountyPCFRiskRate(selectedCounty, selectedPCF, data);
  }

  // var totalRiskRates = (selectedPCF = '')?
  //   getCountyTotalRiskRate(selectedCounty, data) :
  //   getCountyPCFRiskRate(selectedCounty, selectedPCF, data);
  // console.log(selectedCounty);
  console.log(Object.keys(totalRiskRates));
  console.log(totalRiskRates);

  // update bar width for number of collision types
  r_barWidth = r_w / (Object.keys(totalRiskRates).length);

  // update domain y axis, we know it's 0 to 1 since dealing with rates
  r_yScale.domain([0, 1]);

  // update domain x axis
  r_xScale.domain(Object.keys(totalRiskRates).map(function (d) {
    // console.log ("x domain " + d)
    return d;
  }));

  // define the tooltip
  var div = d3.select('#risk_chart').append('div')
  .attr('class', 'tooltip')
  .style('opacity', 0);

  //select all bars on the graph, take them out, and exit the previous data set.
  //then you can add/enter the new data set
  var bars = r_svg.selectAll('.bar')
  .remove()
     .exit()
     .data(Object.keys(totalRiskRates));
  //now actually give each rectangle the corresponding data
  bars.enter()
  .append('rect')
  .attr('class', 'bar')
  .attr('x', function (d, i) {
    return r_xScale(d) + 2;
  })
  .attr('y', function (d, i) {
    // console.log(d);
    // console.log(totalRiskRates[d]);
    return r_yScale(totalRiskRates[d]);
  })
  .attr('height', function (d, i) {
    return r_h - r_yScale(totalRiskRates[d]);
  })
  .attr('width', r_barWidth - 4)
  .attr('fill', 'steelblue')
     .on('mouseover', function (d) {
        div.transition()
        .duration(200)
        .style('opacity', 0.9);
        div.html('Risk: ' + d + '<br/>' +
                'Rate: ' + formatPercent(totalRiskRates[d]))
        .style('left', (d3.event.pageX) + 'px')
        .style('top', (d3.event.pageY) + 'px');
      })
  .on('mouseout', function (d) {
    div.transition()
    .duration(500)
    .style('opacity', 0);
  });

  // update axes
  r_svg.selectAll('g')
   .remove();
  r_svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + r_h + ')')
      .call(r_xAxis)
      .selectAll('text')
       .style('text-anchor', 'end')
       .attr('dx', '-.8em')
       .attr('dy', '.15em')
       .attr('transform', 'rotate(-45)');

  r_svg.append('g')
      .attr('class', 'y axis')
      .call(r_yAxis)
      .append('text')
       .attr('transform', 'rotate(-90)')
       .attr('y', 6)
       .attr('dy', '.71em')
       .style('text-anchor', 'end');

  // title showing county selection
  r_svg.append('text')
   // .attr("x", w/2)
   // .attr("y", 0)
   .attr('transform', 'translate(' + r_w / 2 + ',-' + r_m.top / 2 + ')')
   .style('text-anchor', 'middle')
   .style('font-size', '14px')
   .style('text-decoration', 'bold')
   .text('Risk Rates for Collision Factor: ' + nicePCFCategory(selectedPCF));

  // y axis label
  r_svg.append('text')
   .attr('transform', 'translate(-50,' + (r_h / 2 + r_m.top) + ') rotate(-90)')
   .text('Rate');
  // x axis label
  r_svg.append('text')
   .attr('transform', 'translate(' + (r_w / 2 - r_m.left) + ',' + (r_h + r_m.bottom - 5) + ')')
   .text('Risk Category');

}; // end updateRiskBarGraph

// load the dataset
d3.queue()
	.defer(d3.json, 'data/pcfInjuryFatalStats.json')
	.awaitAll(function (error, results) {
		if (error) throw error;

  injuryData = results[0];
  // console.log(injuryData);
  updateRiskBarGraph(injuryData);
});
