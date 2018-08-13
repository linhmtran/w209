var selectedCounty = "CA_STATE";
var dayText = ["Sunday","Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var hourText = ["12am","1am", "2am", "3am", "4am", "5am", "6am", "7am", "8am", "9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm", "7pm", "8pm", "9pm", "10pm", "11pm"];

function getDayName(dayNum){
  return dayText[dayNum-1];
}
function getTime(timeNum){
  return hourText[timeNum];
}

var updateheatmapChart = function(data1, data2, selectedCounty) {

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
  data = data1.filter(function(item){
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
      legendElementWidth = gridSize*2;
      days = ["Su","Mo", "Tu", "We", "Th", "Fr", "Sa"],
      times = ["12a","1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12p", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p"];

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

    var tile = svg_heat.selectAll(".hour")
        .data(data, function (d) {return d.day+':'+d.hour} );

    tile.append("title");

    tile.enter().append("rect")
        .attr("x", function (d) {return ((d.hour)*gridSize)})
        .attr("y", function (d) {return ((d.day-1)*gridSize)})
        .attr("rx",4)
        .attr("ry",4)
        // .attr("class", "hour bordered")
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
        .on("mousedown", function(d){
          // console.log(document.getElementById("top5preview").checked);
          if (document.getElementById("top5preview").checked==true){
          d3.selectAll("rect")
            .style("stroke-width",0);
          d3.select(this)
            .style("stroke","salmon")
            .style("stroke-width",3);
          whenFacetFactors(data2,selectedCounty,d.day,d.hour);
        }
        })
        .merge(tile)
          .transition()
          .duration(1000)
        .style("fill", function (d) {return colorScale(d.value)})



    tile.select("title").text(function (d) {return d.value} );

    tile.exit().remove();

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

    updateheatmapChart(dateTimeData,dateTime_factorData,selectedCounty);
}

// function setSelectedIndex(s, i){
//   s.options[i-1].selected = true;
//   return;
//
// }

// draw top 5 FACTORS
function whenFacetFactors(data,county,day,hour){
  d3.select("div#heatmap").select("svg#top5factors").remove();
  console.log(data);
  // filter data on the county, date, time
  data = data.filter(function(item){
    return (item.County===county);
  });
  data = data.filter(function(item){
    return (item.day===day);
  });
  data = data.filter(function(item){
    return (item.hour===hour);
  });
  var top5 = data.sort(function(a, b) { return a.records < b.records ? -1 : 1; })
                .slice(Math.max(data.length - 5, 1));
  console.log(top5);

  var margin = {top: 20, right: 20, bottom: 120, left: 120},
      width = 400 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

  var y = d3.scaleBand()
            .range([height, 0])
            .padding(0.1);

  var x = d3.scaleLinear()
            .range([0, width]);

  var svg = d3.select("div#heatmap").append("svg")
      .attr("id","top5factors")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    x.domain([0, d3.max(top5, function(d){ return d.records; })])
    y.domain(top5.map(function(d) { return d.factor; }));

    // append the rectangles for the bar chart
    var bars = svg.selectAll(".bar")
        .data(top5)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("width", function(d) {return x(d.records); } )
        .attr("y", function(d) { return y(d.factor); })
        .attr("height", y.bandwidth())
        .attr("fill","steelblue");

    bars.exit().remove();

    // add the x Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(5));

    // add the y Axis
    svg.append("g")
        .call(d3.axisLeft(y));

    svg.append("text")
        .attr("x", (width / 2))
        // .attr("y", 0 - (margin.top / 2))
        .attr("y", 3 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Top Factors for " + selectedCounty);

    svg.append("text")
        .attr("x", (width / 2))
        // .attr("y", 0 - (margin.top / 2))
        .attr("y", height + (margin.bottom/2))
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Count of Records for " + getDayName(day) + " at " + getTime(hour));
}

// load the dataset
d3.queue()
	.defer(d3.json, "data/countyDateTimeStats.json")
  .defer(d3.json, "data/countyDateTime_PcfStats.json")
	.awaitAll(function (error, results) {
		if (error) throw error;

    dateTimeData = results[0];
    dateTime_factorData = results[1]

    populateSelect(dateTimeData);
    updateheatmapChart(dateTimeData,dateTime_factorData,selectedCounty);
});
