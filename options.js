var basicURL = "http://www.havenandhearth.com/mt/r/gfx/invobjs/";

var ns = "http://www.w3.org/2000/svg";
var zoomx = 1;
var zoomy = 1;
var offx = 19;
var offy = 164;

var modx = 1/11*zoomx;
var mody = 1/11*zoomy;

var table = document.getElementById("data");
var map = document.getElementById('mapSVG');
var opts = { theme : "light", debug : false }
	
var aBonuses = [
	"agi",
	"csm",
	"con",
	"dex",
	"int",
	"prc",
	"psy",
	"str",
	"wil",
	"carpentry",
	"cooking",
	"explore",
	"farming",
	"lore",
	"masonry",
	"melee",
	"ranged",
	"sewing",
	"smithing",
	"stealth",
	"survive",
	"unarmed"
]