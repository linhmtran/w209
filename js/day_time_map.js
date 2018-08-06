var margin = { top: 50, right: 0, bottom: 100, left: 30 },
    width = 960 - margin.left - margin.right,
    height = 430 - margin.top - margin.bottom,
    gridSize = Math.floor(width / 24),
    legendElementWidth = gridSize*2,
    buckets = 9,
    colors = ['#f7fbff','#deebf7','#c6dbef','#9ecae1','#6baed6','#4292c6','#2171b5','#08519c','#08306b'],
    days = ["Su","Mo", "Tu", "We", "Th", "Fr", "Sa"],
    times = ["12a","1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12a", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p"];
    datasets = ["data/dayTimeAll.tsv"];

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

var type = function (d) {
  return {
    day: +d.day,
    hour: +d.hour,
    value: +d.value
  };
};

var heatmapChart = function(tsvFile) {
  d3.tsv(tsvFile, type, function (error, data) {
    console.log(data);
    var colorScale = d3.scaleQuantile()
      .domain([0, buckets - 1, d3.max(data, function (d) {return d.value} )])
      .range(colors);

    var cards = svg_heat.selectAll(".hour")
        .data(data, function (d) {return d.day+':'+d.hour} );

    cards.append("title");

    cards.enter().append("rect")
        .attr("x", function (d) {return ((d.hour) * gridSize)})
        .attr("y", function (d) {return ((d.day) * gridSize)})
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("class", "hour bordered")
        .attr("width", gridSize-1)
        .attr("height", gridSize-1)
        .style("fill", colors[0])
      .merge(cards)
        // .transition()
        // .duration(1000)
        .style("fill", (d) => colorScale(d.value));

    cards.select("title").text(function (d) {return d.value} );

    cards.exit().remove();

    var legend = svg_heat.selectAll(".legend")
        .data([0].concat(colorScale.quantiles()), function (d) {return d} );

    var legend_g = legend.enter().append("g")
        .attr("class", "legend");

    legend_g.append("rect")
      .attr("x", function (d, i) {return legendElementWidth * i} )
      .attr("y", height)
      .attr("width", legendElementWidth)
      .attr("height", gridSize / 2)
      .style("fill", function (d, i) {return colors[i]} );

    legend_g.append("text")
      .attr("class", "mono")
      .text(function (d) {return "≥ " + Math.round(d)} )
      .attr("x", function(d, i) {return legendElementWidth * i} )
      .attr("y", height + gridSize);

    legend.exit().remove();
  });
};

heatmapChart(datasets[0]);

var datasetfilter = d3.select("div#dataset-filter")
  .selectAll(".dataset-button")
  .data(datasets);

datasetfilter.enter()
  .append("input")
  .attr("value", function (d) {return "filter: " + d} )
  .attr("type", "button")
  .attr("class", "dataset-button")
  .on("click", function (d) {heatmapChart(d)} );
