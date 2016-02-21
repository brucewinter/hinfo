var cameraspeed =  4000

function refreshCameras() {

    return; // disable camera

//  var r = document.getElementById("camera1_container");
    var r = $('.camera1 img');
    var h = camera_url + '&i=' + Math.random()*1000;  // Add a random number to the url to avoid cached 
    r.attr('src', h);
    setTimeout(refreshCameras, cameraspeed);
}

refreshCameras();
