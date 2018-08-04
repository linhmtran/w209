// needs global selectedCounty
var pcfStats;
var selectedCounty = "CA_STATE";

// pareto chart svg
//Set dimensions
var m = {top: 50, right: 50, bottom: 120, left: 70}
, h = 550 - m.top - m.bottom
, w = 500 - m.left - m.right
, barWidth = 5;

//Draw svg
var svg = d3.select("#pcf_graph").append("svg")
        .attr("width", w + m.left + m.right)
        .attr("height", h + m.top + m.bottom)
        .append("g")
        .attr("transform", "translate(" + m.left + "," + m.top + ")");

//Axes and scales
var xScale = d3.scaleBand()
.range([0, w])
.round(0.1);
// set the domain later when we get the data

var yScale = d3.scaleLinear()
.range([h, 0]);

// var yCumulative = d3.scaleLinear()
//             .domain([0, 1])
//             .range([h, 0]);

var xAxis = d3.axisBottom()
          .scale(xScale);

var yAxis = d3.axisLeft()
          .scale(yScale);

// var yAxis2 = d3.axisRight()
//            .scale(yCumulative);

// y axis label
// svg
// .append("text")
// .attr("transform", "translate(-50," + (h/2 + m.top) + ") rotate(-90)")
// .text("Number of Collisions");
// // x axis label
// svg
// .append("text")
// .attr("transform", "translate(" + (w/2 - m.left) + "," + (h + m.bottom - 5) + ")")
// .text("Primary Collision Factor");
// // y axis 2 label
// // svg
// // .append("text")
// // .attr("transform", "translate(" + (w + m.right) + "," + (h/2 + m.top) + ") rotate(-90)")
// // .text("Proportion of Collisions");

//Draw axes
svg.append("g")
.attr("class", "x axis")
.attr("transform", "translate(0," + h + ")")
.call(xAxis);

svg.append("g")
.attr("class", "y axis")
.call(yAxis);

// svg.append("g")
// .attr("class", "y axis")
// .attr("transform", "translate(" + [w, 0] + ")")
// .call(yAxis2);

// get collision counts/types for the global selectedCounty
var getCountyCollisions = function(data) {
	var c_search = "Total";
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
	svg.selectAll("text")
		.remove()

	// county data
	// console.log(pcfStats);
	var countyData = getCountyCollisions(data);

	// update bar width for number of collision types
	barWidth = w/Object.keys(countyData).length;

	// update domain y axis
	yScale.domain([0, getMaxCollisionTypeValue(data)]);

	// update domain x axis
	xScale.domain(Object.keys(countyData).map(function(d) {
		// console.log ("x domain " + d)
		return d;
	}));

	// define the tooltip
	var div = d3.select("#pcf_graph").append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);

	//select all bars on the graph, take them out, and exit the previous data set. 
	//then you can add/enter the new data set
	var bars = svg.selectAll(".bar")
	.remove()
    .exit()
    .data(Object.keys(countyData))
	//now actually give each rectangle the corresponding data
	bars.enter()
	.append("rect")
	.attr("class", "bar")
	.attr("x", function(d, i) {
  		return xScale(d) + 2;
	})
	.attr("y", function(d, i) {
  		return yScale(countyData[d]);
	})
	.attr("height", function(d, i) {
  		return h - yScale(countyData[d]);
	})
	.attr("width", barWidth-4)
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
	});

// draw CDF line
// var calcCumulative = function(cumulativeKey) {
// 	var currCumulative = 0;
// 	var total = 0;
// 		Object.keys(countyData).forEach(function (key) {
// 			if (xScale(key) <= xScale(cumulativeKey)) {
// 				currCumulative = currCumulative + countyData[key];
// 			}
// 			total = total + countyData[key];
// 		})
// 		// console.log("cumkey = " + cumulativeKey);
// 		// console.log("percent = " + currCumulative/total);
// 		return currCumulative/total;
// }
// 	var cdfLine = d3.line()
//     .x(function(d, i) {
//     	// console.log("d = " + d);
//    		// console.log("i = " + i);
//     	// console.log("x scale " + xScale(d))
//     	return xScale(d) + barWidth/2;
//     })
//     .y(function(d) {
//     	return yCumulative(calcCumulative(d));
// 	});

// svg.selectAll("path")
// 	.remove()
// svg.append("path")
// 	.data([Object.keys(countyData)])
// 	.attr("class", "line")
//     .attr('d', cdfLine);

	// update axes
	svg.selectAll("g")
		.remove()
	svg.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + h + ")")
	    .call(xAxis)
	    .selectAll("text")
	    	.style("text-anchor", "end")
	    	.attr("dx", "-.8em")
	    	.attr("dy", ".15em")
	    	.attr("transform", "rotate(-45)");

	svg.append("g")
	    .attr("class", "y axis")
	    .call(yAxis)
	    .append("text")
		    .attr("transform", "rotate(-90)")
		    .attr("y", 6)
		    .attr("dy", ".71em")
		    .style("text-anchor", "end");

// svg.append("g")
//     .attr("class", "y axis")
//     .attr("transform", "translate(" + [w, 0] + ")")
//     .call(yAxis2)
//     .append("text")
// 	    .attr("transform", "rotate(-90)")
// 	    .attr("y", 4)
// 	    .attr("dy", "-.71em")
// 	    .style("text-anchor", "end");
// }

	// title showing county selection
	svg.append("text")
		// .attr("x", w/2)
		// .attr("y", 0)
		.attr("transform", "translate(" + w/2 + ",-" + m.top/2 + ")")
		.style("text-anchor", "middle")
		.style("font-size", "14px")
		.style("text-decoration", "bold")
		.text("Number of Collisions by Causes for Selected Region: " + selectedCounty);

	// y axis label
	svg.append("text")
		.attr("transform", "translate(-50," + (h/2 + m.top) + ") rotate(-90)")
		.text("Number of Collisions");
	// x axis label
	svg.append("text")
		.attr("transform", "translate(" + (w/2 - m.left) + "," + (h + m.bottom - 5) + ")")
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