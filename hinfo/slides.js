// Use this on windows to prune to just jpg files and maintiain file structure:  ROBOCOPY F:\Pictures F:\Pictures_Only *.jpg /S
// Images must be preloaded.  Limit to around 200 so it fits on small memory browsers.  Randomize when loading, parent page will periodically reload itself.

var slidecount1    =    200
var slidelist      = 'picture_index.txt'
//var slideshowspeed = 3000  // slide speed set in css animation

var slideimages
var slidelabels

// This function requires an index file of all the photos.  This way we can keep origional dir structure and file names
var pic_list = new Array();
function read_list(search_string) {
    console.log("Loading slidelist");
    $.ajax({
	type:'GET',
	async: false,
	url: slidelist,
	data: {},
	success: function(data) {pic_list = data.split('\n');},
        error: function(jqXHR, textStatus, errorThrown) {console.log("slides error: " + errorThrown);}
    });
}

var whichimage
function search_list(search_string) {
    var pic_list2 = new Array();
    if (search_string == "") {
	console.log("db1");
	pic_list2 = pic_list
    }
    else {
	console.log("db2 "+search_string);
	search_regex = new RegExp(search_string, "i")
	for (i=0; i < pic_list.length; i++) {
            if (pic_list[i].match(search_regex)) {
		pic_list2.push(pic_list[i])
            }
	}
    }
    var slidecount2 = pic_list2.length
    slideimages = new Array()
    slidelabels = new Array()
    console.log("Slide count: " + slidecount2)
    for (i=0; i<slidecount1; i++) {
	if (i > slidecount2) {break}
	var j = Math.floor((Math.random() * slidecount2) + 1)
	slideimages[i] = new Image()
	var pic = pic_list2[j].replace("/var/www/html/", "")
	slideimages[i].src = "/" + pic
	slidelabels[i]     = pic.replace("Pictures/", "")
//	console.log("i=" + i + " j=" + j + " p=" + pic_list2[j]);
    }
    whichimage = 1
}

read_list();
search_list("");

// This older version requires flat dir of all photos, named numerically: 1.jpg .> nnn.jpg
//function loadit_old() {
//   for (i=0; i<slidecount1; i++) {
//	var j = Math.floor((Math.random() * slidecount2) + 1);
//	slideimages[i] = new Image()
//	slideimages[i].src = "./i/" + j + ".jpg"
//  }
//}

function slideit() {
//  console.log("debug2: " + whichimage);
    if (++whichimage > slideimages.length-1) { whichimage = 1 }
    slide_photo();
    console.log("db slideit " + whichimage + slideimages[whichimage].src);
//  setTimeout("slideit()",slideshowspeed)

}

function slide_photo() {
    document.images.myslide.src = slideimages[whichimage].src
    slide_label.innerHTML = "<center>" + slidelabels[whichimage] + "</center>";
}

// Pause slideshow.  If clicked when already paused, show previous photo
var slide_pause_timer;
var class_prev;
function slide_pause(key) {
    var class_current = document.getElementById("slide_container").className
    if (class_current  == "paused") {
	if (key == 'left') {
	    if (--whichimage < 0) { whichimage = slideimages.length-1 }
	}
	else {
	    if (++whichimage > slideimages.length-1) { whichimage = 0 }
	}
	slide_photo();
    }
//  console.log("slide: " + whichimage + key);
    document.getElementById("slide_container").className = "paused";
    clearTimeout(slide_pause_timer);
    slide_pause_timer = setTimeout("slide_resume()",30000)
}
function slide_resume() {
    console.log("debug class_prev: " + class_prev);
    document.getElementById("slide_container").className = class_prev;
}
function slide_hide() {
    clearTimeout(slide_pause_timer);
    document.getElementById("slide_container").className = "hide";
}

// Random order ... eventually gets stuck on one slide??  Randomize on page load instead.
//function slideit_old() {
//    var i = Math.floor((Math.random() * slidecount1) + 1);
//    document.images.myslide.src = slideimages[i].src
//    setTimeout("slideit()",slideshowspeed)
//}

// next slide slide when css animation is done
document.addEventListener('DOMContentLoaded', function () {
//  console.log("debug 1: this is %o,  host is %s", this,  location.host);
    var anim = document.getElementById("slide_container");
    anim.addEventListener("animationiteration", slideit);
    slideit();
});

var lastkey;
document.onkeydown = function(event) {
    var e = event.keyCode;
    if (e == lastkey) return;
    lastkey = e;

// Store current class, if it is a slideshow class like slide1 or slide2, so we can restore if needed
    var class_current = document.getElementById("slide_container").className
    if (class_current.match("slide")){	class_prev = class_current }

    var key;
    if (e == 37) key = 'left';
    if (e == 38) key = 'up';
    if (e == 39) key = 'right';
    if (e == 40) key = 'down';
    if (e == 13) key = 'enter';
//  console.log("debug1 key: " + e + key);
    if (key == 'left')  slide_pause(key);
    if (key == 'right') slide_pause(key);
    if (key == 'down')  slide_hide();
    if (key == 'up')    slide_resume();
    if (key == 'enter') search_slides();
    lastkey = '';
}

function search_slides () {
    var search_text = document.getElementById("search_text_id").value;
    search_list(search_text);
}

