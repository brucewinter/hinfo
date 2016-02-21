
function startTime() {
  var t = moment().format("h:mm:ss");
  document.getElementById("clock").innerHTML = t;
  t=setTimeout('startTime()', 1500)
//  console.log("db clock: " + t);
}

startTime();
