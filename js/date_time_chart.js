var selectedCounty = "CA_STATE";
// var months = [
//   'January',
//   'February',
//   'March',
//   'April',
//   'May',
//   'June',
//   'July',
//   'August',
//   'September',
//   'October',
//   'November',
//   'December']
//
// var monthFilter = function(months){
//   // create a slider for month of year
// }

var updateheatmapChart = function(data,selectedCounty) {

  if (selectedCounty==="CA_STATE"){
    var countyToolTip = "All CA Counties";
    console.log("Date-Time Heatmap filtered On:");
    console.log(selectedCounty);
  } else {
    var selectedCounty = selectedCounty + " County";
    var countyToolTip = selectedCounty;
    console.log("Date-Time Heatmap filtered On:");
    console.log(selectedCounty)
  }

  // filter the data
  data = data.filter(function(item){
    return item.County===selectedCounty;
  });
  console.log(data);

  // clear contents to redraw
  d3.select("div#heatmap").selectAll("*").remove();

  // Creat Chart Area and Labels
  var margin = { top: 50, right: 0, bottom: 100, left: 30 },
      width = 960 - margin.left - margin.right,
      height = 430 - margin.top - margin.bottom,
      gridSize = Math.floor(width / 24),
      legendElementWidth = gridSize*2,
      days = ["Su","Mo", "Tu", "We", "Th", "Fr", "Sa"],
      times = ["12a","1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12a", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p"];

  var svg_heat = d3.select("div#heatmap").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("id","svgheat")
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var dayLabels = svg_heat.selectAll(".dayLabel")
      .data(days)
      .enter().append("text")
        .text(function (d) { return d; })
        .attr("x", 0)
        .attr("y", function (d, i) {return (i * gridSize) })
        .style("text-anchor", "end")
        .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
        .attr("class", function (d, i) {((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis")} );

  var timeLabels = svg_heat.selectAll(".timeLabel")
      .data(times)
      .enter().append("text")
        .text(function (d) { return d; })
        .attr("x", function (d, i) {return (i * gridSize) })
        .attr("y", 0)
        .style("text-anchor", "middle")
        .attr("transform", "translate(" + gridSize / 2 + ", -6)")
        .attr("class",function (d, i) {((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis")});

  	var div = d3.select("div#heatmap").append("div")
  	.attr("class", "tooltip")
  	.style("opacity", 0);

    var colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(data, function (d) {return d.value} )]);

    var cards = svg_heat.selectAll(".hour")
        .data(data, function (d) {return d.day+':'+d.hour} );

    cards.append("title");

    cards.enter().append("rect")
        .attr("x", function (d) {return ((d.hour)*gridSize)})
        .attr("y", function (d) {return ((d.day-1)*gridSize)})
        .attr("rx",4)
        .attr("ry",4)
        .attr("class", "hour bordered")
        .attr("width", gridSize-1)
        .attr("height", gridSize-1)
        .style("fill", "white")
        .on("mouseover", function(d) {
      			div.transition()
      		.duration(200)
      		.style("opacity", 0.9);
      			div.html(countyToolTip  + "<br/>" +
              "Accident Count: " + numberWithCommas(d.value))
      		.style("left", (d3.event.pageX) + "px")
      		.style("top", (d3.event.pageY) + "px")
      	})
      	.on("mouseout", function(d) {
      			div.transition()
      			.duration(500)
      			.style("opacity", 0);
      	})
        .merge(cards)
          .transition()
          .duration(1000)
        .style("fill", function (d) {return colorScale(d.value)})



    cards.select("title").text(function (d) {return d.value} );

    cards.exit().remove();

    // Add a legend for the color values.
    var legend = svg_heat.selectAll(".legend")
        .data(colorScale.ticks(6).slice(1));
    var legend_g = legend.enter().append("g")
        .attr("class", "legend");

    legend_g.append("rect")
        .attr("x", function (d, i) {return legendElementWidth * i} )
        .attr("y", height)
        .attr("width", legendElementWidth)
        .attr("height", gridSize / 2)
        .style("fill", colorScale);

    legend_g.append("text")
        .attr("x", function (d, i) {return legendElementWidth * i})
        .attr("y", height + gridSize - 6)
        .attr("dy", ".35em")
        .text(String);

    svg_heat.append("text")
        .attr("class", "label")
        .attr("x", 0)
        .attr("y", height + gridSize + 8)
        .attr("dy", ".35em")
        .text("Number of Collisions");

    legend.exit().remove();
};

function populateSelect(data) {
    var counties = [];
    data.forEach(function(item){
      if(!counties.includes(item.County)){
        counties.push(item.County);
      };
    });
    // console.log(counties);

    var ele = document.getElementById('selectedCounty');
    for (var i = 0; i < counties.length; i++) {
        // POPULATE SELECT ELEMENT WITH JSON.
        ele.innerHTML = ele.innerHTML +
            '<option value="' + counties[i] + '">' + counties[i] +'</option>';
    }
}

function filterCounty(element) {
    selectCounty((element.value).replace(' County', ''));
    console.log(selectedCounty);

    updatePCFGraph(pcfStats);
    // info.update(selectedCounty);

    // need to parse out the "county"

    updateheatmapChart(dateTimeData,selectedCounty);
}

function setSelectedIndex(s, i){
  s.options[i-1].selected = true;
  return;

}

// load the dataset
d3.queue()
	.defer(d3.json, "data/countyDateTimeStats.json")
	.awaitAll(function (error, results) {
		if (error) throw error;

  dateTimeData = results[0];

  populateSelect(dateTimeData);
  updateheatmapChart(dateTimeData,selectedCounty);
});
