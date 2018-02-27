var basicURL = "http://www.havenandhearth.com/mt/r/gfx/invobjs/";

var ns = "http://www.w3.org/2000/svg";
var zoomx = 1;
var zoomy = 1;
var offx = 19*zoomx;
var offy = 164*zoomy;

var modx = 1/11*zoomx;
var mody = 1/11*zoomy;

var table = document.getElementById("data");
var map = document.getElementById('mapSVG');
var opts = { theme : "light", debug : false, limit : 0 }