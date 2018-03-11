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

var ItemReferenceList = { 
	"Common Metal" : [
		"-tin",
		"-castiron",
		"-wroughtiron",
		"-steel",
		"-bronze",
		"-copper"
	],

	"Hard Metal" : [
		"-castiron",
		"-wroughtiron",
		"-steel",
		"-bronze"
	],

	"String" : [
		"cattailfibre",
		"flaxfibre",
		"hempfibre",
		"hidestrap",
		"silkthread",
		"spindlytaproot",
		"strawstring",
		"yarn-",
		"stingingnettle"
	],

	"Cloth" : [
		"hempcloth",
		"linencloth",
		"silkcloth",
		"leatherfabric",
		"woolcloth",
		"mohair"
	],

	"Stone" : [
		"basalt",
		"catgold",
		"cinnabar",
		"dolomite",
		"feldspar",
		"flint",
		"gneiss",
		"granite",
		"hornblende",
		"limestone",
		"marble",
		"porphyry",
		"quartz",
		"sandstone",
		"schist",
		"rockcrystal"
	],

	"Ore" : [
		"cassiterite",
		"chalcopyrite",
		"malachite",
		"ilmenite",
		"limonite",
		"hematite",
		"magnetite",
		"galena",
		"argentite",
		"hornsilver",
		"petzite",
		"sylvanite",
		"nagyagite",
		"slag"
	],

	"Fine Clay" : [
		"clay-cave",
		"clay-pit"
	],

	"Fine bones" : [
		"beartooth",
		"boartusk",
		"borewormbeak",
		"crabshell",
		"flipperbone",
		"lynxclaws",
		"mammothtusk",
		"antlers-moose",
		"antlers-reddeer",
		"walrustusk",
		"wildgoathorn",
		"wishbone",
	],

	"Flower" : [
		"bloodstern",
		"cavebulb",
		"chimingbluebell",
		"clover",
		"dandelion",
		"edelweiss",
		"frogscrown",
		"flower-poppy",
		"stingingnettle",
		"thornythistle",
		"snapdragon"
	],


	}