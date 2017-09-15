var loadCount1 = 0;
var loadCount2;
var series = [];
var lasttime = moment();
var refresh = 0;
var graph;
var feed;
var channels;
var days_ago = 0;
var days_len = 1.0;
var scale_solar = 0;
var reload_time = 1000*3600*8;  // Periodic page refresh

//  plotit('12256388', '1_Power,1_Temperature_Out,1_Temperature_Up,1_Temperature_Down,2_Humidity_Out,2_Humidity_Up,2_Humidity_Down'); 
//  plotit('1389033602', 'Temperature2,Temperature3');

function plotit(a1, a2) {
    feed     = a1;
    channels = a2;
    if (channels.search(/temp/i) > -1) {scale_solar = 1}
    setInterval(function(){loadRefresh()}, 1000*60*2); // xively refresh
//    date_form.days_ago.value = days_ago;
//    date_form.days_len.value = days_len;
    loadLoop();
    setTimeout(function(){window.location.reload(true)},  reload_time);  // Periodic page refreshes for new photos and maybe avoid memory leaks
}

function change_days (form) {
    series = [];
    loadCount1 = 0;
    lasttime = moment();
    days_len = parseInt(form.days_len.value);
    days_ago = parseInt(form.days_ago.value);
    console.log(days_len, days_ago);
    clearGraph();
    loadLoop();
}

function loadLoop() {
    loadCount2 = days_len * 4;
    var h = 24*(days_len + days_ago) - 6*loadCount1;
//  var starttime = moment().subtract(h, "hours").fromNow();
    var starttime = moment().subtract(h, "hours").startOf('hour');
    var query = { 
	datastreams: channels,
	start: starttime.toJSON(), 
        duration: '6hours',
	interval: 120, 
	limit: 1000,
    };
    console.log(days_len, days_ago, loadCount1, loadCount2, h, query);
    xively.feed.history(feed, query, loadData); 
}

function loadRefresh() {
    var stoptime  = moment();
    var starttime = lasttime;
    var query = { 
	datastreams: channels,
	start: starttime.toJSON(), 
	stop:  stoptime.toJSON(), 
	interval: 120, 
	limit: 1000,
    };
    refresh = 1;
    xively.feed.history(feed, query, loadData); 
    var t = moment().format("h:mm");
    document.getElementById("lastupdate").innerHTML = "Updated: " + t;
}

var scale1 = d3.scale.linear().domain([40,70]).nice()
var scale2 = d3.scale.linear().domain([0,10000]).nice()

function loadData(data) {  
    var palette = new Rickshaw.Color.Palette();
    var filtedData1 = data.datastreams;

// Find channel with minimum number of datapoints ... series must have the same number of points.  zeroFill is yucky.

    for (var i1=0; i1 < filtedData1.length; i1++ ) {
	var filtedData2 = filtedData1[i1].datapoints;
	var id = filtedData1[i1].id;
	if (loadCount1 == 0) {
	    if (id == 'TempWW1') {id = 'Downstairs'}
	    if (id == 'TempWW2') {id = 'Tank1'}
	    if (id == 'TempWW3') {id = 'Tank3'}
	    if (id == 'TempWW4') {id = 'Tank2'}
	    if (id == 'TempWW5') {id = 'Tank3Bot'}

	    if (id == 'Temperature1') {id = 'Outside'}
	    if (id == 'Temperature2') {id = 'Basement'}
	    if (id == 'Temperature3') {id = 'Upstairs'}

	    if (id == 'Temp_rdeck')        {id = 'Temp_Out1'}
	    if (id == 'Temp_rtreehouse')   {id = 'Temp_Out2'}
	    if (id == 'TempHI_rtreehouse') {id = 'TempHI_Out2'}
	    if (id == 'Temp_rkitchen')     {id = 'Temp_Up'}
	    if (id == 'Temp_rdownstairs')  {id = 'Temp_Down'}
	    if (id == 'Temp_rbedroom')     {id = 'Temp_Bed'}
	    if (id == 'Humid_rdeck')       {id = 'Humid_Out1'}
	    if (id == 'Humid_rtreehouse')  {id = 'Humid_Out2'}
	    if (id == 'Humid_rkitchen')    {id = 'Humid_Up'}
	    if (id == 'Humid_rdownstairs') {id = 'Humid_Down'}
	    if (id == 'Humid_rbedroom')    {id = 'Humid_Bed'}

	    if (id == 'Power') {
		series.push({name: id, color: palette.color(), data: [], scale: scale2});
	    }
	    else {
		series.push({name: id, color: palette.color(), data: [], scale: scale1});
	    }
	}
	if (filtedData2 && filtedData2.length) {
	    for (var i2=0; i2 < filtedData2.length; i2++ ) {
		lasttime  = moment(filtedData2[i2].at);
		var date  = moment(filtedData2[i2].at).unix();
		var value = parseFloat(filtedData2[i2].value)
		if (value < 0) continue;  // Ignore bogus readings
		if (id == 'Pump') {
		    value *=  10;
		    value +=  80;
		}
		else if (id == 'Solar' && scale_solar == 1) {
		    value /= 200;
		    value +=  80;
		}
		else if (id == 'x1_Power' && scale_solar == 1) {
		    value /= 200;
		    value +=  30;
		}
		if (date) {
		    series[i1].data.push({x: date, y: value});
		}
	    }
	} 
    }	
//  console.log("refresh", refresh, loadCount1);

    if (refresh) {
	graph.update();
    }
    else if (loadCount1++ < loadCount2) {
	loadLoop();
    }
    else {
//      Rickshaw.Series.zeroFill(series);  // Will add zero values to series with missing data, otherwise plot will abort with unmatched x data.
	drawGraph(series);
    }

}

