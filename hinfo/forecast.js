
function forecast1() {
    $.simpleWeather({
	woeid: '2364559',
	location: '',
	unit: 'f',
	success: function(weather) {
	    html = '<pre>';
	    for(var i=0; i<weather.forecast.length; i++) {
		html += weather.forecast[i].day + ': ' + weather.forecast[i].high + '/' + weather.forecast[i].low + ' ' + weather.forecast[i].text + '<br>';
	    }
	    html += '</pre>';
	    $("#myforecast").html(html);
	    console.log("db forecast: " + html);
	},
	error: function(error) {
	    $("#myforecast").html('<p>'+error+'</p>');
	}
    })
    setTimeout("forecast1()", 1000*60*60*1)
}

forecast1();
