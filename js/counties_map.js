// global variables, shared with other viz's
var selectedCounty = "CA_STATE";

// global pcfStats
var pcfStats;

// global used here
var map;
var info;
var map_legend;
// var mapType = "PerCapita";
var mapType = "Counts";

function selectCounty(c) {
// county is already selected, so deselect it
// if (c == selectedCounty) {
//   selectedCounty = "CA_STATE";
// }
// else {
// 	selectedCounty = c;
// }
	selectedCounty = c;
}

function numberWithCommas(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// load the county statistics dataset
// load the pcf data statistics but graph updates are on other js file
d3.queue()
	.defer(d3.json, "data/countyMapStats.json")
	// .defer(d3.json, "data/countyPcfStats.json")
	.awaitAll(function(error, results) {
		if (error) throw error;

  	countyStats = results[0];
  	// pcfStats = results[1];

  	function getMaxPerCap() {
  		var vMax = 0;
		countyStats.forEach(function (d) {
			if (d["Collisions per Capita 10k"] > vMax) {
    			vMax = d["Collisions per Capita 10k"];
			}
    	});
		return vMax;
	}

	function getMaxCollision() {
  		var vMax = 0;
		countyStats.forEach(function (d) {
			if (d["Collisions"] > vMax) {
    			vMax = d["Collisions"];
			}
    	});
		return vMax;
	}

  	function getCollisionsPerCap(county) {
	    var val;
	    countyStats.forEach(function (d) {
	    	if(d.County == county) {
	     		val = parseFloat(d["Collisions per Capita 10k"]).toFixed(2);
	      	}
	    });
	    return val;
  	}

	var getCollisions = function(county) {
		var val;
	    countyStats.forEach(function (d) {
	    	if(d.County == county) {
	        	val = d.Collisions;
	      	}
	    });
	    return val;
	}

	// ---------------------------------------------------------------------
	// basic map
	// ---------------------------------------------------------------------
	map = L.map("map").setView([37.52, -119.75], 6);

  	L.tileLayer(
    	"https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWdpbi11Y2IiLCJhIjoiY2pqeDBzY2V2MGgxZTNrcGY0MGN4eG1yMCJ9.0uBmbB53AJDLkfDfZibMyQ",
    	{
      		maxZoom: 12,
       		id: "mapbox.light"
    	}
  	).addTo(map);

	// ---------------------------------------------------------------------
	// info box
	// ---------------------------------------------------------------------
    // control that shows state info on hover
	info = L.control();
	info.onAdd = function() {
	    this._div = L.DomUtil.create("div", "info");
	    this.update();
	    return this._div;
	};

	// control that shows county info on hover
	var info = L.control();

	info.onAdd = function (map) {
	    this._div = L.DomUtil.create('div', 'info');
	    this.update();
	    return this._div;
	};

	info.update = function (name) {
    	this._div.innerHTML = (name ?
    	'<b>' + name + '</b><br />' + getCollisionsPerCap(name) + ' collisions per 10,000 population' +
    	'<br />' + numberWithCommas(getCollisions(name)) + ' collisions '
    	: 'Click on a county');
  	};

	info.addTo(map);

	// multi-hue
	// var colorlist = ['#ffffcc','#ffeda0','#fed976','#feb24c','#fd8d3c','#fc4e2a','#e31a1c','#bd0026','#800026'];
	// single-hue reds
	// var colorlist = ['#fff5f0','#fee0d2','#fcbba1','#fc9272','#fb6a4a','#ef3b2c','#cb181d','#a50f15','#67000d'];
	// single-hue blue
	var colorlist = ['#f7fbff','#deebf7','#c6dbef','#9ecae1','#6baed6','#4292c6','#2171b5','#08519c','#08306b'];
	//var colorlist = ['#ffffb2','#fecc5c','#fd8d3c','#f03b20','#bd0026'];
	var colorScale = d3.scaleThreshold()
		// .domain([0, 450])
		.range(colorlist);

	var getColor = function(county) {
		if (mapType == "Counts") {
			return colorScale(getCollisions(county));
		}
		else {
			return colorScale(getCollisionsPerCap(county));
		}
	}

	function style(feature) {
	    return {
	    	weight: 2,
	      	opacity: 1,
	      	color: 'white',
	      	dashArray: '3',
	      	fillOpacity: 0.7,
	      	fillColor: getColor(feature.properties.name)
	    };
	}

	function highlightFeature(e) {
	    var layer = e.target;
	    layer.setStyle({
	    	weight: 5,
	      	color: '#666',
	      	dashArray: '',
	      	fillOpacity: 0.7
	    });

	    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
	    	layer.bringToFront();
	    }

	    // info.update(layer.feature.properties);
	  }

	var geojson;

	function resetHighlight(e) {
	    geojson.resetStyle(e.target);
	    // info.update();
	}

	function whenClicked(e) {
	    selectCounty(e.target.feature.properties.name);

	    // console.log(pcfStats);
	    updatePCFGraph(pcfStats);
	    info.update(e.target.feature.properties.name);
	}

	function onEachFeature(feature, layer) {
	    layer.on({
	      	mouseover: highlightFeature,
	      	mouseout: resetHighlight,
	      	click: whenClicked
	    });
	}

	geojson = L.geoJson(countyGeoData, {
	    style: style,
	    onEachFeature: onEachFeature
	}).addTo(map);

	// ---------------------------------------------------------------------
	// legend box
	// ---------------------------------------------------------------------
	var map_legend = L.control({position: 'bottomleft'});
	map_legend.onAdd = function (map) {
		this._div = L.DomUtil.create("div", "info legend");
    	return this._div;
	};

	map_legend.update = function() {
		// console.log("Updating legend.");

		var cMax;
		var labels = [];
    	if (mapType == "Counts") {
    		cMax = getMaxCollision();
    		var grades = [0, 100, 500, 1000, 2000, 5000, 10000, 50000, 100000];
    		colorScale.domain(grades);
    		for (var i = 0; i < grades.length; i++) {
    			var from = grades[i];
    			var to = grades[i+1];
    			labels.push(
	       			'<i style="background:' + colorlist[i] + '"></i> ' +
	        		from + (to ? '&ndash;' + to : '+'));
    		}
    	}
    	else {
    		cMax = getMaxPerCap();
    		var grades = [0, 50, 100, 150, 200, 250, 300, 350, 400];
    		colorScale.domain(grades);
    		for (var i = 0; i < grades.length; i++) {
    			var from = grades[i];
    			var to = grades[i+1];
    			labels.push(
	       			'<i style="background:' + colorlist[i] + '"></i> ' +
	        		from + (to ? '&ndash;' + to : '+'));
    		}
    	}
	    this._div.innerHTML = labels.join("<br>");
	};

	map_legend.addTo(map);
	map_legend.update();
	geojson.setStyle(style);

	// update on radio buttons
	d3.selectAll(".radioButton")
		.on("change",function() {
				// console.log("adjusting heatmap");
				// heat map using counts
				if (document.getElementById('r1').checked) {
					mapType = "Counts";
			}
			// heat map using perCapita
			else {
				mapType = "PerCapita";
			}
			map_legend.update();
			geojson.setStyle(style);
			});

	d3.selectAll(".resetButton")
		.on("click", function() {
			// console.log("reset click");
			selectCounty("CA_STATE");
			updatePCFGraph(pcfStats);
			updateRiskBarGraph(injuryData);
			info.update("");
		})

	// initial load of pcf graph
	updatePCFGraph(pcfStats);
});
