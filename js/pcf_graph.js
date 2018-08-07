// needs global selectedCounty
var selectedCounty = 'CA_STATE';
var selectedPCF;
// var injuryData;

// pareto chart svg
//Set dimensions
var pcf_m = { top: 50, right: 50, bottom: 120, left: 70 }, pcf_h = 550 - pcf_m.top - pcf_m.bottom, pcf_w = 500 - pcf_m.left - pcf_m.right, pcf_barWidth = 5;

//Draw svg
var pcf_svg = d3.select('#pcf_graph').append('svg')
        .attr('width', pcf_w + pcf_m.left + pcf_m.right)
        .attr('height', pcf_h + pcf_m.top + pcf_m.bottom)
        .append('g')
        .attr('transform', 'translate(' + pcf_m.left + ',' + pcf_m.top + ')');

//Axes and scales
var pcf_xScale = d3.scaleBand()
.range([0, pcf_w])
.round(0.1);
// set the domain later when we get the data

var pcf_yScale = d3.scaleLinear()
.range([pcf_h, 0]);

var pcf_xAxis = d3.axisBottom()
          .scale(pcf_xScale);

var pcf_yAxis = d3.axisLeft()
          .scale(pcf_yScale);

//Draw axes
pcf_svg.append('g')
.attr('class', 'x axis')
.attr('transform', 'translate(0,' + pcf_h + ')')
.call(pcf_xAxis);

pcf_svg.append('g')
.attr('class', 'y axis')
.call(pcf_yAxis);

// get collision counts/types for the global selectedCounty
var getCountyCollisions = function (data) {
  var c_search = 'Total';
	if (selectedCounty != "") {
		c_search = selectedCounty;
	}
	var cData;
	// console.log(pcfStats);
	data.forEach(function (d) {
		if (d.County == c_search) {
	  		cData = d.CollisionFactor;
		}
	})
	return cData;
}

// get the max number of collisions of any type for the global selectedCounty
var getMaxCollisionTypeValue = function(data) {
	// var c_search = "Total";
	// if (selectedCounty != "") {
	// 	 c_search = selectedCounty;
	// }
	var vMax = 0;
	var cData = getCountyCollisions(data);
	Object.keys(cData).forEach(function (key) {
	// console.log(cData[key])
		if (vMax < cData[key]) {
		  		vMax = cData[key];
			}
	});
	// console.log("max = " + vMax);
	return vMax;
}

var updatePCFGraph = function(data) {
	// clear title and labels
	pcf_svg.selectAll("text")
		.remove()

	// county data
	// console.log(pcfStats);
	var countyData = getCountyCollisions(data);

	// update bar width for number of collision types
	pcf_barWidth = pcf_w/Object.keys(countyData).length;

	// update domain y axis
	pcf_yScale.domain([0, getMaxCollisionTypeValue(data)]);

	// update domain x axis
	pcf_xScale.domain(Object.keys(countyData).map(function(d) {
		// console.log ("x domain " + d)
		return d;
	}));

	// define the tooltip
	var div = d3.select("#pcf_graph").append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);

	//select all bars on the graph, take them out, and exit the previous data set.
	//then you can add/enter the new data set
	var pcf_bars = pcf_svg.selectAll(".bar")
	.remove()
    .exit()
    .data(Object.keys(countyData))
	//now actually give each rectangle the corresponding data
	pcf_bars.enter()
	.append("rect")
	.attr("class", "bar")
	.attr("x", function(d, i) {
  		return pcf_xScale(d) + 2;
	})
	.attr("y", function(d, i) {
  		return pcf_yScale(countyData[d]);
	})
	.attr("height", function(d, i) {
  		return pcf_h - pcf_yScale(countyData[d]);
	})
	.attr("width", pcf_barWidth-4)
	.attr("fill", "steelblue")
    .on("mouseover", function(d) {
			div.transition()
		.duration(200)
		.style("opacity", 0.9);
			div.html("Collision Factor: " + d + "<br/>" +
      			 "Number of Collisions: " + countyData[d])
		.style("left", (d3.event.pageX) + "px")
		.style("top", (d3.event.pageY) + "px")
	})
	.on("mouseout", function(d) {
			div.transition()
			.duration(500)
			.style("opacity", 0);
	})
	.on("click", function(d) {
		console.log("click = " + d);
    	selectedPCF = d;
		updateRiskBarGraph(injuryData);

		// change color for selected pcf
		pcf_svg.selectAll("rect")
			.attr("fill", function(d) {
	          if (d === selectedPCF) {
	            return "salmon";
	          }
	          return "steelblue";
	        });
	});

	// update axes
	pcf_svg.selectAll("g")
		.remove()
	pcf_svg.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + pcf_h + ")")
	    .call(pcf_xAxis)
	    .selectAll("text")
	    	.style("text-anchor", "end")
	    	.attr("dx", "-.8em")
	    	.attr("dy", ".15em")
	    	.attr("transform", "rotate(-45)");

	pcf_svg.append("g")
	    .attr("class", "y axis")
	    .call(pcf_yAxis)
	    .append("text")
		    .attr("transform", "rotate(-90)")
		    .attr("y", 6)
		    .attr("dy", ".71em")
		    .style("text-anchor", "end");

	// title showing county selection
	pcf_svg.append("text")
		.attr("transform", "translate(" + pcf_w/2 + ",-" + pcf_m.top/2 + ")")
		.style("text-anchor", "middle")
		.style("font-size", "14px")
		.style("text-decoration", "bold")
		.text("Number of Collisions by Causes for Selected Region: " + selectedCounty);

	// y axis label
	pcf_svg.append("text")
		.attr("transform", "translate(-50," + (pcf_h/2 + pcf_m.top) + ") rotate(-90)")
		.text("Number of Collisions");
	// x axis label
	pcf_svg.append("text")
		.attr("transform", "translate(" + (pcf_w/2 - pcf_m.left) + "," + (pcf_h + pcf_m.bottom - 5) + ")")
		.text("Primary Collision Factor");

} // end updatePCFGraph

// load the dataset
d3.queue()
	.defer(d3.json, "data/countyPcfStats.json")
	.awaitAll(function(error, results) {
		if (error) throw error;

  		pcfStats = results[0];
  		//console.log(pcfStats);
  		updatePCFGraph(pcfStats);
});
