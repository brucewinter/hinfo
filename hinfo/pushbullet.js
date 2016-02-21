
var websocket1;

// Make sure websocket is always open ... restart if needed
function pb_websocket() {
    console.log("db pb websocket check:" + websocket1 + ".");
    if (websocket1 == null) {
	pb_setup();
    }
    setTimeout("pb_websocket()", 60000)
}

// Debug with http://jsfiddle.net/pushbullet/u92DA/
function pb_setup() {
    console.log("db pb_setup " + websocket1 + ".");
    if (websocket1 != null) {
        websocket1.close();
        console.log("db pb websocket null");
    }
    websocket1 = new WebSocket('wss://stream.pushbullet.com/websocket/' + pb_key);
    websocket1.onopen = function(e) {
        console.log("db pb websocket open");
	pb_update();
    }
    websocket1.onmessage = function(e) {
	var msg = JSON.parse(e.data);
//      console.log("db pb websocket message" + msg);
	if (msg.type == 'tickle' && msg.subtype == 'push' ) {
	    pb_update();
	}
    }
    websocket1.onerror = function(e) {
	console.log("db pb websocket error: " + e.data);
    }
    websocket1.onclose = function(e) {
	console.log("db pb websocket close: " + e.code);
	websocket1 = null;
    }
}


// Not sure how to target just this 'device_ident'.  For now, must push to all devices for this to work   
// Example responseText
//{"active":true,"iden":"ujvabP5zvSCsjz75FtmGdw","created":1.453219745895587e+09,"modified":1.4532197459005928e+09,"type":"note","dismissed":false,"direction":"self","sender_iden":"ujvabP5zvSC","sender_email":"brucewinter@gmail.com","sender_email_normalized":"brucewinter@gmail.com","sender_name":"Bruce Winter","receiver_iden":"ujvabP5zvSC","receiver_email":"brucewinter@gmail.com","receiver_email_normalized":"brucewinter@gmail.com","title":"Speech_Container","body":"10:09 AM: hi 7"},

function pb_update() {
    var xhr = new XMLHttpRequest()
    xhr.open("GET", "https://api.pushbullet.com/v2/pushes?modified_after=0&limit=2", false)
    xhr.setRequestHeader("Access-Token", pb_key)
    xhr.send()
    var msg = JSON.parse(xhr.responseText);
    var t = msg.pushes[0].body.match(/([^]+) Speech\:(.+)/);
    console.log("db pb update: ");
    data_container.innerHTML   = t[1];
    speech_container.innerHTML = t[2];
}

pb_websocket();