function drawGraph(data) {
//  console.log(data);
    graph = new Rickshaw.Graph( {
	element: document.getElementById("mychart"),
//	element: document.querySelector("#mychart"),
//	width:  2400,
//	height: 1400,
	min: 'auto',
//	min: 50,
	renderer: 'line',
//	renderer: 'scatterplot',

//	interpolation: 'linear',
	interpolation: 'step-after',
//	interpolation: 'cardinal',
//  	interpolation: 'basis',
//linear: straight lines between points
//step-after: square steps from point to point
//cardinal: smooth curves via cardinal splines (default)
//basis: smooth curves via B-splines
	series: data
    } );
    graph.render();

//    var slider = new Rickshaw.Graph.RangeSlider.Preview({
//  var slider = new Rickshaw.Graph.RangeSlider({
//	graph: graph,
//	element: document.getElementById('slider')
//    });

    var resize = function() {
	graph.configure({
#	    width:   .95 * window.innerWidth,
	    width:   .97 * window.innerWidth,
	    height:  .97 * window.innerHeight
	});
	graph.render();
//	slider.build();
    }

    window.addEventListener('resize', resize); 
    resize();  // For initial window

    var hoverDetail = new Rickshaw.Graph.HoverDetail( {
	graph: graph
    } );

    var legend = new Rickshaw.Graph.Legend( {
	graph: graph,
	element: document.getElementById('legend')
    } );

    var shelving = new Rickshaw.Graph.Behavior.Series.Toggle( {
	graph: graph,
	legend: legend
    } );

    var time = new Rickshaw.Fixtures.Time();
    var hours = time.unit('hour');
    var xaxis = new Rickshaw.Graph.Axis.Time( {
	timeUnit: hours,
	graph: graph
    });
    xaxis.render();
// Bummer, this does not work.   Changed in css/graph.css instead
//  $('.x_ticks text').css('opacity', '1.0');//fix text opacity
//  $('#xaxis text').css('fill', 'white');//text color

    yAxis1 = new Rickshaw.Graph.Axis.Y.Scaled({
	element: document.getElementById('yaxis1'),
	graph: graph,
	orientation: 'left',
	width: 100,
	height: 500,
	grid: true,
	scale: scale1,
	tickFormat: Rickshaw.Fixtures.Number.formatKMBT
    });
    yAxis1.render();

    yAxis2 = new Rickshaw.Graph.Axis.Y.Scaled({
	element: document.getElementById('yaxis2'),
	graph: graph,
	grid: false,
	scale: scale2,
	tickFormat: Rickshaw.Fixtures.Number.formatKMBT
    });
    yAxis2.render();

//    var smoother = new Rickshaw.Graph.Smoother( {
//	graph: graph,
//// 	element: document.querySelector('#smoother')
//    } );
//    smoother.setScale(2);


}

function clearGraph() {
  $('#legend').empty();
// $('#mychart_container').html('<div id="chart"></div><div id="timeline"></div><div id="slider"></div>');
  $('#mychart').empty();
}

xively.setKey( xively_key );  
//plotit('12256388', 'Power,Temp_Out,Temp_Up,Temp_Down,Temp_rpi1,Temp_rpi2,Temp_rpi3,Humid_Out,Humid_Up,Humid_Down');
//plotit('12256388', 'Power,Temp_rpi1,Temp_rpi2,Temp_rpi3,Temp_rpi5,Humid_rpi1,Humid_rpi5');
//plotit('156182029', 'Power,Temp_rdeck,Temp_rtreehouse,Temp_Solar,Temp_rkitchen,TempHI_rtreehouse,Temp_rbedroom,Temp_rdownstairs,Humid_rtreehouse,Humid_rkitchen,Humid_rdownstairs');
plotit('156182029', 'Power,Temp_Outside,Temp_Ceiling,Temp_Bedroom,Temp_Downstairs,Humid_Outside,Humid_Bedroom');
