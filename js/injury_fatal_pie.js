// globals
var selectedPCF;

//Set dimensions
var p_m = {top: 50, right: 50, bottom: 120, left: 70}
, p_h = 500 - p_m.top - p_m.bottom
, p_w = 500 - p_m.left - p_m.right
, p_radius = Math.min(p_w/p_h)/2

//Draw svg
var pie_svg = d3.select("#injury_pie").append("svg")
        .attr("width", w + m.left + m.right)
        .attr("height", h + m.top + m.bottom)
        .append("g")
        .attr("transform", "translate(" + p_w/2 + "," + p_h/2 + ")");

var color = d3.scaleOrdinal(['#e41a1c','#377eb8','#4daf4a']);

var pie = d3.pie()
    .sort(null)
    .value(function(d) {
      return d.Total;
    });

// var path = d3.arc()
//     .outerRadius(radius - 10)
//     .innerRadius(0);

// var label = d3.arc()
//     .outerRadius(radius - 40)
//     .innerRadius(radius - 40);

var getPCFStats = function (county, pcf, data) {
  var stats;
  data.forEach(function(d) {
    if(d.County == county) {
      // console.log("county = " + county);
      // console.log("d = " + d.CollisionFactor[pcf]);
      // console.log(d.CollisionFactor);
      stats = d.CollisionFactor[pcf];
    }
  });
  return stats;
}

var updatePie = function (data) {
  pie_svg.selectAll(".arc")
    .remove()

  var arc = g.selectAll(".arc")
    .data(pie(data))
    .enter().append("g")
      .attr("class", "arc");

  // arc.append("path")
  //     .attr("d", path)
  //     .attr("fill", function(d) { return color(d.data.age); });

  // arc.append("text")
  //     .attr("transform", function(d) { return "translate(" + label.centroid(d) + ")"; })
  //     .attr("dy", "0.35em")
  //     .text(function(d) { return d.data.age; });

};

// global
var injuryData;
d3.queue()
  .defer(d3.json, "data/pcfInjuryFatalStats.json")
  .awaitAll(function(error, results) {
    injuryData = results[0];

    console.log(injuryData);
    console.log(injuryData[0].CollisionFactor["Automobile Right of Way"]);
    console.log(getPCFStats("Los Angeles", "DUI", injuryData));

  });

// d3.json("data/pcfInjuryFatalStats.json", function(d) {
//   d.population = +d.population;
//   return d;
// }, function(error, data) {
//   if (error) throw error;

//   console.log(data);

//   var arc = g.selectAll(".arc")
//     .data(pie(data))
//     .enter().append("g")
//       .attr("class", "arc");

//   arc.append("path")
//       .attr("d", path)
//       .attr("fill", function(d) { return color(d.data.age); });

//   arc.append("text")
//       .attr("transform", function(d) { return "translate(" + label.centroid(d) + ")"; })
//       .attr("dy", "0.35em")
//       .text(function(d) { return d.data.age; });
// });
